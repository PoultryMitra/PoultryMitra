import { 
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  runTransaction,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  deductFromWallet, 
  addMoneyToWallet, 
  getWalletBalance,
  type Transaction 
} from './walletService';

// Existing order interfaces (keep the same)
export interface OrderRequest {
  id?: string;
  farmerId: string;
  farmerName: string;
  farmerEmail: string;
  dealerId: string;
  dealerName: string;
  productType: string;
  quantity: number;
  unit: string;
  estimatedCost?: number;
  finalCost?: number;
  description?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'payment_required';
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  rejectedAt?: Date;
  notes?: string;
  paymentMethod?: 'wallet' | 'cash' | 'credit';
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

// Updated helper function to create wallet transaction when order is completed
const createWalletTransaction = async (
  order: OrderRequest & { id: string }
): Promise<void> => {
  console.log('🏦 Creating wallet transaction for order:', {
    orderId: order.id,
    farmerId: order.farmerId,
    dealerId: order.dealerId,
    finalCost: order.finalCost
  });

  if (!order.finalCost || order.finalCost <= 0) {
    console.warn('❌ No cost specified for completed order, skipping wallet transaction');
    return;
  }

  try {
    const amount = order.finalCost;
    console.log(`💰 Processing wallet deduction: ₹${amount}`);

    // Check if farmer has sufficient wallet balance
    const farmerBalance = await getWalletBalance(order.farmerId, order.dealerId);
    console.log('🔍 Farmer wallet balance:', farmerBalance);

    if (farmerBalance < amount) {
      console.warn(`⚠️ Insufficient wallet balance for order ${order.id}. Required: ₹${amount}, Available: ₹${farmerBalance}, Shortfall: ₹${amount - farmerBalance}`);
      
      // Update order status to payment_required instead of completing
      await updateDoc(doc(db, 'orderRequests', order.id), {
        status: 'payment_required',
        paymentStatus: 'failed',
        notes: `Insufficient wallet balance. Required: ₹${amount}, Available: ₹${farmerBalance}`
      });
      
      throw new Error(`Insufficient wallet balance. Available: ₹${farmerBalance}, Required: ₹${amount}`);
    }

    // Deduct from farmer's wallet using atomic transaction
    await deductFromWallet(
      order.farmerId, 
      order.dealerId, 
      amount, 
      order.id,
      `Order: ${order.productType} (${order.quantity} ${order.unit})`,
      {
        orderNumber: order.id,
        productName: order.productType,
        quantity: order.quantity
      }
    );

    // Update order payment status
    await updateDoc(doc(db, 'orderRequests', order.id), {
      paymentStatus: 'paid',
      paymentMethod: 'wallet'
    });

    console.log('✅ Wallet transaction completed successfully');

  } catch (error) {
    console.error('❌ Error creating wallet transaction:', error);
    
    // Update order with error status
    await updateDoc(doc(db, 'orderRequests', order.id), {
      status: 'payment_required',
      paymentStatus: 'failed',
      notes: `Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    
    throw error;
  }
};

// Updated submitOrderRequest function with wallet integration
export const submitOrderRequest = async (orderData: Omit<OrderRequest, 'id' | 'createdAt'>): Promise<void> => {
  try {
    console.log('📤 Submitting order request with wallet integration:', orderData);
    
    const orderRequest: Omit<OrderRequest, 'id'> = {
      ...orderData,
      status: 'pending',
      createdAt: new Date(),
      paymentMethod: 'wallet', // Default to wallet payment
      paymentStatus: 'pending'
    };

    await addDoc(collection(db, 'orderRequests'), orderRequest);
    console.log('✅ Order request submitted successfully');
  } catch (error) {
    console.error('❌ Error submitting order request:', error);
    throw error;
  }
};

// Updated updateOrderRequestStatus with wallet integration
export const updateOrderRequestStatus = async (
  orderId: string, 
  status: OrderRequest['status'], 
  additionalData?: Partial<OrderRequest>
): Promise<void> => {
  try {
    console.log(`📋 Updating order ${orderId} status to: ${status}`);
    
    const updateData: Partial<OrderRequest> = {
      status,
      ...additionalData
    };

    // Add timestamp based on status
    const now = new Date();
    if (status === 'accepted') {
      updateData.acceptedAt = now;
    } else if (status === 'completed') {
      updateData.completedAt = now;
    } else if (status === 'rejected') {
      updateData.rejectedAt = now;
    }

    await updateDoc(doc(db, 'orderRequests', orderId), updateData);

    // If order is completed and has a final cost, process wallet transaction
    if (status === 'completed' && additionalData?.finalCost) {
      const orderDoc = await getDoc(doc(db, 'orderRequests', orderId));
      if (orderDoc.exists()) {
        const orderData = { id: orderId, ...orderDoc.data() } as OrderRequest & { id: string };
        await createWalletTransaction(orderData);
      }
    }

    console.log('✅ Order status updated successfully');
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    throw error;
  }
};

// Updated balance checking using wallet service
export const checkFarmerWalletBalance = async (
  farmerId: string,
  dealerId: string,
  requiredAmount: number
): Promise<{ hasSufficientBalance: boolean; currentBalance: number; shortfall: number }> => {
  try {
    const currentBalance = await getWalletBalance(farmerId, dealerId);
    
    return {
      hasSufficientBalance: currentBalance >= requiredAmount,
      currentBalance: currentBalance,
      shortfall: Math.max(0, requiredAmount - currentBalance)
    };
  } catch (error) {
    console.error('Error checking farmer wallet balance:', error);
    return {
      hasSufficientBalance: false,
      currentBalance: 0,
      shortfall: requiredAmount
    };
  }
};

// Helper function to add money to farmer's wallet (for dealers)
export const addMoneyToFarmerWallet = async (
  farmerId: string,
  dealerId: string,
  amount: number,
  description: string = 'Money added by dealer'
): Promise<void> => {
  try {
    console.log(`💰 Adding ₹${amount} to farmer ${farmerId}'s wallet by dealer ${dealerId}`);
    
    await addMoneyToWallet(farmerId, dealerId, amount, dealerId, description);

    console.log('✅ Money added to farmer wallet successfully');
  } catch (error) {
    console.error('❌ Error adding money to farmer wallet:', error);
    throw error;
  }
};

// Subscription functions (keep existing ones for compatibility)
export const subscribeFarmerOrderRequests = (
  farmerId: string, 
  callback: (orders: OrderRequest[]) => void
) => {
  const q = query(
    collection(db, 'orderRequests'),
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as OrderRequest[];
    callback(orders);
  });
};

export const subscribeDealerOrderRequests = (
  dealerId: string, 
  callback: (orders: OrderRequest[]) => void
) => {
  const q = query(
    collection(db, 'orderRequests'),
    where('dealerId', '==', dealerId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as OrderRequest[];
    callback(orders);
  });
};

// Updated service export with wallet integration
export const orderServiceIntegrated = {
  submitOrderRequest,
  subscribeFarmerOrderRequests,
  subscribeDealerOrderRequests,
  updateOrderRequestStatus,
  checkFarmerWalletBalance,
  addMoneyToFarmerWallet,
  createWalletTransaction
};
