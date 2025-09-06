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
  getDoc,
  setDoc,
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Input validation utilities
const validateOrderRequest = (orderData: any): void => {
  if (!orderData.farmerId || !orderData.dealerId) {
    throw new Error('Farmer ID and Dealer ID are required');
  }
  
  if (!orderData.orderType || !['Feed', 'Medicine', 'Chicks'].includes(orderData.orderType)) {
    throw new Error('Invalid order type. Must be Feed, Medicine, or Chicks');
  }
  
  if (!orderData.quantity || orderData.quantity <= 0) {
    throw new Error('Quantity must be a positive number');
  }
  
  if (orderData.quantity > 10000) {
    throw new Error('Quantity exceeds maximum limit');
  }
  
  if (!orderData.unit || orderData.unit.trim().length === 0) {
    throw new Error('Unit is required');
  }
};

const validateUpdateData = (status: string, actualCost?: number, estimatedCost?: number): void => {
  if (!['approved', 'rejected', 'completed'].includes(status)) {
    throw new Error('Invalid status');
  }
  
  if (actualCost !== undefined && actualCost < 0) {
    throw new Error('Actual cost cannot be negative');
  }
  
  if (estimatedCost !== undefined && estimatedCost < 0) {
    throw new Error('Estimated cost cannot be negative');
  }
};

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
    console.log('🏦 Creating accounting transaction for order:', {
      orderId: order.id,
      farmerId: order.farmerId,
      dealerId: order.dealerId,
      actualCost: order.actualCost,
      estimatedCost: order.estimatedCost
    });

    if (!order.actualCost && !order.estimatedCost) {
      console.warn('❌ No cost specified for completed order, skipping accounting transaction');
      return;
    }

    const amount = order.actualCost || order.estimatedCost || 0;
    console.log(`💰 Processing debit transaction: ₹${amount}`);
    
    // Check if farmer has sufficient balance
    const balanceCheck = await checkFarmerBalance(order.farmerId, order.dealerId, amount);
    console.log('🔍 Balance check result:', balanceCheck);
    
    if (!balanceCheck.hasSufficientBalance) {
      console.warn(`⚠️ Insufficient balance for order ${order.id}. Required: ₹${amount}, Available: ₹${balanceCheck.currentBalance}, Shortfall: ₹${balanceCheck.shortfall}`);
      // Still create the transaction but with a warning
    }
    
    // Create debit transaction (farmer account is charged)
    console.log('📝 Adding farmer transaction...');
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
    
    console.log('✅ Accounting transaction created successfully for completed order:', {
      orderId: order.id,
      amount,
      farmerName: order.farmerName,
      dealerName: order.dealerName,
      balanceAfter: balanceCheck.currentBalance - amount
    });
  } catch (error) {
    console.error('❌ Error creating accounting transaction:', error);
    throw error; // Re-throw to surface the error
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
  // Validate input data
  validateOrderRequest({
    farmerId,
    dealerId,
    ...orderData
  });

  if (!farmerName || farmerName.trim().length === 0) {
    throw new Error('Farmer name is required');
  }
  
  if (!dealerName || dealerName.trim().length === 0) {
    throw new Error('Dealer name is required');
  }

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
  // Validate inputs
  if (!orderId || orderId.trim().length === 0) {
    throw new Error('Order ID is required');
  }
  
  validateUpdateData(status, actualCost, estimatedCost);

  try {
    const orderRef = doc(db, 'orderRequests', orderId);
    
    // Get the current order data to access farmer info
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }
    
    const orderData = orderDoc.data() as OrderRequest;
    
    // Prevent invalid status transitions
    if (orderData.status === 'completed') {
      throw new Error('Cannot modify a completed order');
    }
    
    if (orderData.status === 'rejected' && status !== 'rejected') {
      throw new Error('Cannot change status of a rejected order');
    }
    
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

// Add transaction to farmer's account and update balance
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
  console.log('🔄 Starting addFarmerTransaction:', {
    farmerId,
    dealerId,
    dealerName,
    transactionData
  });

  try {
    // Use a transaction to ensure atomic updates
    await runTransaction(db, async (transaction) => {
      console.log('🔒 Inside Firestore transaction...');
      
      // IMPORTANT: Do ALL reads first, before any writes
      const balanceId = `${farmerId}_${dealerId}`;
      const balanceRef = doc(db, 'farmerBalances', balanceId);
      
      console.log(`🔍 Getting existing balance for: ${balanceId}`);
      // Get existing balance (READ operation - must come first)
      const balanceDoc = await transaction.get(balanceRef);
      
      let creditBalance = 0;
      let debitBalance = 0;
      
      if (balanceDoc.exists()) {
        const existingBalance = balanceDoc.data();
        creditBalance = existingBalance.creditBalance || 0;
        debitBalance = existingBalance.debitBalance || 0;
        console.log('📊 Existing balance found:', { creditBalance, debitBalance });
      } else {
        console.log('📊 No existing balance found, starting from zero');
      }
      
      // Update balance based on transaction type
      // FIXED LOGIC: Simple deposit/withdrawal system
      if (transactionData.transactionType === 'credit') {
        // Farmer deposits money - increase available balance
        creditBalance += transactionData.amount;
        console.log(`💵 Deposit: Available balance increased by ₹${transactionData.amount}`);
      } else {
        // Order/withdrawal - decrease available balance  
        creditBalance -= transactionData.amount;
        console.log(`💳 Order deduction: Available balance reduced by ₹${transactionData.amount}`);
      }
      
      // Reset debitBalance to 0 since we're not using dual-entry accounting
      debitBalance = 0;
      
      // Net balance is simply the available credit (what farmer has deposited minus what they've spent)
      const netBalance = creditBalance;
      
      if (netBalance < 0) {
        console.warn(`⚠️ Balance went negative: ₹${netBalance} (farmer has insufficient deposits)`);
      }
      console.log('🧮 New balance calculation:', {
        previousCreditBalance: balanceDoc.exists() ? balanceDoc.data().creditBalance : 0,
        transactionAmount: transactionData.amount,
        transactionType: transactionData.transactionType,
        newCreditBalance: creditBalance,
        netBalance: netBalance
      });
      
      // Now do ALL writes after all reads are complete
      
      // 1. Add the transaction record (WRITE operation)  
      const transactionRef = doc(collection(db, 'farmerTransactions'));
      
      // Filter out undefined values to avoid Firestore errors
      const cleanTransactionData = Object.fromEntries(
        Object.entries(transactionData).filter(([_, value]) => value !== undefined)
      );
      
      const transactionRecord = {
        farmerId,
        dealerId,
        dealerName,
        ...cleanTransactionData,
        date: Timestamp.now()
      };
      
      console.log('📝 Creating transaction record:', transactionRecord);
      transaction.set(transactionRef, transactionRecord);

      // 2. Set/update the balance document (WRITE operation)
      const balanceRecord = {
        farmerId,
        dealerId,
        dealerName,
        creditBalance,
        debitBalance,
        netBalance,
        lastUpdated: Timestamp.now()
      };
      
      console.log('💾 Setting balance record:', balanceRecord);
      transaction.set(balanceRef, balanceRecord);
    });
    
    console.log('✅ Transaction and balance updated successfully:', {
      farmerId,
      dealerId,
      type: transactionData.transactionType,
      amount: transactionData.amount
    });
    
  } catch (error) {
    console.error('❌ Error adding farmer transaction:', error);
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
    
    // FIXED: Use simple deposit/withdrawal logic
    if (transaction.transactionType === 'credit') {
      // Farmer deposit - increase available balance
      balance.creditBalance += transaction.amount;
    } else {
      // Order/withdrawal - decrease available balance
      balance.creditBalance -= transaction.amount;
    }
    
    // Reset debit balance (not used in simple model)
    balance.debitBalance = 0;
    
    // Net balance is simply the available balance
    balance.netBalance = balance.creditBalance;
    
    if (transaction.date.toMillis() > balance.lastUpdated.toMillis()) {
      balance.lastUpdated = transaction.date;
    }
  });

  return Array.from(balanceMap.values());
};

