import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  note: string;
  amount: number;
  date: string;
  farmerId: string;
  createdAt: Timestamp;
}

export interface VaccineReminder {
  id: string;
  vaccineName: string;
  reminderDate: Timestamp;
  notes?: string;
  flock?: string;
  dosage?: string;
  method?: string;
  status: 'pending' | 'completed';
  farmerId: string;
  completedDate?: Timestamp;
  createdAt: Timestamp;
}

export interface TransactionInput {
  type: 'income' | 'expense';
  category: string;
  note: string;
  amount: number;
  date: string;
}

export interface VaccineReminderInput {
  vaccineName: string;
  reminderDate: Date;
  notes?: string;
  flock?: string;
  dosage?: string;
  method?: string;
  status: 'pending' | 'completed';
}

// Transaction functions
export const addTransaction = async (userId: string, transaction: TransactionInput): Promise<void> => {
  try {
    console.log('Adding transaction:', transaction);
    const transactionsRef = collection(db, 'userTransactions');
    const transactionData = {
      ...transaction,
      farmerId: userId,
      createdAt: Timestamp.now()
    };
    console.log('Transaction data being saved:', transactionData);
    await addDoc(transactionsRef, transactionData);
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const transactionsRef = collection(db, 'userTransactions');
    const q = query(transactionsRef, where('farmerId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
    
    // Sort on the client side
    transactions.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.date);
      const dateB = b.createdAt?.toDate?.() || new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    return transactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

export const subscribeToTransactions = (
  userId: string, 
  callback: (transactions: Transaction[]) => void
): (() => void) => {
  // Use a simpler approach - get all user's transactions without ordering
  const transactionsRef = collection(db, 'userTransactions');
  const q = query(transactionsRef, where('farmerId', '==', userId));
  
  return onSnapshot(q, 
    (querySnapshot) => {
      const transactions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw transaction data from Firebase:', data);
        return {
          id: doc.id,
          ...data
        };
      }) as Transaction[];
      
      console.log('Processed transactions:', transactions);
      
      // Sort on the client side
      transactions.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.date);
        const dateB = b.createdAt?.toDate?.() || new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      
      callback(transactions);
    },
    (error) => {
      console.error('Error in transactions subscription:', error);
      // Return empty array on error to prevent crashes
      callback([]);
    }
  );
};

