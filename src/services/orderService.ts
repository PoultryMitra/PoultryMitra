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
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Notification interface for the ordering system
export interface OrderNotification {
  id: string;
  userId: string; // The user who should receive the notification
  userType: 'farmer' | 'dealer';
  type: 'order_request' | 'order_approved' | 'order_rejected' | 'order_completed';
  title: string;
  message: string;
  orderId: string;
  farmerName?: string;
  dealerName?: string;
  orderType?: string;
  quantity?: number;
  unit?: string;
  read: boolean;
  createdAt: Timestamp;
}

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

// Helper function to send order notifications
const sendOrderNotification = async (
  userId: string,
  userType: 'farmer' | 'dealer',
  type: OrderNotification['type'],
  title: string,
  message: string,
  orderId: string,
  additionalData?: {
    farmerName?: string;
    dealerName?: string;
    orderType?: string;
    quantity?: number;
    unit?: string;
  }
): Promise<void> => {
  try {
    const notificationRef = collection(db, 'orderNotifications');
    
    await addDoc(notificationRef, {
      userId,
      userType,
      type,
      title,
      message,
      orderId,
      ...additionalData,
      read: false,
      createdAt: Timestamp.now()
    });
    
    console.log('📢 Order notification sent:', { userId, userType, type, title });
  } catch (error) {
    console.error('Error sending order notification:', error);
  }
};

// Helper function to create accounting transaction when order is completed
const createAccountingTransaction = async (
  order: OrderRequest
): Promise<void> => {
  try {
    if (!order.actualCost && !order.estimatedCost) {
      console.warn('No cost specified for completed order, skipping accounting transaction');
      return;
    }

    const amount = order.actualCost || order.estimatedCost || 0;
    
    // Create debit transaction (farmer owes dealer)
    await addFarmerTransaction(
      order.farmerId,
      order.dealerId,
      order.dealerName,
      {
        transactionType: 'debit',
        amount: amount,
        description: `Order completed: ${order.quantity} ${order.unit} ${order.orderType}`,
        category: order.orderType,
        orderRequestId: order.id
      }
    );
    
    console.log('💰 Accounting transaction created for completed order:', {
      orderId: order.id,
      amount,
      farmerName: order.farmerName,
      dealerName: order.dealerName
    });
  } catch (error) {
    console.error('Error creating accounting transaction:', error);
  }
};

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
    
    const docRef = await addDoc(orderRef, {
      farmerId,
      farmerName,
      dealerId,
      dealerName,
      ...orderData,
      status: 'pending',
      requestDate: Timestamp.now()
    });

    // Send notification to dealer
    await sendOrderNotification(
      dealerId,
      'dealer',
      'order_request',
      'New Order Request',
      `${farmerName} has requested ${orderData.quantity} ${orderData.unit} of ${orderData.orderType}`,
      docRef.id,
      {
        farmerName,
        dealerName,
        orderType: orderData.orderType,
        quantity: orderData.quantity,
        unit: orderData.unit
      }
    );

    console.log('📦 Order request submitted with notification:', {
      orderId: docRef.id,
      farmerName,
      dealerName,
      orderType: orderData.orderType
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
    where('farmerId', '==', farmerId)
    // Temporarily removed orderBy to avoid index requirement until indexes are built
    // orderBy('requestDate', 'desc')
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
    where('dealerId', '==', dealerId)
    // Temporarily removed orderBy to avoid index requirement until indexes are built
    // orderBy('requestDate', 'desc')
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
    
    // Get the current order data to access farmer info
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }
    
    const orderData = orderDoc.data() as OrderRequest;
    
    // Update the order
    await updateDoc(orderRef, {
      status,
      responseDate: Timestamp.now(),
      ...(dealerNotes && { dealerNotes }),
      ...(estimatedCost && { estimatedCost }),
      ...(actualCost && { actualCost })
    });

    // Send notification to farmer based on status
    let notificationTitle = '';
    let notificationMessage = '';
    
    switch (status) {
      case 'approved':
        notificationTitle = 'Order Approved';
        notificationMessage = `Your order for ${orderData.quantity} ${orderData.unit} of ${orderData.orderType} has been approved by ${orderData.dealerName}`;
        if (estimatedCost) {
          notificationMessage += `. Estimated cost: ₹${estimatedCost.toLocaleString()}`;
        }
        break;
      case 'rejected':
        notificationTitle = 'Order Rejected';
        notificationMessage = `Your order for ${orderData.quantity} ${orderData.unit} of ${orderData.orderType} has been rejected by ${orderData.dealerName}`;
        if (dealerNotes) {
          notificationMessage += `. Reason: ${dealerNotes}`;
        }
        break;
      case 'completed':
        notificationTitle = 'Order Completed';
        notificationMessage = `Your order for ${orderData.quantity} ${orderData.unit} of ${orderData.orderType} has been completed by ${orderData.dealerName}`;
        if (actualCost) {
          notificationMessage += `. Total cost: ₹${actualCost.toLocaleString()}`;
        }
        break;
    }

    await sendOrderNotification(
      orderData.farmerId,
      'farmer',
      `order_${status}` as OrderNotification['type'],
      notificationTitle,
      notificationMessage,
      orderId,
      {
        farmerName: orderData.farmerName,
        dealerName: orderData.dealerName,
        orderType: orderData.orderType,
        quantity: orderData.quantity,
        unit: orderData.unit
      }
    );

    // If order is completed, create accounting transaction
    if (status === 'completed') {
      const updatedOrder = {
        ...orderData,
        status,
        actualCost,
        estimatedCost
      } as OrderRequest;
      
      await createAccountingTransaction(updatedOrder);
    }

    console.log('📋 Order status updated with notification:', {
      orderId,
      status,
      farmerName: orderData.farmerName,
      dealerName: orderData.dealerName
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
    where('farmerId', '==', farmerId)
    // Temporarily removed orderBy to avoid index requirement until indexes are built
    // orderBy('date', 'desc')
  );

  if (dealerId) {
    q = query(
      collection(db, 'farmerTransactions'),
      where('farmerId', '==', farmerId),
      where('dealerId', '==', dealerId)
      // Temporarily removed orderBy to avoid index requirement until indexes are built
      // orderBy('date', 'desc')
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

// Subscribe to user's order notifications
export const subscribeToOrderNotifications = (
  userId: string,
  callback: (notifications: OrderNotification[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'orderNotifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifications: OrderNotification[] = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as OrderNotification);
    });
    callback(notifications);
  });

  return unsubscribe;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'orderNotifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'orderNotifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.length;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

// Export service object
export const orderService = {
  submitOrderRequest,
  subscribeFarmerOrderRequests,
  subscribeDealerOrderRequests,
  updateOrderRequestStatus,
  addFarmerTransaction,
  subscribeFarmerTransactions,
  calculateFarmerBalances,
  subscribeToOrderNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount
};