// Subscribe to farmer balances from Firestore (real-time)
export const subscribeFarmerBalances = (
  farmerId: string,
  callback: (balances: FarmerAccountBalance[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'farmerBalances'),
    where('farmerId', '==', farmerId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const balances: FarmerAccountBalance[] = [];
    snapshot.forEach((doc) => {
      balances.push({ ...doc.data() } as FarmerAccountBalance);
    });
    callback(balances);
  });

  return unsubscribe;
};

// Subscribe to dealer balances from Firestore (real-time)
export const subscribeDealerBalances = (
  dealerId: string,
  callback: (balances: FarmerAccountBalance[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'farmerBalances'),
    where('dealerId', '==', dealerId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const balances: FarmerAccountBalance[] = [];
    snapshot.forEach((doc) => {
      balances.push({ ...doc.data() } as FarmerAccountBalance);
    });
    callback(balances);
  });

  return unsubscribe;
};

// Get a specific balance between farmer and dealer
export const getFarmerDealerBalance = async (
  farmerId: string,
  dealerId: string
): Promise<FarmerAccountBalance | null> => {
  try {
    const balanceId = `${farmerId}_${dealerId}`;
    const balanceRef = doc(db, 'farmerBalances', balanceId);
    const balanceDoc = await getDoc(balanceRef);
    
    if (balanceDoc.exists()) {
      return { ...balanceDoc.data() } as FarmerAccountBalance;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting farmer-dealer balance:', error);
    return null;
  }
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

// Record farmer deposit/payment to dealer account (convenience function)
export const depositToFarmerAccount = async (
  farmerId: string,
  dealerId: string,
  dealerName: string,
  amount: number,
  description?: string
): Promise<void> => {
  if (amount <= 0) {
    throw new Error('Deposit amount must be greater than 0');
  }

  return addFarmerTransaction(
    farmerId,
    dealerId,
    dealerName,
    {
      transactionType: 'credit',
      amount: amount,
      description: description || `Farmer deposit recorded by ${dealerName}`,
      category: 'Payment'
    }
  );
};

// Check if farmer has sufficient balance for an order
export const checkFarmerBalance = async (
  farmerId: string,
  dealerId: string,
  requiredAmount: number
): Promise<{ hasSufficientBalance: boolean; currentBalance: number; shortfall: number }> => {
  try {
    const balance = await getFarmerDealerBalance(farmerId, dealerId);
    const currentBalance = balance ? balance.netBalance : 0; // Net balance is now the available credit
    
    return {
      hasSufficientBalance: currentBalance >= requiredAmount,
      currentBalance: currentBalance,
      shortfall: Math.max(0, requiredAmount - currentBalance)
    };
  } catch (error) {
    console.error('Error checking farmer balance:', error);
    return {
      hasSufficientBalance: false,
      currentBalance: 0,
      shortfall: requiredAmount
    };
  }
};

// Submit order from dealer to farmer (CALL TO ORDER)
export const submitDealerOrderToFarmer = async (
  dealerId: string,
  dealerName: string,
  farmerId: string,
  farmerName: string,
  orderData: {
    orderType: 'Feed' | 'Medicine' | 'Chicks';
    quantity: number;
    unit: string;
    estimatedCost?: number;
    notes?: string;
    isCallToOrder?: boolean; // Flag to indicate this is a dealer-initiated order
  }
): Promise<void> => {
  // Validate input data
  validateOrderRequest({
    farmerId,
    dealerId,
    ...orderData
  });

  if (!farmerName || farmerName.trim().length === 0) {
    throw new Error('Farmer name is required');
  }
  
  if (!dealerName || dealerName.trim().length === 0) {
    throw new Error('Dealer name is required');
  }

  try {
    const orderRef = collection(db, 'orderRequests');
    
    const docRef = await addDoc(orderRef, {
      farmerId,
      farmerName,
      dealerId,
      dealerName,
      ...orderData,
      status: 'pending',
      requestDate: Timestamp.now(),
      isDealerInitiated: true, // Mark this order as dealer-initiated
      estimatedCost: orderData.estimatedCost || 0
    });

    // Send notification to farmer
    await sendOrderNotification(
      farmerId,
      'farmer',
      'order_request',
      'New Order from Dealer',
      `${dealerName} wants to send you ${orderData.quantity} ${orderData.unit} of ${orderData.orderType}${orderData.estimatedCost ? ` for ₹${orderData.estimatedCost}` : ''}`,
      docRef.id,
      {
        farmerName,
        dealerName,
        orderType: orderData.orderType,
        quantity: orderData.quantity,
        unit: orderData.unit
      }
    );

    console.log('📞 Call to order sent with notification:', {
      orderId: docRef.id,
      dealerName,
      farmerName,
      orderType: orderData.orderType,
      estimatedCost: orderData.estimatedCost
    });
  } catch (error) {
    console.error('Error sending call to order:', error);
    throw error;
  }
};

// Export service object
export const orderService = {
  submitOrderRequest,
  subscribeFarmerOrderRequests,
  subscribeDealerOrderRequests,
  updateOrderRequestStatus,
  addFarmerTransaction,
  depositToFarmerAccount,
  checkFarmerBalance,
  subscribeFarmerTransactions,
  subscribeFarmerBalances,
  subscribeDealerBalances,
  getFarmerDealerBalance,
  calculateFarmerBalances,
  subscribeToOrderNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount
};
