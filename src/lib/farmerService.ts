import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// Types for farmer data
export interface Transaction {
  id?: string;
  farmerId: string;
  type: 'income' | 'expense';
  amount: number;
  note: string;
  date: string;
  category: string;
  createdAt: Timestamp;
}

export interface VaccineReminder {
  id?: string;
  farmerId: string;
  name: string;
  date: string;
  status: 'upcoming' | 'overdue' | 'completed';
  description?: string;
  birdGroup?: string;
  createdAt: Timestamp;
}

export interface FarmData {
  id?: string;
  farmerId: string;
  totalIncome: number;
  totalExpenses: number;
  lastUpdated: Timestamp;
}

// Collections
const TRANSACTIONS_COLLECTION = 'transactions';
const VACCINE_REMINDERS_COLLECTION = 'vaccineReminders';
const FARM_DATA_COLLECTION = 'farmData';

// Transaction Functions
export const addTransaction = async (farmerId: string, transaction: Omit<Transaction, 'id' | 'farmerId' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
      ...transaction,
      farmerId,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const getTransactions = async (farmerId: string): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('farmerId', '==', farmerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
  try {
    const docRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId: string) => {
  try {
    await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, transactionId));
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Vaccine Reminder Functions
export const addVaccineReminder = async (farmerId: string, reminder: Omit<VaccineReminder, 'id' | 'farmerId' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, VACCINE_REMINDERS_COLLECTION), {
      ...reminder,
      farmerId,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding vaccine reminder:', error);
    throw error;
  }
};

export const getVaccineReminders = async (farmerId: string): Promise<VaccineReminder[]> => {
  try {
    const q = query(
      collection(db, VACCINE_REMINDERS_COLLECTION),
      where('farmerId', '==', farmerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as VaccineReminder[];
  } catch (error) {
    console.error('Error getting vaccine reminders:', error);
    throw error;
  }
};

export const updateVaccineReminder = async (reminderId: string, updates: Partial<VaccineReminder>) => {
  try {
    const docRef = doc(db, VACCINE_REMINDERS_COLLECTION, reminderId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating vaccine reminder:', error);
    throw error;
  }
};

export const deleteVaccineReminder = async (reminderId: string) => {
  try {
    await deleteDoc(doc(db, VACCINE_REMINDERS_COLLECTION, reminderId));
  } catch (error) {
    console.error('Error deleting vaccine reminder:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToTransactions = (farmerId: string, callback: (transactions: Transaction[]) => void) => {
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
    callback(transactions);
  });
};

export const subscribeToVaccineReminders = (farmerId: string, callback: (reminders: VaccineReminder[]) => void) => {
  const q = query(
    collection(db, VACCINE_REMINDERS_COLLECTION),
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const reminders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as VaccineReminder[];
    callback(reminders);
  });
};

// Utility functions
export const calculateTotals = (transactions: Transaction[]) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  return {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses
  };
};
