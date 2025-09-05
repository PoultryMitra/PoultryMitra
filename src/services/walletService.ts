import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  Timestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface WalletBalance {
  id?: string;
  farmerId: string;
  dealerId: string;
  balance: number;
  lastUpdated: Timestamp;
  createdAt: Timestamp;
}

export interface Transaction {
  id?: string;
  farmerId: string;
  dealerId: string;
  amount: number;
  type: 'credit' | 'debit' | 'order_payment' | 'money_added' | 'refund';
  description: string;
  orderId?: string;
  createdAt: Timestamp;
  createdBy: string;
  status: 'completed' | 'pending' | 'failed';
  metadata?: {
    orderNumber?: string;
    productName?: string;
    quantity?: number;
  };
}

// Get wallet balance between farmer and dealer with caching
const balanceCache = new Map<string, { balance: number; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export async function getWalletBalance(farmerId: string, dealerId: string, useCache: boolean = true): Promise<number> {
  if (!farmerId || !dealerId) {
    throw new Error('Invalid farmerId or dealerId provided');
  }

  const walletId = `${farmerId}_${dealerId}`;
  
  // Check cache first
  if (useCache) {
    const cached = balanceCache.get(walletId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.balance;
    }
  }

  try {
    const walletRef = doc(db, 'wallets', walletId);
    const walletDoc = await getDoc(walletRef);
    
    let balance = 0;
    if (walletDoc.exists()) {
      balance = walletDoc.data().balance || 0;
    }
    
    // Update cache
    if (useCache) {
      balanceCache.set(walletId, { balance, timestamp: Date.now() });
    }
    
    return balance;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    throw new Error(`Failed to get wallet balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Initialize wallet if it doesn't exist
export async function initializeWallet(farmerId: string, dealerId: string): Promise<void> {
  try {
    const walletId = `${farmerId}_${dealerId}`;
    const walletRef = doc(db, 'wallets', walletId);
    const walletDoc = await getDoc(walletRef);
    
    if (!walletDoc.exists()) {
      await setDoc(walletRef, {
        farmerId,
        dealerId,
        balance: 0,
        createdAt: Timestamp.now(),
        lastUpdated: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error initializing wallet:', error);
    throw error;
  }
}

// Add money to farmer's wallet with dealer
export async function addMoneyToWallet(
  farmerId: string,
  dealerId: string,
  amount: number,
  addedBy: string,
  description: string = 'Money added by dealer'
): Promise<string> {
  if (!farmerId || !dealerId || !addedBy) {
    throw new Error('Invalid parameters: farmerId, dealerId, and addedBy are required');
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  if (amount > 1000000) {
    throw new Error('Amount exceeds maximum limit of ₹10,00,000');
  }

  const walletId = `${farmerId}_${dealerId}`;
  
  try {

    const walletId = `${farmerId}_${dealerId}`;
    const walletRef = doc(db, 'wallets', walletId);
    
    // Initialize wallet if it doesn't exist
    await initializeWallet(farmerId, dealerId);
    
    // Use batch for atomic operation
    const batch = writeBatch(db);
    
    // Update wallet balance
    batch.update(walletRef, {
      balance: increment(amount),
      lastUpdated: Timestamp.now()
    });
    
    // Create transaction record
    const transactionRef = doc(collection(db, 'transactions'));
    const transaction: Omit<Transaction, 'id'> = {
      farmerId,
      dealerId,
      amount,
      type: 'credit',
      description,
      createdAt: Timestamp.now(),
      createdBy: addedBy,
      status: 'completed'
    };
    
    batch.set(transactionRef, transaction);
    
    await batch.commit();
    
    // Invalidate cache
    balanceCache.delete(walletId);
    
    return transactionRef.id;
  } catch (error) {
    console.error('Error adding money to wallet:', error);
    throw new Error(`Failed to add money to wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Deduct money from farmer's wallet for order
export async function deductFromWallet(
  farmerId: string,
  dealerId: string,
  amount: number,
  orderId: string,
  description: string = 'Order payment',
  metadata?: Transaction['metadata']
): Promise<string> {
  if (!farmerId || !dealerId || !orderId) {
    throw new Error('Invalid parameters: farmerId, dealerId, and orderId are required');
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const walletId = `${farmerId}_${dealerId}`;
  
  try {
    // Get current balance without cache to ensure accuracy
    const currentBalance = await getWalletBalance(farmerId, dealerId, false);
    
    if (currentBalance < amount) {
      throw new Error(`Insufficient balance. Current: ₹${currentBalance}, Required: ₹${amount}`);
    }
    
    const walletId = `${farmerId}_${dealerId}`;
    const walletRef = doc(db, 'wallets', walletId);
    
    // Use batch for atomic operation
    const batch = writeBatch(db);
    
    // Update wallet balance
    batch.update(walletRef, {
      balance: increment(-amount),
      lastUpdated: Timestamp.now()
    });
    
    // Create transaction record
    const transactionRef = doc(collection(db, 'transactions'));
    const transaction: Omit<Transaction, 'id'> = {
      farmerId,
      dealerId,
      amount: -amount,
      type: 'order_payment',
      description,
      orderId,
      createdAt: Timestamp.now(),
      createdBy: farmerId,
      status: 'completed',
      metadata
    };
    
    batch.set(transactionRef, transaction);
    
    await batch.commit();
    
    // Invalidate cache
    balanceCache.delete(walletId);
    
    return transactionRef.id;
  } catch (error) {
    console.error('Error deducting from wallet:', error);
    throw new Error(`Failed to deduct from wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Refund money to farmer's wallet
export async function refundToWallet(
  farmerId: string,
  dealerId: string,
  amount: number,
  orderId: string,
  refundedBy: string,
  description: string = 'Order refund'
): Promise<string> {
  try {
    if (amount <= 0) {
      throw new Error('Refund amount must be greater than 0');
    }

    const walletId = `${farmerId}_${dealerId}`;
    const walletRef = doc(db, 'wallets', walletId);
    
    // Initialize wallet if it doesn't exist
    await initializeWallet(farmerId, dealerId);
    
    // Use batch for atomic operation
    const batch = writeBatch(db);
    
    // Update wallet balance
    batch.update(walletRef, {
      balance: increment(amount),
      lastUpdated: Timestamp.now()
    });
    
    // Create transaction record
    const transactionRef = doc(collection(db, 'transactions'));
    const transaction: Omit<Transaction, 'id'> = {
      farmerId,
      dealerId,
      amount,
      type: 'refund',
      description,
      orderId,
      createdAt: Timestamp.now(),
      createdBy: refundedBy,
      status: 'completed'
    };
    
    batch.set(transactionRef, transaction);
    
    await batch.commit();
    return transactionRef.id;
  } catch (error) {
    console.error('Error refunding to wallet:', error);
    throw error;
  }
}

// Get transaction history
export async function getTransactionHistory(
  farmerId: string,
  dealerId: string,
  limit: number = 50
): Promise<Transaction[]> {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('farmerId', '==', farmerId),
      where('dealerId', '==', dealerId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw error;
  }
}

// Subscribe to transaction updates
export function subscribeToTransactions(
  farmerId: string,
  dealerId: string,
  callback: (transactions: Transaction[]) => void
): () => void {
  const q = query(
    collection(db, 'transactions'),
    where('farmerId', '==', farmerId),
    where('dealerId', '==', dealerId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
    callback(transactions);
  });
}

// Get all wallets for a dealer
export async function getDealerWallets(dealerId: string): Promise<WalletBalance[]> {
  try {
    const q = query(
      collection(db, 'wallets'),
      where('dealerId', '==', dealerId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WalletBalance));
  } catch (error) {
    console.error('Error getting dealer wallets:', error);
    throw error;
  }
}

// Subscribe to dealer wallets
export function subscribeToDealerWallets(
  dealerId: string,
  callback: (wallets: WalletBalance[]) => void
): () => void {
  const q = query(
    collection(db, 'wallets'),
    where('dealerId', '==', dealerId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const wallets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WalletBalance));
    callback(wallets);
  });
}

// Get farmer's wallet with specific dealer
export async function getFarmerWallet(farmerId: string, dealerId: string): Promise<WalletBalance | null> {
  try {
    const walletId = `${farmerId}_${dealerId}`;
    const walletRef = doc(db, 'wallets', walletId);
    const walletDoc = await getDoc(walletRef);
    
    if (!walletDoc.exists()) {
      return null;
    }
    
    return {
      id: walletDoc.id,
      ...walletDoc.data()
    } as WalletBalance;
  } catch (error) {
    console.error('Error getting farmer wallet:', error);
    throw error;
  }
}

// Get farmer's total balance across all dealers
export async function getFarmerTotalBalance(farmerId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'wallets'),
      where('farmerId', '==', farmerId)
    );
    
    const snapshot = await getDocs(q);
    let totalBalance = 0;
    
    snapshot.docs.forEach(doc => {
      const wallet = doc.data() as WalletBalance;
      totalBalance += wallet.balance || 0;
    });
    
    return totalBalance;
  } catch (error) {
    console.error('Error getting farmer total balance:', error);
    throw error;
  }
}

// Get wallet summary for dashboard
export async function getWalletSummary(userId: string, role: 'farmer' | 'dealer'): Promise<{
  totalBalance: number;
  totalTransactions: number;
  recentTransactions: Transaction[];
}> {
  try {
    let totalBalance = 0;
    let recentTransactions: Transaction[] = [];
    
    if (role === 'farmer') {
      totalBalance = await getFarmerTotalBalance(userId);
      
      // Get recent transactions across all dealers
      const q = query(
        collection(db, 'transactions'),
        where('farmerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      recentTransactions = snapshot.docs.slice(0, 5).map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      
    } else if (role === 'dealer') {
      const wallets = await getDealerWallets(userId);
      totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
      
      // Get recent transactions for this dealer
      const q = query(
        collection(db, 'transactions'),
        where('dealerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      recentTransactions = snapshot.docs.slice(0, 5).map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
    }
    
    return {
      totalBalance,
      totalTransactions: recentTransactions.length,
      recentTransactions
    };
  } catch (error) {
    console.error('Error getting wallet summary:', error);
    throw error;
  }
}
