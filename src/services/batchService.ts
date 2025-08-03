import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Batch {
  id?: string;
  batchNumber: string;
  startDate: Date;
  status: 'active' | 'completed' | 'sold';
  initialBirds: number;
  currentBirds: number;
  mortality: number;
  feedUsed: number; // in kg
  avgWeight: number; // in kg
  fcr: number; // calculated field
  farmerId: string;
  farmerName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchMetrics {
  totalBatches: number;
  totalBirds: number;
  averageFCR: number;
  mortalityRate: number;
  activeBatches: number;
  completedBatches: number;
}

export interface BatchPerformanceData {
  age: number; // days
  weight: number;
  feedConsumed: number;
  mortality: number;
  fcr: number;
  recordedAt: Date;
}

class BatchService {
  private batchCollection = collection(db, 'batches');
  private performanceCollection = collection(db, 'batchPerformance');

  // Generate batch number automatically
  generateBatchNumber(farmerId: string): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-4);
    return `${farmerId.slice(0, 3).toUpperCase()}-${year}-${timestamp}`;
  }

  // Calculate FCR (Feed Conversion Ratio)
  calculateFCR(feedUsed: number, totalWeight: number): number {
    if (totalWeight === 0) return 0;
    return Number((feedUsed / totalWeight).toFixed(2));
  }

  // Calculate mortality rate
  calculateMortalityRate(mortality: number, initialBirds: number): number {
    if (initialBirds === 0) return 0;
    return Number(((mortality / initialBirds) * 100).toFixed(2));
  }

  // Calculate age in days
  calculateAge(startDate: Date): number {
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // Create new batch
  async createBatch(batchData: Omit<Batch, 'id' | 'createdAt' | 'updatedAt' | 'fcr'>): Promise<string> {
    try {
      const now = new Date();
      const totalWeight = batchData.currentBirds * batchData.avgWeight;
      const fcr = this.calculateFCR(batchData.feedUsed, totalWeight);

      const batch: Omit<Batch, 'id'> = {
        ...batchData,
        fcr,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(this.batchCollection, {
        ...batch,
        startDate: Timestamp.fromDate(batch.startDate),
        createdAt: Timestamp.fromDate(batch.createdAt),
        updatedAt: Timestamp.fromDate(batch.updatedAt)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw new Error('Failed to create batch');
    }
  }

  // Update existing batch
  async updateBatch(batchId: string, updates: Partial<Batch>): Promise<void> {
    try {
      const batchRef = doc(this.batchCollection, batchId);
      
      // Recalculate FCR if relevant fields are updated
      if (updates.feedUsed !== undefined || updates.avgWeight !== undefined || updates.currentBirds !== undefined) {
        const currentBatch = await this.getBatchById(batchId);
        if (currentBatch) {
          const feedUsed = updates.feedUsed ?? currentBatch.feedUsed;
          const avgWeight = updates.avgWeight ?? currentBatch.avgWeight;
          const currentBirds = updates.currentBirds ?? currentBatch.currentBirds;
          const totalWeight = currentBirds * avgWeight;
          updates.fcr = this.calculateFCR(feedUsed, totalWeight);
        }
      }

      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Convert Date fields to Timestamp
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }

      await updateDoc(batchRef, updateData);
    } catch (error) {
      console.error('Error updating batch:', error);
      throw new Error('Failed to update batch');
    }
  }

  // Delete batch
  async deleteBatch(batchId: string): Promise<void> {
    try {
      const batchRef = doc(this.batchCollection, batchId);
      await deleteDoc(batchRef);
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw new Error('Failed to delete batch');
    }
  }

  // Get batch by ID
  async getBatchById(batchId: string): Promise<Batch | null> {
    try {
      const batchRef = doc(this.batchCollection, batchId);
      const batchSnap = await getDoc(batchRef);
      
      if (batchSnap.exists()) {
        const data = batchSnap.data();
        return {
          id: batchSnap.id,
          ...data,
          startDate: data.startDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Batch;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting batch:', error);
      throw new Error('Failed to get batch');
    }
  }

  // Get all batches for a farmer
  async getBatchesByFarmer(farmerId: string): Promise<Batch[]> {
    try {
      const q = query(
        this.batchCollection,
        where('farmerId', '==', farmerId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const batches: Batch[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        batches.push({
          id: doc.id,
          ...data,
          startDate: data.startDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Batch);
      });
      
      return batches;
    } catch (error) {
      console.error('Error getting batches:', error);
      throw new Error('Failed to get batches');
    }
  }

  // Get active batches for a farmer
  async getActiveBatches(farmerId: string): Promise<Batch[]> {
    try {
      const q = query(
        this.batchCollection,
        where('farmerId', '==', farmerId),
        where('status', '==', 'active'),
        orderBy('startDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const batches: Batch[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        batches.push({
          id: doc.id,
          ...data,
          startDate: data.startDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Batch);
      });
      
      return batches;
    } catch (error) {
      console.error('Error getting active batches:', error);
      throw new Error('Failed to get active batches');
    }
  }

  // Calculate batch metrics for a farmer
  async getBatchMetrics(farmerId: string): Promise<BatchMetrics> {
    try {
      const batches = await this.getBatchesByFarmer(farmerId);
      
      const totalBatches = batches.length;
      const totalBirds = batches.reduce((sum, batch) => sum + batch.currentBirds, 0);
      const activeBatches = batches.filter(batch => batch.status === 'active').length;
      const completedBatches = batches.filter(batch => batch.status === 'completed').length;
      
      // Calculate average FCR
      const totalFCR = batches.reduce((sum, batch) => sum + batch.fcr, 0);
      const averageFCR = totalBatches > 0 ? Number((totalFCR / totalBatches).toFixed(2)) : 0;
      
      // Calculate overall mortality rate
      const totalInitialBirds = batches.reduce((sum, batch) => sum + batch.initialBirds, 0);
      const totalMortality = batches.reduce((sum, batch) => sum + batch.mortality, 0);
      const mortalityRate = totalInitialBirds > 0 ? 
        Number(((totalMortality / totalInitialBirds) * 100).toFixed(2)) : 0;
      
      return {
        totalBatches,
        totalBirds,
        averageFCR,
        mortalityRate,
        activeBatches,
        completedBatches
      };
    } catch (error) {
      console.error('Error calculating batch metrics:', error);
      throw new Error('Failed to calculate batch metrics');
    }
  }

  // Record batch performance data
  async recordPerformance(batchId: string, performanceData: Omit<BatchPerformanceData, 'recordedAt'>): Promise<void> {
    try {
      const performanceRecord = {
        batchId,
        ...performanceData,
        recordedAt: Timestamp.fromDate(new Date())
      };

      await addDoc(this.performanceCollection, performanceRecord);
    } catch (error) {
      console.error('Error recording performance:', error);
      throw new Error('Failed to record performance data');
    }
  }

  // Get performance history for a batch
  async getBatchPerformanceHistory(batchId: string): Promise<BatchPerformanceData[]> {
    try {
      const q = query(
        this.performanceCollection,
        where('batchId', '==', batchId),
        orderBy('recordedAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const performance: BatchPerformanceData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        performance.push({
          ...data,
          recordedAt: data.recordedAt.toDate()
        } as BatchPerformanceData);
      });
      
      return performance;
    } catch (error) {
      console.error('Error getting performance history:', error);
      throw new Error('Failed to get performance history');
    }
  }

  // Update batch status
  async updateBatchStatus(batchId: string, status: Batch['status']): Promise<void> {
    try {
      await this.updateBatch(batchId, { status });
    } catch (error) {
      console.error('Error updating batch status:', error);
      throw new Error('Failed to update batch status');
    }
  }

  // Get batch summary for dashboard
  async getBatchSummary(farmerId: string): Promise<{
    batches: Batch[];
    metrics: BatchMetrics;
  }> {
    try {
      const [batches, metrics] = await Promise.all([
        this.getBatchesByFarmer(farmerId),
        this.getBatchMetrics(farmerId)
      ]);

      return { batches, metrics };
    } catch (error) {
      console.error('Error getting batch summary:', error);
      throw new Error('Failed to get batch summary');
    }
  }
}

export const batchService = new BatchService();