// Vaccine reminder functions
export const addVaccineReminder = async (userId: string, reminder: VaccineReminderInput): Promise<void> => {
  try {
    const remindersRef = collection(db, 'userVaccineReminders');
    await addDoc(remindersRef, {
      ...reminder,
      reminderDate: Timestamp.fromDate(reminder.reminderDate),
      farmerId: userId,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding vaccine reminder:', error);
    throw error;
  }
};

export const getVaccineReminders = async (userId: string): Promise<VaccineReminder[]> => {
  try {
    const remindersRef = collection(db, 'userVaccineReminders');
    const q = query(remindersRef, where('farmerId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const reminders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as VaccineReminder[];
    
    // Sort on the client side
    reminders.sort((a, b) => {
      const dateA = a.reminderDate?.toDate?.() || new Date();
      const dateB = b.reminderDate?.toDate?.() || new Date();
      return dateA.getTime() - dateB.getTime();
    });
    
    return reminders;
  } catch (error) {
    console.error('Error getting vaccine reminders:', error);
    throw error;
  }
};

export const subscribeToVaccineReminders = (
  userId: string, 
  callback: (reminders: VaccineReminder[]) => void
): (() => void) => {
  const remindersRef = collection(db, 'userVaccineReminders');
  const q = query(remindersRef, where('farmerId', '==', userId));
  
  return onSnapshot(q, 
    (querySnapshot) => {
      const reminders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VaccineReminder[];
      
      // Sort on the client side
      reminders.sort((a, b) => {
        const dateA = a.reminderDate?.toDate?.() || new Date();
        const dateB = b.reminderDate?.toDate?.() || new Date();
        return dateA.getTime() - dateB.getTime();
      });
      
      callback(reminders);
    },
    (error) => {
      console.error('Error in vaccine reminders subscription:', error);
      callback([]);
    }
  );
};

// Utility functions
export const calculateTotals = (transactions: Transaction[]) => {
  console.log('Calculating totals for transactions:', transactions);
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => {
      console.log(`Income transaction: ${t.amount} (type: ${typeof t.amount})`);
      return sum + Number(t.amount);
    }, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => {
      console.log(`Expense transaction: ${t.amount} (type: ${typeof t.amount})`);
      return sum + Number(t.amount);
    }, 0);
    
  console.log('Calculated totals:', { totalIncome, totalExpenses });
    
  return {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses
  };
};

// Update vaccine reminder
export const updateVaccineReminder = async (reminderId: string, updates: Partial<VaccineReminder>): Promise<void> => {
  try {
    const reminderRef = doc(db, 'userVaccineReminders', reminderId);
    await updateDoc(reminderRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating vaccine reminder:', error);
    throw error;
  }
};

// Delete vaccine reminder
export const deleteVaccineReminder = async (reminderId: string): Promise<void> => {
  try {
    const reminderRef = doc(db, 'userVaccineReminders', reminderId);
    await deleteDoc(reminderRef);
  } catch (error) {
    console.error('Error deleting vaccine reminder:', error);
    throw error;
  }
};

// Additional interfaces for dealer-farmer connections
export interface FarmerDealerData {
  dealerId: string;
  dealerName: string;
  dealerEmail: string;
  dealerPhone?: string;
  dealerAddress?: string;
  dealerCompany?: string;
  connectedAt: Date;
}

export interface DealerProduct {
  id: string;
  productName: string;
  pricePerUnit: number;
  unit: string;
  currentStock: number;
  supplier: string;
  dealerId: string;
}

// Function for farmers to get their connected dealers
export const subscribeToConnectedDealers = (
  farmerId: string,
  callback: (dealers: FarmerDealerData[]) => void,
  errorCallback?: (error: Error) => void
): (() => void) => {
  const dealersQuery = query(
    collection(db, 'farmerDealers'),
    where('farmerId', '==', farmerId)
  );
  
  const unsubscribe = onSnapshot(dealersQuery, 
    async (snapshot) => {
      const dealers: FarmerDealerData[] = [];
      
      // Fetch fresh dealer profile data for each connection
      for (const doc of snapshot.docs) {
        const connectionData = doc.data();
        const dealerId = connectionData.dealerId;
        
        try {
          // Try to get fresh dealer profile from users collection
          const userDoc = await getDocs(query(
            collection(db, 'users'),
            where('uid', '==', dealerId)
          ));
          
          let dealerData = connectionData; // Fallback to stored data
          
          if (!userDoc.empty) {
            const freshDealerData = userDoc.docs[0].data();
            // Merge fresh data with connection data
            dealerData = {
              ...connectionData,
              dealerName: freshDealerData.displayName || connectionData.dealerName,
              dealerEmail: freshDealerData.email || connectionData.dealerEmail,
              dealerPhone: freshDealerData.phone || connectionData.dealerPhone,
              dealerCompany: freshDealerData.businessName || connectionData.dealerCompany,
              dealerAddress: freshDealerData.address || connectionData.dealerAddress
            };
          }
          
          dealers.push({ 
            id: doc.id, 
            ...dealerData,
            connectedAt: connectionData.connectedDate?.toDate() || new Date()
          } as any);
        } catch (error) {
          console.warn(`Failed to fetch fresh data for dealer ${dealerId}:`, error);
          // Use stored data as fallback
          dealers.push({ 
            id: doc.id, 
            ...connectionData,
            connectedAt: connectionData.connectedDate?.toDate() || new Date()
          } as any);
        }
      }
      
      callback(dealers);
    },
    (error) => {
      console.error('Error subscribing to connected dealers:', error);
      if (errorCallback) errorCallback(error);
    }
  );
  
  return unsubscribe;
};

// Function for farmers to get products from connected dealers
export const subscribeToConnectedDealerProducts = (
  farmerId: string,
  callback: (products: DealerProduct[]) => void,
  errorCallback?: (error: Error) => void
): (() => void) => {
  let dealerUnsubscribes: (() => void)[] = [];
  let allProducts: DealerProduct[] = [];
  
  // Helper function to update products for a specific dealer
  const updateDealerProducts = (dealerId: string, newProducts: DealerProduct[]) => {
    // Remove existing products from this dealer
    allProducts = allProducts.filter(p => p.dealerId !== dealerId);
    // Add new products from this dealer
    allProducts = [...allProducts, ...newProducts];
    // Call the callback with updated products
    callback([...allProducts]); // Send a copy to avoid reference issues
  };
  
  // First subscribe to the farmer's dealer connections
  const dealersQuery = query(
    collection(db, 'farmerDealers'),
    where('farmerId', '==', farmerId)
  );
  
  const dealersUnsubscribe = onSnapshot(dealersQuery, 
    (dealersSnapshot) => {
      // Clean up previous product subscriptions
      dealerUnsubscribes.forEach(unsub => unsub());
      dealerUnsubscribes = [];
      allProducts = []; // Reset products when dealers change
      
      if (dealersSnapshot.docs.length === 0) {
        callback([]);
        return;
      }
      
      // Subscribe to products from each connected dealer
      dealersSnapshot.forEach((dealerDoc) => {
        const dealerId = dealerDoc.data().dealerId;
        
        const productsQuery = query(
          collection(db, 'dealerProducts'),
          where('dealerId', '==', dealerId)
        );
        
        const productUnsub = onSnapshot(productsQuery, (productsSnapshot) => {
          const thisDealerProducts: DealerProduct[] = [];
          
          productsSnapshot.forEach((doc) => {
            thisDealerProducts.push({ id: doc.id, ...doc.data() } as DealerProduct);
          });
          
          updateDealerProducts(dealerId, thisDealerProducts);
        });
        
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
