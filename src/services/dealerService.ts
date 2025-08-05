import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  serverTimestamp,
  updateDoc,
  doc,
  writeBatch
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

// Demo Data Functions
export const loadDemoData = async (dealerId: string): Promise<void> => {
  try {
    // Create unique IDs for demo farmers based on dealer ID
    const uniqueId1 = `demo-${dealerId.substring(0, 4)}-001`;
    const uniqueId2 = `demo-${dealerId.substring(0, 4)}-002`;
    const uniqueId3 = `demo-${dealerId.substring(0, 4)}-003`;
    
    // Add demo farmers with connections
    const demoFarmers = [
      {
        farmerId: uniqueId1,
        farmerName: 'John Smith',
        farmerEmail: 'john@farm.com',
        chicksReceived: 1000,
        feedConsumption: 1200,
        mortalityRate: 2.5,
        fcr: 1.8,
        accountBalance: 15000,
        connectionDate: new Date(),
        status: 'active'
      },
      {
        farmerId: uniqueId2,
        farmerName: 'Mary Johnson',
        farmerEmail: 'mary@farm.com',
        chicksReceived: 1500,
        feedConsumption: 1800,
        mortalityRate: 1.8,
        fcr: 1.6,
        accountBalance: 22000,
        connectionDate: new Date(),
        status: 'active'
      },
      {
        farmerId: uniqueId3,
        farmerName: 'David Wilson',
        farmerEmail: 'david@farm.com',
        chicksReceived: 800,
        feedConsumption: 950,
        mortalityRate: 3.2,
        fcr: 2.1,
        accountBalance: 8500,
        connectionDate: new Date(),
        status: 'active'
      }
    ];

    // Create connections and add farmer data in batches
    const batch = writeBatch(db);
    
    for (const farmer of demoFarmers) {
      // Create entry in dealerFarmers collection
      const dealerFarmerRef = doc(collection(db, 'dealerFarmers'));
      batch.set(dealerFarmerRef, {
        ...farmer,
        dealerId,
        lastUpdated: Timestamp.now()
      });
      
      // Create a connection record
      const connectionRef = doc(collection(db, 'connections'));
      batch.set(connectionRef, {
        farmerId: farmer.farmerId,
        dealerId: dealerId,
        farmerName: farmer.farmerName,
        farmerEmail: farmer.farmerEmail,
        dealerName: "Demo Dealer", // This will be replaced with actual dealer name in real connections
        dealerEmail: "demo@dealer.com", // This will be replaced with actual dealer email in real connections
        connectionDate: Timestamp.now(),
        status: 'active',
        inviteCode: `DEMO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      });
    }
    
    // Commit all the batch writes
    await batch.commit();

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
        productName: 'Layer Feed',
        category: 'Feed',
        currentStock: 200,
        minStockLevel: 60,
        unit: 'bags',
        pricePerUnit: 40,
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
      },
      {
        productName: 'Newcastle Vaccine',
        category: 'Vaccines',
        newRate: 15,
        unit: 'per vial'
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

// Farmer Invitation Functions
export const sendFarmerInvitation = async (
  dealerId: string,
  farmerData: {
    farmerName: string;
    farmerEmail: string;
  }
): Promise<void> => {
  try {
    // Here you would typically send an email invitation
    // For now, we'll just log it
    console.log(`Invitation sent to ${farmerData.farmerEmail}`);
  } catch (error) {
    console.error('Error sending farmer invitation:', error);
    throw error;
  }
};

export const addFarmerToNetwork = async (
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
    console.error('Error adding farmer to network:', error);
    throw error;
  }
};

// Get dealer rates for farmers
export const getDealerRates = (
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

// Export Functions
export const exportReportData = (
  farmers: FarmerData[],
  orders: Order[],
  products: Product[],
  timeFilter: string
) => {
  const reportData = {
    generatedAt: new Date().toISOString(),
    timeFilter: `${timeFilter} days`,
    summary: {
      totalFarmers: farmers.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.status === 'delivered' ? o.totalAmount : 0), 0),
      avgFCR: farmers.length > 0 ? farmers.reduce((sum, f) => sum + f.fcr, 0) / farmers.length : 0,
    },
    farmers: farmers.map(f => ({
      name: f.farmerName,
      email: f.farmerEmail,
      id: f.farmerId,
      chicks: f.chicksReceived,
      feed: f.feedConsumption,
      mortality: f.mortalityRate,
      fcr: f.fcr,
      balance: f.accountBalance,
      lastUpdate: f.lastUpdated.toDate().toISOString(),
    })),
    orders: orders.map(o => ({
      farmer: o.farmerName,
      type: o.orderType,
      quantity: o.quantity,
      amount: o.totalAmount,
      status: o.status,
      date: o.orderDate.toDate().toISOString(),
    })),
  };

  // Create downloadable content
  const jsonContent = JSON.stringify(reportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `dealer-report-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

// Invitation Link Functions
export const generateInvitationLink = (dealerId: string): string => {
  const inviteCode = `${dealerId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return `${window.location.origin}/farmer-connect?invite=${inviteCode}`;
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

export const validateInvitationCode = async (inviteCode: string): Promise<{valid: boolean, dealerId?: string}> => {
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
};

// Dealer Profile Management
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

export const getDealerProfile = async (dealerId: string): Promise<DealerProfile | null> => {
  try {
    // First, try to get from dealerProfiles collection
    const dealerProfileQuery = query(
      collection(db, 'dealerProfiles'),
      where('dealerId', '==', dealerId)
    );
    
    const dealerProfileSnapshot = await getDocs(dealerProfileQuery);
    
    if (!dealerProfileSnapshot.empty) {
      const doc = dealerProfileSnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as DealerProfile;
    }
    
    // If not found in dealerProfiles, check users collection
    const userDoc = await getDoc(doc(db, 'users', dealerId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Check if this user is a dealer
      if (userData.role === 'dealer') {
        // Convert user data to DealerProfile format
        const dealerProfile: DealerProfile = {
          id: userDoc.id,
          dealerId: dealerId,
          businessName: userData.businessName || '',
          ownerName: userData.displayName || '',
          phone: userData.phone || '',
          whatsapp: userData.phone || '', // Use phone as whatsapp if not separate
          email: userData.email || '',
          address: userData.location || '',
          gstNumber: userData.gstNumber || '',
          licenseNumber: userData.licenseNumber || '',
          lastUpdated: userData.lastActive || userData.createdAt
        };
        
        return dealerProfile;
      }
    }
    
    return null;
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
    // Update the user profile in users collection
    const userRef = doc(db, 'users', dealerId);
    await updateDoc(userRef, {
      businessName: profileData.businessName,
      displayName: profileData.ownerName,
      phone: profileData.phone,
      email: profileData.email,
      location: profileData.address,
      lastActive: Timestamp.now()
    });

    // Also maintain a record in dealerProfiles collection
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

// Functions for farmers to get products from connected dealers
export const getConnectedDealerProducts = async (farmerId: string): Promise<Product[]> => {
  try {
    // First get all connected dealers for this farmer
    const dealersQuery = query(
      collection(db, 'farmerDealers'),
      where('farmerId', '==', farmerId)
    );
    
    const dealersSnapshot = await getDocs(dealersQuery);
    const dealerIds: string[] = [];
    
    dealersSnapshot.forEach((doc) => {
      dealerIds.push(doc.data().dealerId);
    });
    
    if (dealerIds.length === 0) {
      return [];
    }
    
    // Get products from all connected dealers
    const allProducts: Product[] = [];
    
    for (const dealerId of dealerIds) {
      const productsQuery = query(
        collection(db, 'dealerProducts'),
        where('dealerId', '==', dealerId),
        orderBy('lastUpdated', 'desc')
      );
      
      const productsSnapshot = await getDocs(productsQuery);
      productsSnapshot.forEach((doc) => {
        allProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
    }
    
    return allProducts;
  } catch (error) {
    console.error('Error getting connected dealer products:', error);
    throw error;
  }
};

export const subscribeToConnectedDealerProducts = (
  farmerId: string,
  callback: (products: Product[]) => void,
  errorCallback?: (error: Error) => void
): (() => void) => {
  let dealerUnsubscribes: (() => void)[] = [];
  let allProducts: Product[] = [];
  
  // First subscribe to the farmer's dealer connections
  const dealersQuery = query(
    collection(db, 'farmerDealers'),
    where('farmerId', '==', farmerId)
  );
  
  const dealersUnsubscribe = onSnapshot(dealersQuery, 
    (dealersSnapshot) => {
      console.log('🔄 subscribeToConnectedDealerProducts - Dealers snapshot:', dealersSnapshot.docs.length);
      
      // Clean up previous product subscriptions
      dealerUnsubscribes.forEach(unsub => unsub());
      dealerUnsubscribes = [];
      allProducts = []; // Reset products when dealers change
      
      const totalDealers = dealersSnapshot.docs.length;
      
      if (totalDealers === 0) {
        console.log('⚠️ subscribeToConnectedDealerProducts - No connected dealers found');
        callback([]);
        return;
      }
      
      console.log(`🔄 subscribeToConnectedDealerProducts - Subscribing to products from ${totalDealers} dealers`);
      
      // Subscribe to products from each connected dealer
      dealersSnapshot.forEach((dealerDoc) => {
        const dealerId = dealerDoc.data().dealerId;
        console.log(`🔄 Setting up subscription for dealer: ${dealerId}`);
        
        const productsQuery = query(
          collection(db, 'dealerProducts'),
          where('dealerId', '==', dealerId)
          // Temporarily removed orderBy to avoid index requirement until indexes are built
          // orderBy('lastUpdated', 'desc')
        );
        
        const productUnsub = onSnapshot(productsQuery, 
          (productsSnapshot) => {
            console.log(`🔄 subscribeToConnectedDealerProducts - Products from dealer ${dealerId}:`, productsSnapshot.docs.length);
            
            // Remove products from this dealer and add new ones
            allProducts = allProducts.filter(p => p.dealerId !== dealerId);
            
            const thisDealerProducts: Product[] = [];
            productsSnapshot.forEach((doc) => {
              const productData = { id: doc.id, ...doc.data() } as Product;
              thisDealerProducts.push(productData);
              console.log(`    - ${productData.productName}: ${productData.currentStock} ${productData.unit}`);
            });
            
            // Add this dealer's products to the global array
            allProducts = [...allProducts, ...thisDealerProducts];
            
            console.log(`🔄 Total products after update: ${allProducts.length}`);
            callback([...allProducts]); // Send a copy to avoid reference issues
          },
          (error) => {
            console.error(`Error subscribing to products for dealer ${dealerId}:`, error);
          }
        );
        
        dealerUnsubscribes.push(productUnsub);
      });
    },
    (error) => {
      console.error('Error subscribing to dealer products:', error);
      if (errorCallback) errorCallback(error);
    }
  );
  
  return () => {
    dealersUnsubscribe();
    dealerUnsubscribes.forEach(unsub => unsub());
  };
};

// Function for farmers to get their connected dealers
export const subscribeToConnectedDealers = (
  farmerId: string,
  callback: (dealers: any[]) => void,
  errorCallback?: (error: Error) => void
): (() => void) => {
  const dealersQuery = query(
    collection(db, 'farmerDealers'),
    where('farmerId', '==', farmerId)
  );
  
  const unsubscribe = onSnapshot(dealersQuery, 
    (snapshot) => {
      const dealers: any[] = [];
      snapshot.forEach((doc) => {
        dealers.push({ id: doc.id, ...doc.data() });
      });
      callback(dealers);
    },
    (error) => {
      console.error('Error subscribing to connected dealers:', error);
      if (errorCallback) errorCallback(error);
    }
  );
  
  return unsubscribe;
};
