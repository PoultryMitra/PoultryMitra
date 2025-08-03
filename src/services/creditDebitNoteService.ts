import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  updateDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CreditDebitNote {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: 'Feed' | 'Medicine' | 'Chicks' | 'Payment' | 'Other';
  status: 'pending' | 'approved' | 'rejected';
  
  // User information
  farmerId: string;
  farmerName: string;
  dealerId: string;
  dealerName: string;
  
  // Reference information
  referenceOrderId?: string;
  attachments: string[];
  notes?: string;
  
  // Approval workflow
  createdBy: string;
  createdByRole: 'farmer' | 'dealer';
  approvedBy?: string;
  approvedByRole?: 'farmer' | 'dealer';
  approverNotes?: string;
  
  // Timestamps
  createdAt: Timestamp;
  approvedAt?: Timestamp;
  
  // Accounting integration
  isProcessed: boolean;
  transactionId?: string;
}

export interface CreditDebitNoteInput {
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: 'Feed' | 'Medicine' | 'Chicks' | 'Payment' | 'Other';
  referenceOrderId?: string;
  attachments?: string[];
  notes?: string;
  targetUserId?: string;
  targetUserName?: string;
}

export interface CreditDebitNoteStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  pendingAmount: number;
  approvedAmount: number;
  recentNotes: CreditDebitNote[];
}

class CreditDebitNoteService {
  // Create a new credit/debit note
  async createNote(
    currentUserId: string,
    userRole: 'farmer' | 'dealer',
    noteData: CreditDebitNoteInput
  ): Promise<string> {
    try {
      console.log('📝 Creating credit/debit note:', { currentUserId, userRole, noteData });
      
      const noteRef = collection(db, 'creditDebitNotes');
      
      // Determine farmer and dealer IDs based on user role
      let farmerId = currentUserId;
      let farmerName = noteData.targetUserName || 'Unknown Farmer';
      let dealerId = noteData.targetUserId || '';
      let dealerName = 'Unknown Dealer';
      
      if (userRole === 'dealer') {
        dealerId = currentUserId;
        dealerName = noteData.targetUserName || 'Current Dealer';
        farmerId = noteData.targetUserId || '';
        farmerName = 'Unknown Farmer';
      }
      
      const docRef = await addDoc(noteRef, {
        type: noteData.type,
        amount: noteData.amount,
        description: noteData.description,
        category: noteData.category,
        status: 'pending',
        
        farmerId,
        farmerName,
        dealerId,
        dealerName,
        
        referenceOrderId: noteData.referenceOrderId || null,
        attachments: noteData.attachments || [],
        notes: noteData.notes || null,
        
        createdBy: currentUserId,
        createdByRole: userRole,
        
        createdAt: Timestamp.now(),
        isProcessed: false
      });
      
      console.log('✅ Credit/debit note created:', docRef.id);
      return docRef.id;
      
    } catch (error) {
      console.error('❌ Error creating credit/debit note:', error);
      throw error;
    }
  }

