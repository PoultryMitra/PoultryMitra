import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  serverTimestamp,
  updateDoc,
  doc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface FarmerData {
  id: string;
  dealerId: string;
  farmerId: string;
  farmerName: string;
  farmerEmail: string;
  chicksReceived: number;
  feedConsumption: number;
  mortalityRate: number;
  fcr: number;
  accountBalance: number;
  lastUpdated: Timestamp;
}

export interface Product {
  id: string;
  dealerId: string;
  productName: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  unit: string;
  pricePerUnit: number;
  supplier: string;
  lastUpdated: Timestamp;
}

export interface Order {
  id: string;
  dealerId: string;
  farmerId: string;
  farmerName: string;
  orderType: string;
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  orderDate: Timestamp;
  deliveryDate?: Timestamp;
  notes?: string;
}

export interface RateUpdate {
  id: string;
  dealerId: string;
  productName: string;
  category: string;
  newRate: number;
  unit: string;
  updatedAt: Timestamp;
}

export interface DealerProfile {
  id: string;
  dealerId: string;
  businessName: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  gstNumber?: string;
  licenseNumber?: string;
  lastUpdated: Timestamp;
}

// Farmer Management Functions
export const getDealerFarmers = (
  dealerId: string,
  callback: (farmers: FarmerData[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'dealerFarmers'),
    where('dealerId', '==', dealerId),
    orderBy('lastUpdated', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const farmers: FarmerData[] = [];
    snapshot.forEach((doc) => {
      farmers.push({ id: doc.id, ...doc.data() } as FarmerData);
    });
    callback(farmers);
  });

  return unsubscribe;
};

