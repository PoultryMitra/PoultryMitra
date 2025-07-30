import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs,
  Timestamp 
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
  vaccine: string;
  date: string;
  description: string;
  birdGroup: string;
  farmerId: string;
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
  vaccine: string;
  date: string;
  description: string;
  birdGroup: string;
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
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
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
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
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
