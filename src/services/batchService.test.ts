import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
import { batchService, Batch, BatchMetrics } from './batchService';

// Mock Firebase
vi.mock('firebase/firestore');
vi.mock('@/lib/firebase', () => ({
  db: {}
}));

const mockAddDoc = vi.mocked(addDoc);
const mockUpdateDoc = vi.mocked(updateDoc);
const mockDeleteDoc = vi.mocked(deleteDoc);
const mockGetDoc = vi.mocked(getDoc);
const mockGetDocs = vi.mocked(getDocs);
const mockDoc = vi.mocked(doc);
const mockCollection = vi.mocked(collection);
const mockQuery = vi.mocked(query);
const mockWhere = vi.mocked(where);
const mockOrderBy = vi.mocked(orderBy);

describe('BatchService', () => {
  const mockFarmerId = 'farmer123';
  const mockFarmerName = 'John Farmer';
  
  const mockBatchData: Omit<Batch, 'id' | 'createdAt' | 'updatedAt' | 'fcr'> = {
    batchNumber: 'FAR-2025-001',
    startDate: new Date('2025-01-01'),
    status: 'active',
    initialBirds: 1000,
    currentBirds: 950,
    mortality: 50,
    feedUsed: 1500,
    avgWeight: 1.8,
    farmerId: mockFarmerId,
    farmerName: mockFarmerName,
    notes: 'Test batch'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCollection.mockReturnValue({} as any);
    mockQuery.mockReturnValue({} as any);
    mockWhere.mockReturnValue({} as any);
    mockOrderBy.mockReturnValue({} as any);
    mockDoc.mockReturnValue({} as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('generateBatchNumber', () => {
    it('should generate a unique batch number', () => {
      const batchNumber = batchService.generateBatchNumber(mockFarmerId);
      
      expect(batchNumber).toMatch(/^FAR-2025-\d{4}$/);
      expect(batchNumber).toContain('2025');
      expect(batchNumber.length).toBe(13);
    });

    it('should generate different batch numbers for different calls', () => {
      const batchNumber1 = batchService.generateBatchNumber(mockFarmerId);
      const batchNumber2 = batchService.generateBatchNumber(mockFarmerId);
      
      expect(batchNumber1).not.toBe(batchNumber2);
    });
  });

  describe('calculateFCR', () => {
    it('should calculate FCR correctly', () => {
      const fcr = batchService.calculateFCR(1500, 1710); // 950 birds * 1.8kg
      expect(fcr).toBe(0.88);
    });

    it('should return 0 when total weight is 0', () => {
      const fcr = batchService.calculateFCR(1500, 0);
      expect(fcr).toBe(0);
    });

    it('should handle decimal precision correctly', () => {
      const fcr = batchService.calculateFCR(1234.56, 789.12);
      expect(fcr).toBe(1.56);
    });
  });

  describe('calculateMortalityRate', () => {
    it('should calculate mortality rate correctly', () => {
      const rate = batchService.calculateMortalityRate(50, 1000);
      expect(rate).toBe(5.00);
    });

    it('should return 0 when initial birds is 0', () => {
      const rate = batchService.calculateMortalityRate(50, 0);
      expect(rate).toBe(0);
    });

    it('should handle decimal precision correctly', () => {
      const rate = batchService.calculateMortalityRate(33, 1000);
      expect(rate).toBe(3.30);
    });
  });

  describe('calculateAge', () => {
    it('should calculate age in days correctly', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // 30 days ago
      
      const age = batchService.calculateAge(startDate);
      expect(age).toBe(30);
    });

    it('should return 0 for today\'s date', () => {
      const today = new Date();
      const age = batchService.calculateAge(today);
      expect(age).toBe(0);
    });

    it('should handle future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      
      const age = batchService.calculateAge(futureDate);
      expect(age).toBe(-5);
    });
  });

  describe('createBatch', () => {
    it('should create a batch successfully', async () => {
      const mockDocRef = { id: 'batch123' };
      mockAddDoc.mockResolvedValueOnce(mockDocRef as any);

      const batchId = await batchService.createBatch(mockBatchData);

      expect(batchId).toBe('batch123');
      expect(mockAddDoc).toHaveBeenCalledOnce();
      
      const callArgs = mockAddDoc.mock.calls[0][1];
      expect(callArgs).toMatchObject({
        batchNumber: mockBatchData.batchNumber,
        farmerId: mockFarmerId,
        farmerName: mockFarmerName,
        initialBirds: 1000,
        currentBirds: 950,
        mortality: 50,
        feedUsed: 1500,
        avgWeight: 1.8,
        fcr: 0.88, // Calculated FCR
        status: 'active'
      });
    });

    it('should throw error when addDoc fails', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(batchService.createBatch(mockBatchData))
        .rejects.toThrow('Failed to create batch');
    });
  });

  describe('updateBatch', () => {
    it('should update batch successfully', async () => {
      const mockBatch = {
        ...mockBatchData,
        id: 'batch123',
        fcr: 0.88,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          ...mockBatch,
          startDate: Timestamp.fromDate(mockBatch.startDate),
          createdAt: Timestamp.fromDate(mockBatch.createdAt),
          updatedAt: Timestamp.fromDate(mockBatch.updatedAt)
        }),
        id: 'batch123'
      } as any);

      const updates = { feedUsed: 1600, avgWeight: 2.0 };
      
      await batchService.updateBatch('batch123', updates);

      expect(mockUpdateDoc).toHaveBeenCalledOnce();
      const callArgs = mockUpdateDoc.mock.calls[0][1] as any;
      expect(callArgs.feedUsed).toBe(1600);
      expect(callArgs.avgWeight).toBe(2.0);
      expect(callArgs.fcr).toBe(0.84); // Recalculated FCR: 1600 / (950 * 2.0)
    });

    it('should throw error when updateDoc fails', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(batchService.updateBatch('batch123', { notes: 'Updated' }))
        .rejects.toThrow('Failed to update batch');
    });
  });

  describe('getBatchById', () => {
    it('should return batch when it exists', async () => {
      const mockBatch = {
        ...mockBatchData,
        fcr: 0.88,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          ...mockBatch,
          startDate: Timestamp.fromDate(mockBatch.startDate),
          createdAt: Timestamp.fromDate(mockBatch.createdAt),
          updatedAt: Timestamp.fromDate(mockBatch.updatedAt)
        }),
        id: 'batch123'
      } as any);

      const result = await batchService.getBatchById('batch123');

      expect(result).toMatchObject({
        id: 'batch123',
        batchNumber: mockBatchData.batchNumber,
        farmerId: mockFarmerId,
        fcr: 0.88
      });
      expect(result?.startDate).toBeInstanceOf(Date);
    });

    it('should return null when batch does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false
      } as any);

      const result = await batchService.getBatchById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getBatchesByFarmer', () => {
    it('should return batches for a farmer', async () => {
      const mockBatches = [
        {
          ...mockBatchData,
          fcr: 0.88,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          ...mockBatchData,
          batchNumber: 'FAR-2025-002',
          fcr: 1.2,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockQuerySnapshot = {
        forEach: (callback: any) => {
          mockBatches.forEach((batch, index) => {
            callback({
              id: `batch${index + 1}`,
              data: () => ({
                ...batch,
                startDate: Timestamp.fromDate(batch.startDate),
                createdAt: Timestamp.fromDate(batch.createdAt),
                updatedAt: Timestamp.fromDate(batch.updatedAt)
              })
            });
          });
        }
      };

      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot as any);

      const result = await batchService.getBatchesByFarmer(mockFarmerId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('batch1');
      expect(result[1].id).toBe('batch2');
      expect(result[0].batchNumber).toBe('FAR-2025-001');
      expect(result[1].batchNumber).toBe('FAR-2025-002');
    });

    it('should return empty array when no batches found', async () => {
      const mockQuerySnapshot = {
        forEach: () => {} // No batches
      };

      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot as any);

      const result = await batchService.getBatchesByFarmer(mockFarmerId);
      expect(result).toHaveLength(0);
    });
  });

  describe('getBatchMetrics', () => {
    it('should calculate metrics correctly', async () => {
      const mockBatches = [
        {
          ...mockBatchData,
          id: 'batch1',
          status: 'active' as const,
          initialBirds: 1000,
          currentBirds: 950,
          mortality: 50,
          fcr: 1.5
        },
        {
          ...mockBatchData,
          id: 'batch2',
          status: 'completed' as const,
          initialBirds: 1200,
          currentBirds: 1150,
          mortality: 50,
          fcr: 1.3
        }
      ];

      // Mock getBatchesByFarmer to return the mock batches
      vi.spyOn(batchService, 'getBatchesByFarmer').mockResolvedValueOnce(mockBatches as any);

      const metrics = await batchService.getBatchMetrics(mockFarmerId);

      expect(metrics).toEqual({
        totalBatches: 2,
        totalBirds: 2100, // 950 + 1150
        averageFCR: 1.40, // (1.5 + 1.3) / 2
        mortalityRate: 4.55, // (50 + 50) / (1000 + 1200) * 100
        activeBatches: 1,
        completedBatches: 1
      });
    });

    it('should handle empty batches array', async () => {
      vi.spyOn(batchService, 'getBatchesByFarmer').mockResolvedValueOnce([]);

      const metrics = await batchService.getBatchMetrics(mockFarmerId);

      expect(metrics).toEqual({
        totalBatches: 0,
        totalBirds: 0,
        averageFCR: 0,
        mortalityRate: 0,
        activeBatches: 0,
        completedBatches: 0
      });
    });
  });

  describe('deleteBatch', () => {
    it('should delete batch successfully', async () => {
      mockDeleteDoc.mockResolvedValueOnce(undefined);

      await batchService.deleteBatch('batch123');

      expect(mockDeleteDoc).toHaveBeenCalledOnce();
    });

    it('should throw error when deleteDoc fails', async () => {
      mockDeleteDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(batchService.deleteBatch('batch123'))
        .rejects.toThrow('Failed to delete batch');
    });
  });

  describe('updateBatchStatus', () => {
    it('should update batch status successfully', async () => {
      const updateSpy = vi.spyOn(batchService, 'updateBatch').mockResolvedValueOnce();

      await batchService.updateBatchStatus('batch123', 'completed');

      expect(updateSpy).toHaveBeenCalledWith('batch123', { status: 'completed' });
    });
  });

  describe('getBatchSummary', () => {
    it('should return batches and metrics', async () => {
      const mockBatches = [{ id: 'batch1' }] as any;
      const mockMetrics = { totalBatches: 1 } as any;

      const getBatchesSpy = vi.spyOn(batchService, 'getBatchesByFarmer')
        .mockResolvedValueOnce(mockBatches);
      const getMetricsSpy = vi.spyOn(batchService, 'getBatchMetrics')
        .mockResolvedValueOnce(mockMetrics);

      const result = await batchService.getBatchSummary(mockFarmerId);

      expect(result).toEqual({
        batches: mockBatches,
        metrics: mockMetrics
      });
      expect(getBatchesSpy).toHaveBeenCalledWith(mockFarmerId);
      expect(getMetricsSpy).toHaveBeenCalledWith(mockFarmerId);
    });
  });
});
