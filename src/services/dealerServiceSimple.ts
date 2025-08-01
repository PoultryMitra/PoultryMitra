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

// Test function to verify module is working
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

export const createInvitationCode = async (dealerId: string): Promise<string> => {
  const inviteCode = `${dealerId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Store invitation code in Firestore for validation
  await addDoc(collection(db, 'dealerInvitations'), {
    inviteCode,
    dealerId,
    createdAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    isActive: true
  });
  
  return inviteCode;
};

export const loadDemoData = async (dealerId: string): Promise<void> => {
  try {
    console.log('Loading demo data for dealer:', dealerId);
    // Simple demo data loading - just log for now
  } catch (error) {
    console.error('Error loading demo data:', error);
    throw error;
  }
};