export const addFarmerData = async (
  dealerId: string,
  farmerData: Omit<FarmerData, 'id' | 'dealerId' | 'lastUpdated'>
): Promise<void> => {
  try {
    const farmersRef = collection(db, 'dealerFarmers');
    
    await addDoc(farmersRef, {
      ...farmerData,
      dealerId,
      lastUpdated: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding farmer data:', error);
    throw error;
  }
};

export const updateFarmerData = async (
  farmerId: string,
  updates: Partial<Omit<FarmerData, 'id' | 'dealerId'>>
): Promise<void> => {
  try {
    const farmerRef = doc(db, 'dealerFarmers', farmerId);
    await updateDoc(farmerRef, {
      ...updates,
      lastUpdated: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating farmer data:', error);
    throw error;
  }
};

// Product Management Functions
export const getDealerProducts = (
  dealerId: string,
  callback: (products: Product[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'dealerProducts'),
    where('dealerId', '==', dealerId),
    orderBy('lastUpdated', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    callback(products);
  });

  return unsubscribe;
};

export const addProduct = async (
  dealerId: string,
  productData: Omit<Product, 'id' | 'dealerId' | 'lastUpdated'>
): Promise<void> => {
  try {
    const productsRef = collection(db, 'dealerProducts');
    
    await addDoc(productsRef, {
      ...productData,
      dealerId,
      lastUpdated: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (
  productId: string,
  updates: Partial<Omit<Product, 'id' | 'dealerId'>>
): Promise<void> => {
  try {
    const productRef = doc(db, 'dealerProducts', productId);
    await updateDoc(productRef, {
      ...updates,
      lastUpdated: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Order Management Functions
export const getDealerOrders = (
  dealerId: string,
  callback: (orders: Order[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'dealerOrders'),
    where('dealerId', '==', dealerId),
    orderBy('orderDate', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    callback(orders);
  });

  return unsubscribe;
};

export const addOrder = async (
  dealerId: string,
  orderData: Omit<Order, 'id' | 'dealerId' | 'orderDate'>
): Promise<void> => {
  try {
    const ordersRef = collection(db, 'dealerOrders');
    
    await addDoc(ordersRef, {
      ...orderData,
      dealerId,
      orderDate: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  deliveryDate?: Date
): Promise<void> => {
  try {
    const orderRef = doc(db, 'dealerOrders', orderId);
    const updates: any = { status };
    
    if (deliveryDate && status === 'delivered') {
      updates.deliveryDate = Timestamp.fromDate(deliveryDate);
    }
    
    await updateDoc(orderRef, updates);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Rate Update Functions
export const addRateUpdate = async (
  dealerId: string,
  rateData: Omit<RateUpdate, 'id' | 'dealerId' | 'updatedAt'>
): Promise<void> => {
  try {
    const ratesRef = collection(db, 'dealerRateUpdates');
    
    await addDoc(ratesRef, {
      ...rateData,
      dealerId,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding rate update:', error);
    throw error;
  }
};

export const getDealerRateUpdates = (
  dealerId: string,
  callback: (rates: RateUpdate[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'dealerRateUpdates'),
    where('dealerId', '==', dealerId),
    orderBy('updatedAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const rates: RateUpdate[] = [];
    snapshot.forEach((doc) => {
      rates.push({ id: doc.id, ...doc.data() } as RateUpdate);
    });
    callback(rates);
  });

  return unsubscribe;
};

// Dealer Profile Management
export const getDealerProfile = async (dealerId: string): Promise<DealerProfile | null> => {
  try {
    const q = query(
      collection(db, 'dealerProfiles'),
      where('dealerId', '==', dealerId)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as DealerProfile;
  } catch (error) {
    console.error('Error getting dealer profile:', error);
    throw error;
  }
};

export const createOrUpdateDealerProfile = async (
  dealerId: string,
  profileData: Omit<DealerProfile, 'id' | 'dealerId' | 'lastUpdated'>
): Promise<void> => {
  try {
    const q = query(
      collection(db, 'dealerProfiles'),
      where('dealerId', '==', dealerId)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Create new profile
      const profilesRef = collection(db, 'dealerProfiles');
      await addDoc(profilesRef, {
        ...profileData,
        dealerId,
        lastUpdated: Timestamp.now()
      });
    } else {
      // Update existing profile
      const profileDoc = snapshot.docs[0];
      const profileRef = doc(db, 'dealerProfiles', profileDoc.id);
      await updateDoc(profileRef, {
        ...profileData,
        lastUpdated: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error creating/updating dealer profile:', error);
    throw error;
  }
};

// Invitation Functions
export const createInvitationCode = async (dealerId: string): Promise<string> => {
  const inviteCode = `${dealerId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Store invitation code in Firestore for validation
    await addDoc(collection(db, 'dealerInvitations'), {
      inviteCode,
      dealerId,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true
    });
    
    return inviteCode;
  } catch (error) {
    console.error('Error creating invitation code:', error);
    throw error;
  }
};

export const validateInvitationCode = async (inviteCode: string): Promise<{valid: boolean, dealerId?: string}> => {
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
    
    const invitation = snapshot.docs[0].data();
    const now = new Date();
    const expiresAt = invitation.expiresAt.toDate();
    
    if (now > expiresAt) {
      return { valid: false };
    }
    
    return { valid: true, dealerId: invitation.dealerId };
  } catch (error) {
    console.error('Error validating invitation code:', error);
    return { valid: false };
  }
};

// Demo Data Functions
export const loadDemoData = async (dealerId: string): Promise<void> => {
  try {
    // Add demo farmers
    const demoFarmers = [
      {
        farmerId: 'F001',
        farmerName: 'John Smith',
        farmerEmail: 'john@farm.com',
        chicksReceived: 1000,
        feedConsumption: 1200,
        mortalityRate: 2.5,
        fcr: 1.8,
        accountBalance: 15000
      },
      {
        farmerId: 'F002',
        farmerName: 'Mary Johnson',
        farmerEmail: 'mary@farm.com',
        chicksReceived: 1500,
        feedConsumption: 1800,
        mortalityRate: 1.8,
        fcr: 1.6,
        accountBalance: 22000
      },
      {
        farmerId: 'F003',
        farmerName: 'David Wilson',
        farmerEmail: 'david@farm.com',
        chicksReceived: 800,
        feedConsumption: 950,
        mortalityRate: 3.2,
        fcr: 2.1,
        accountBalance: 8500
      }
    ];

    for (const farmer of demoFarmers) {
      await addFarmerData(dealerId, farmer);
    }

    // Add demo products
    const demoProducts = [
      {
        productName: 'Starter Feed',
        category: 'Feed',
        currentStock: 500,
        minStockLevel: 100,
        unit: 'bags',
        pricePerUnit: 45,
        supplier: 'FeedCorp Ltd'
      },
      {
        productName: 'Grower Feed',
        category: 'Feed',
        currentStock: 300,
        minStockLevel: 80,
        unit: 'bags',
        pricePerUnit: 42,
        supplier: 'FeedCorp Ltd'
      },
      {
        productName: 'Day-old Chicks',
        category: 'Chicks',
        currentStock: 2000,
        minStockLevel: 500,
        unit: 'pieces',
        pricePerUnit: 2.5,
        supplier: 'Hatchery Inc'
      },
      {
        productName: 'Newcastle Vaccine',
        category: 'Vaccines',
        currentStock: 50,
        minStockLevel: 20,
        unit: 'vials',
        pricePerUnit: 15,
        supplier: 'VetSupply Co'
      }
    ];

    for (const product of demoProducts) {
      await addProduct(dealerId, product);
    }

    // Add demo rate updates
    const demoRates = [
      {
        productName: 'Starter Feed',
        category: 'Feed',
        newRate: 45,
        unit: 'per bag'
      },
      {
        productName: 'Day-old Chicks',
        category: 'Chicks',
        newRate: 2.5,
        unit: 'per piece'
      }
    ];

    for (const rate of demoRates) {
      await addRateUpdate(dealerId, rate);
    }

    console.log('Demo data loaded successfully');
  } catch (error) {
    console.error('Error loading demo data:', error);
    throw error;
  }
};

// Transaction Functions
export const processTransaction = async (
  dealerId: string,
  farmerId: string,
  amount: number,
  type: 'credit' | 'debit',
  description: string
): Promise<void> => {
  try {
    const transactionRef = collection(db, 'dealerTransactions');
    
    await addDoc(transactionRef, {
      dealerId,
      farmerId,
      amount,
      type,
      description,
      timestamp: Timestamp.now()
    });

    // Update farmer's account balance
    const farmerRef = doc(db, 'dealerFarmers', farmerId);
    const balanceChange = type === 'credit' ? amount : -amount;
    
    // Get current balance first
    const farmerQuery = query(
      collection(db, 'dealerFarmers'),
      where('farmerId', '==', farmerId),
      where('dealerId', '==', dealerId)
    );
    
    const farmerSnapshot = await getDocs(farmerQuery);
    
    if (!farmerSnapshot.empty) {
      const farmerDoc = farmerSnapshot.docs[0];
      const currentBalance = farmerDoc.data().accountBalance || 0;
      const newBalance = currentBalance + balanceChange;
      
      await updateDoc(doc(db, 'dealerFarmers', farmerDoc.id), {
        accountBalance: newBalance,
        lastUpdated: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error processing transaction:', error);
    throw error;
  }
};

// Analytics Functions
export const calculateDealerStats = (farmers: FarmerData[], orders: Order[], products: Product[]) => {
  const totalFarmers = farmers.length;
  const activeFarmers = farmers.filter(f => {
    const daysSinceUpdate = (Date.now() - f.lastUpdated.toDate().getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate <= 7; // Active if updated within 7 days
  }).length;
  
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);
    
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel).length;
  
  const avgFCR = farmers.length > 0 
    ? farmers.reduce((sum, f) => sum + f.fcr, 0) / farmers.length 
    : 0;
    
  return {
    totalFarmers,
    activeFarmers,
    totalRevenue,
    pendingOrders,
    lowStockProducts,
    avgFCR: parseFloat(avgFCR.toFixed(2))
  };
};
