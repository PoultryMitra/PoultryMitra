import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface OrderRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  dealerId: string;
  dealerName: string;
  orderType: 'Feed' | 'Medicine' | 'Chicks';
  quantity: number;
  unit: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: Timestamp;
  responseDate?: Timestamp;
  dealerNotes?: string;
  estimatedCost?: number;
  actualCost?: number;
}

export interface FarmerAccountTransaction {
  id: string;
  farmerId: string;
  dealerId: string;
  dealerName: string;
  transactionType: 'credit' | 'debit';
  amount: number;
  description: string;
  orderRequestId?: string;
  date: Timestamp;
  category: 'Feed' | 'Medicine' | 'Chicks' | 'Payment' | 'Other';
}

export interface FarmerAccountBalance {
  farmerId: string;
  dealerId: string;
  dealerName: string;
  creditBalance: number; // Amount farmer owes to dealer
  debitBalance: number;  // Amount dealer owes to farmer
  netBalance: number;    // Positive = farmer owes dealer, Negative = dealer owes farmer
  lastUpdated: Timestamp;
}

// Submit order request from farmer to dealer
export const submitOrderRequest = async (
  farmerId: string,
  farmerName: string,
  dealerId: string,
  dealerName: string,
  orderData: {
    orderType: 'Feed' | 'Medicine' | 'Chicks';
    quantity: number;
    unit: string;
    notes?: string;
  }
): Promise<void> => {
  try {
    const orderRef = collection(db, 'orderRequests');
    
    await addDoc(orderRef, {
      farmerId,
      farmerName,
      dealerId,
      dealerName,
      ...orderData,
      status: 'pending',
      requestDate: Timestamp.now()
    });
  } catch (error) {
    console.error('Error submitting order request:', error);
    throw error;
  }
};

// Get farmer's order requests with real-time updates
export const subscribeFarmerOrderRequests = (
  farmerId: string,
  callback: (orders: OrderRequest[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'orderRequests'),
    where('farmerId', '==', farmerId),
    orderBy('requestDate', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders: OrderRequest[] = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as OrderRequest);
    });
    callback(orders);
  });

  return unsubscribe;
};

// Get dealer's order requests with real-time updates
export const subscribeDealerOrderRequests = (
  dealerId: string,
  callback: (orders: OrderRequest[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'orderRequests'),
    where('dealerId', '==', dealerId),
    orderBy('requestDate', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders: OrderRequest[] = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as OrderRequest);
    });
    callback(orders);
  });

  return unsubscribe;
};

// Update order request status (dealer action)
export const updateOrderRequestStatus = async (
  orderId: string,
  status: 'approved' | 'rejected' | 'completed',
  dealerNotes?: string,
  estimatedCost?: number,
  actualCost?: number
): Promise<void> => {
  try {
    const orderRef = doc(db, 'orderRequests', orderId);
    
    await updateDoc(orderRef, {
      status,
      responseDate: Timestamp.now(),
      ...(dealerNotes && { dealerNotes }),
      ...(estimatedCost && { estimatedCost }),
      ...(actualCost && { actualCost })
    });
  } catch (error) {
    console.error('Error updating order request:', error);
    throw error;
  }
};

// Add transaction to farmer's account
export const addFarmerTransaction = async (
  farmerId: string,
  dealerId: string,
  dealerName: string,
  transactionData: {
    transactionType: 'credit' | 'debit';
    amount: number;
    description: string;
    category: 'Feed' | 'Medicine' | 'Chicks' | 'Payment' | 'Other';
    orderRequestId?: string;
  }
): Promise<void> => {
  try {
    const transactionRef = collection(db, 'farmerTransactions');
    
    await addDoc(transactionRef, {
      farmerId,
      dealerId,
      dealerName,
      ...transactionData,
      date: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding farmer transaction:', error);
    throw error;
  }
};

// Get farmer's transactions with a specific dealer
export const subscribeFarmerTransactions = (
  farmerId: string,
  callback: (transactions: FarmerAccountTransaction[]) => void,
  dealerId?: string
): (() => void) => {
  let q = query(
    collection(db, 'farmerTransactions'),
    where('farmerId', '==', farmerId),
    orderBy('date', 'desc')
  );

  if (dealerId) {
    q = query(
      collection(db, 'farmerTransactions'),
      where('farmerId', '==', farmerId),
      where('dealerId', '==', dealerId),
      orderBy('date', 'desc')
    );
  }

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const transactions: FarmerAccountTransaction[] = [];
    snapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as FarmerAccountTransaction);
    });
    callback(transactions);
  });

  return unsubscribe;
};

// Calculate farmer's account balance with each dealer
export const calculateFarmerBalances = (
  transactions: FarmerAccountTransaction[]
): FarmerAccountBalance[] => {
  const balanceMap = new Map<string, FarmerAccountBalance>();

  transactions.forEach(transaction => {
    const key = `${transaction.farmerId}-${transaction.dealerId}`;
    
    if (!balanceMap.has(key)) {
      balanceMap.set(key, {
        farmerId: transaction.farmerId,
        dealerId: transaction.dealerId,
        dealerName: transaction.dealerName,
        creditBalance: 0,
        debitBalance: 0,
        netBalance: 0,
        lastUpdated: transaction.date
      });
    }

    const balance = balanceMap.get(key)!;
    
    if (transaction.transactionType === 'credit') {
      balance.creditBalance += transaction.amount;
    } else {
      balance.debitBalance += transaction.amount;
    }
    
    balance.netBalance = balance.creditBalance - balance.debitBalance;
    
    if (transaction.date.toMillis() > balance.lastUpdated.toMillis()) {
      balance.lastUpdated = transaction.date;
    }
  });

  return Array.from(balanceMap.values());
};

// Export service object
export const orderService = {
  submitOrderRequest,
  subscribeFarmerOrderRequests,
  subscribeDealerOrderRequests,
  updateOrderRequestStatus,
  addFarmerTransaction,
  subscribeFarmerTransactions,
  calculateFarmerBalances
};
