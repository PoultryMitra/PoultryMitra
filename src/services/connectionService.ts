import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Interface for farmer-dealer connections
export interface Connection {
  id?: string;
  farmerId: string;
  dealerId: string;
  farmerName: string;
  farmerEmail: string;
  dealerName?: string;
  dealerEmail?: string;
  connectionDate: Timestamp;
  status: 'active' | 'inactive' | 'pending';
  inviteCode?: string;
}

// Interface for farmer data in dealer's system
export interface DealerFarmerData {
  id?: string;
  connectionId: string;
  dealerId: string;
  farmerId: string;
  farmerName: string;
  farmerEmail: string;
  chicksReceived: number;
  feedConsumption: number;
  mortalityRate: number;
  currentWeight: number;
  fcr: number;
  totalExpenses: number;
  totalIncome: number;
  accountBalance: number;
  lastUpdated: Timestamp;
}

// Interface for dealer data in farmer's system  
export interface FarmerDealerData {
  id?: string;
  connectionId: string;
  farmerId: string;
  dealerId: string;
  dealerName: string;
  dealerEmail: string;
  dealerCompany?: string;
  dealerPhone?: string;
  dealerAddress?: string;
  connectedDate: Timestamp;
  lastInteraction: Timestamp;
}

// Create invitation code and store in database
export const createInvitationCode = async (dealerId: string, dealerName: string, dealerEmail: string): Promise<string> => {
  try {
    const inviteCode = `dealer-${dealerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store invitation in Firebase
    await addDoc(collection(db, 'dealerInvitations'), {
      inviteCode,
      dealerId,
      dealerName,
      dealerEmail,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true,
      usedBy: null,
      usedAt: null
    });
    
    console.log('Invitation code created and stored:', inviteCode);
    return inviteCode;
  } catch (error) {
    console.error('Error creating invitation code:', error);
    throw error;
  }
};

// Validate invitation code
export const validateInvitationCode = async (inviteCode: string): Promise<{valid: boolean, data?: any}> => {
  try {
    const q = query(
      collection(db, 'dealerInvitations'),
      where('inviteCode', '==', inviteCode),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { valid: false };
    }
    
    const invitation = snapshot.docs[0];
    const data = invitation.data();
    
    // Check if expired
    const now = new Date();
    const expiresAt = data.expiresAt.toDate();
    
    if (now > expiresAt) {
      // Mark as inactive
      await updateDoc(doc(db, 'dealerInvitations', invitation.id), {
        isActive: false
      });
      return { valid: false };
    }
    
    return { 
      valid: true, 
      data: {
        dealerId: data.dealerId,
        dealerName: data.dealerName,
        dealerEmail: data.dealerEmail,
        invitationId: invitation.id
      }
    };
  } catch (error) {
    console.error('Error validating invitation code:', error);
    return { valid: false };
  }
};

// Connect farmer to dealer network
export const connectFarmerToDealer = async (
  farmerId: string,
  farmerName: string,
  farmerEmail: string,
  dealerId: string,
  dealerName: string,
  dealerEmail: string,
  inviteCode: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // 1. Create connection record
    const connectionRef = doc(collection(db, 'connections'));
    const connectionData: Omit<Connection, 'id'> = {
      farmerId,
      dealerId,
      farmerName,
      farmerEmail,
      dealerName,
      dealerEmail,
      connectionDate: Timestamp.now(),
      status: 'active',
      inviteCode
    };
    batch.set(connectionRef, connectionData);
    
    // 2. Add farmer to dealer's farmer list
    const dealerFarmerRef = doc(collection(db, 'dealerFarmers'));
    const dealerFarmerData: Omit<DealerFarmerData, 'id'> = {
      connectionId: connectionRef.id,
      dealerId,
      farmerId,
      farmerName,
      farmerEmail,
      chicksReceived: 0,
      feedConsumption: 0,
      mortalityRate: 0,
      currentWeight: 0,
      fcr: 0,
      totalExpenses: 0,
      totalIncome: 0,
      accountBalance: 0,
      lastUpdated: Timestamp.now()
    };
    batch.set(dealerFarmerRef, dealerFarmerData);
    
    // 3. Add dealer to farmer's dealer list
    const farmerDealerRef = doc(collection(db, 'farmerDealers'));
    const farmerDealerData: Omit<FarmerDealerData, 'id'> = {
      connectionId: connectionRef.id,
      farmerId,
      dealerId,
      dealerName,
      dealerEmail,
      connectedDate: Timestamp.now(),
      lastInteraction: Timestamp.now()
    };
    batch.set(farmerDealerRef, farmerDealerData);
    
    // 4. Mark invitation as used
    const invitationQuery = query(
      collection(db, 'dealerInvitations'),
      where('inviteCode', '==', inviteCode)
    );
    const invitationSnapshot = await getDocs(invitationQuery);
    
    if (!invitationSnapshot.empty) {
      const invitationRef = doc(db, 'dealerInvitations', invitationSnapshot.docs[0].id);
      batch.update(invitationRef, {
        isActive: false,
        usedBy: farmerId,
        usedAt: serverTimestamp()
      });
    }
    
    // Commit all operations
    await batch.commit();
    
    console.log('Farmer-dealer connection established successfully');
  } catch (error) {
    console.error('Error connecting farmer to dealer:', error);
    throw error;
  }
};

// Get farmer's connected dealers
export const getFarmerDealers = (
  farmerId: string,
  callback: (dealers: FarmerDealerData[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'farmerDealers'),
    where('farmerId', '==', farmerId),
    orderBy('connectedDate', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const dealers: FarmerDealerData[] = [];
    snapshot.forEach((doc) => {
      dealers.push({ id: doc.id, ...doc.data() } as FarmerDealerData);
    });
    callback(dealers);
  });

  return unsubscribe;
};

// Get dealer's connected farmers
export const getDealerFarmers = (
  dealerId: string,
  callback: (farmers: DealerFarmerData[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'dealerFarmers'),
    where('dealerId', '==', dealerId),
    orderBy('lastUpdated', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const farmers: DealerFarmerData[] = [];
    snapshot.forEach((doc) => {
      farmers.push({ id: doc.id, ...doc.data() } as DealerFarmerData);
    });
    callback(farmers);
  });

  return unsubscribe;
};

// Update farmer data in dealer's system
export const updateFarmerInDealerSystem = async (
  dealerFarmerId: string,
  updates: Partial<Omit<DealerFarmerData, 'id' | 'connectionId' | 'dealerId' | 'farmerId'>>
): Promise<void> => {
  try {
    const farmerRef = doc(db, 'dealerFarmers', dealerFarmerId);
    await updateDoc(farmerRef, {
      ...updates,
      lastUpdated: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating farmer data:', error);
    throw error;
  }
};

// Update dealer data in farmer's system
export const updateDealerInFarmerSystem = async (
  farmerDealerId: string,
  updates: Partial<Omit<FarmerDealerData, 'id' | 'connectionId' | 'farmerId' | 'dealerId'>>
): Promise<void> => {
  try {
    const dealerRef = doc(db, 'farmerDealers', farmerDealerId);
    await updateDoc(dealerRef, {
      ...updates,
      lastInteraction: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating dealer data:', error);
    throw error;
  }
};

// Get all connections (for admin purposes)
export const getAllConnections = (
  callback: (connections: Connection[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'connections'),
    orderBy('connectionDate', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const connections: Connection[] = [];
    snapshot.forEach((doc) => {
      connections.push({ id: doc.id, ...doc.data() } as Connection);
    });
    callback(connections);
  });

  return unsubscribe;
};

// Disconnect farmer and dealer
export const disconnectFarmerFromDealer = async (
  connectionId: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // 1. Update connection status
    const connectionRef = doc(db, 'connections', connectionId);
    batch.update(connectionRef, {
      status: 'inactive',
      disconnectedAt: serverTimestamp()
    });
    
    // 2. Find and remove dealer-farmer record
    const dealerFarmerQuery = query(
      collection(db, 'dealerFarmers'),
      where('connectionId', '==', connectionId)
    );
    const dealerFarmerSnapshot = await getDocs(dealerFarmerQuery);
    dealerFarmerSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // 3. Find and remove farmer-dealer record
    const farmerDealerQuery = query(
      collection(db, 'farmerDealers'),
      where('connectionId', '==', connectionId)
    );
    const farmerDealerSnapshot = await getDocs(farmerDealerQuery);
    farmerDealerSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('Farmer-dealer disconnection completed');
  } catch (error) {
    console.error('Error disconnecting farmer from dealer:', error);
    throw error;
  }
};