  // Subscribe to credit/debit notes for a user
  subscribeToNotes(
    userId: string,
    userRole: 'farmer' | 'dealer',
    callback: (notes: CreditDebitNote[]) => void
  ): () => void {
    console.log('🔄 Subscribing to credit/debit notes:', { userId, userRole });
    
    // Build query based on user role
    const noteCollection = collection(db, 'creditDebitNotes');
    let q;
    
    if (userRole === 'farmer') {
      // Farmer sees notes where they are the farmer
      q = query(
        noteCollection,
        where('farmerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Dealer sees notes where they are the dealer
      q = query(
        noteCollection,
        where('dealerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes: CreditDebitNote[] = [];
      snapshot.forEach((doc) => {
        notes.push({ id: doc.id, ...doc.data() } as CreditDebitNote);
      });
      
      console.log('📊 Credit/debit notes updated:', notes.length);
      callback(notes);
    }, (error) => {
      console.error('❌ Error subscribing to credit/debit notes:', error);
      callback([]); // Return empty array on error
    });
    
    return unsubscribe;
  }

  // Update note status (approval workflow)
  async updateNoteStatus(
    noteId: string,
    status: 'approved' | 'rejected',
    approverNotes?: string
  ): Promise<void> {
    try {
      console.log('🔄 Updating note status:', { noteId, status, approverNotes });
      
      const noteRef = doc(db, 'creditDebitNotes', noteId);
      
      // Get current note data to verify it exists
      const noteDoc = await getDoc(noteRef);
      if (!noteDoc.exists()) {
        throw new Error('Credit/debit note not found');
      }
      
      const updateData: any = {
        status,
        approverNotes: approverNotes || null
      };
      
      if (status === 'approved') {
        updateData.approvedAt = Timestamp.now();
      }
      
      await updateDoc(noteRef, updateData);
      
      // If approved, create accounting transaction
      if (status === 'approved') {
        await this.processApprovedNote(noteId);
      }
      
      console.log('✅ Note status updated:', { noteId, status });
      
    } catch (error) {
      console.error('❌ Error updating note status:', error);
      throw error;
    }
  }

  // Process approved note by creating accounting transaction
  private async processApprovedNote(noteId: string): Promise<void> {
    try {
      const noteRef = doc(db, 'creditDebitNotes', noteId);
      const noteDoc = await getDoc(noteRef);
      
      if (!noteDoc.exists()) {
        throw new Error('Note not found');
      }
      
      const note = { id: noteDoc.id, ...noteDoc.data() } as CreditDebitNote;
      
      // Create farmer transaction
      const transactionRef = collection(db, 'farmerTransactions');
      const transactionDoc = await addDoc(transactionRef, {
        farmerId: note.farmerId,
        dealerId: note.dealerId,
        dealerName: note.dealerName,
        transactionType: note.type,
        amount: note.amount,
        description: `${note.type === 'credit' ? 'Credit' : 'Debit'} Note: ${note.description}`,
        category: note.category,
        orderRequestId: note.referenceOrderId || null,
        creditDebitNoteId: noteId,
        date: Timestamp.now()
      });
      
      // Mark note as processed
      await updateDoc(noteRef, {
        isProcessed: true,
        transactionId: transactionDoc.id
      });
      
      console.log('✅ Approved note processed into transaction:', transactionDoc.id);
      
    } catch (error) {
      console.error('❌ Error processing approved note:', error);
      throw error;
    }
  }

  // Get statistics for credit/debit notes
  async getNoteStats(
    userId: string,
    userRole: 'farmer' | 'dealer'
  ): Promise<CreditDebitNoteStats> {
    try {
      console.log('📊 Getting credit/debit note stats:', { userId, userRole });
      
      return new Promise((resolve, reject) => {
        const noteCollection = collection(db, 'creditDebitNotes');
        let q;
        
        if (userRole === 'farmer') {
          q = query(
            noteCollection,
            where('farmerId', '==', userId),
            orderBy('createdAt', 'desc')
          );
        } else {
          q = query(
            noteCollection,
            where('dealerId', '==', userId),
            orderBy('createdAt', 'desc')
          );
        }
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const notes: CreditDebitNote[] = [];
          snapshot.forEach((doc) => {
            notes.push({ id: doc.id, ...doc.data() } as CreditDebitNote);
          });
          
          // Calculate statistics
          const stats: CreditDebitNoteStats = {
            totalPending: notes.filter(n => n.status === 'pending').length,
            totalApproved: notes.filter(n => n.status === 'approved').length,
            totalRejected: notes.filter(n => n.status === 'rejected').length,
            pendingAmount: notes
              .filter(n => n.status === 'pending')
              .reduce((sum, n) => sum + n.amount, 0),
            approvedAmount: notes
              .filter(n => n.status === 'approved')
              .reduce((sum, n) => sum + n.amount, 0),
            recentNotes: notes.slice(0, 5)
          };
          
          unsubscribe(); // One-time fetch
          resolve(stats);
        }, (error) => {
          console.error('❌ Error getting note stats:', error);
          reject(error);
        });
      });
      
    } catch (error) {
      console.error('❌ Error getting credit/debit note stats:', error);
      throw error;
    }
  }

  // Get notes by reference order
  async getNotesByOrderId(orderId: string): Promise<CreditDebitNote[]> {
    try {
      console.log('🔍 Getting notes by order ID:', orderId);
      
      return new Promise((resolve, reject) => {
        const q = query(
          collection(db, 'creditDebitNotes'),
          where('referenceOrderId', '==', orderId),
          orderBy('createdAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const notes: CreditDebitNote[] = [];
          snapshot.forEach((doc) => {
            notes.push({ id: doc.id, ...doc.data() } as CreditDebitNote);
          });
          
          unsubscribe(); // One-time fetch
          resolve(notes);
        }, (error) => {
          console.error('❌ Error getting notes by order ID:', error);
          reject(error);
        });
      });
      
    } catch (error) {
      console.error('❌ Error getting notes by order ID:', error);
      throw error;
    }
  }

  // Delete a note (soft delete by marking as rejected)
  async deleteNote(noteId: string, reason?: string): Promise<void> {
    try {
      console.log('🗑️ Deleting note:', { noteId, reason });
      
      await this.updateNoteStatus(noteId, 'rejected', reason || 'Note deleted');
      
      console.log('✅ Note deleted:', noteId);
      
    } catch (error) {
      console.error('❌ Error deleting note:', error);
      throw error;
    }
  }

  // Export notes to CSV/JSON format
  async exportNotes(
    userId: string,
    userRole: 'farmer' | 'dealer',
    format: 'csv' | 'json' = 'json'
  ): Promise<string> {
    try {
      console.log('📤 Exporting notes:', { userId, userRole, format });
      
      const stats = await this.getNoteStats(userId, userRole);
      const notes = stats.recentNotes; // This will be all notes from the subscription
      
      if (format === 'json') {
        return JSON.stringify(notes, null, 2);
      } else {
        // CSV format
        const headers = [
          'ID', 'Type', 'Amount', 'Description', 'Category', 
          'Status', 'Created Date', 'Approved Date', 'Reference Order'
        ];
        
        const csvRows = [
          headers.join(','),
          ...notes.map(note => [
            note.id,
            note.type,
            note.amount,
            `"${note.description}"`,
            note.category,
            note.status,
            note.createdAt.toDate().toISOString(),
            note.approvedAt?.toDate().toISOString() || '',
            note.referenceOrderId || ''
          ].join(','))
        ];
        
        return csvRows.join('\n');
      }
      
    } catch (error) {
      console.error('❌ Error exporting notes:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const creditDebitNoteService = new CreditDebitNoteService();
