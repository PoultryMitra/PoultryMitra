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

export interface InventoryItem {
  id: string;
  dealerId: string;
  name: string;
  category: 'Feed' | 'Medicine' | 'Equipment' | 'Chicks' | 'Other';
  currentStock: number;
  unit: string; // 'bags', 'pieces', 'bottles', etc.
  costPrice: number;
  sellingPrice: number;
  totalValue: number;
  supplier?: string;
  minStockLevel: number;
  lastUpdated: Timestamp;
}

export interface StockTransaction {
  id: string;
  dealerId: string;
  inventoryItemId: string;
  itemName: string;
  transactionType: 'add' | 'remove';
  quantity: number;
  reason: string; // 'purchase', 'sale', 'given_to_farmer', 'damaged', etc.
  date: Timestamp;
}

// Get dealer inventory with real-time updates
export const getDealerInventory = (
  dealerId: string,
  callback: (inventory: InventoryItem[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'dealerInventory'),
    where('dealerId', '==', dealerId),
    orderBy('lastUpdated', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const inventory: InventoryItem[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      inventory.push({ 
        id: doc.id, 
        ...data,
        totalValue: data.currentStock * data.pricePerUnit
      } as InventoryItem);
    });
    callback(inventory);
  });

  return unsubscribe;
};

// Add new inventory item
export const addInventoryItem = async (
  dealerId: string,
  itemData: Omit<InventoryItem, 'id' | 'dealerId' | 'totalValue' | 'lastUpdated'>
): Promise<void> => {
  try {
    const inventoryRef = collection(db, 'dealerInventory');
    
    await addDoc(inventoryRef, {
      ...itemData,
      dealerId,
      totalValue: itemData.currentStock * itemData.costPrice,
      lastUpdated: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
};

// Update stock quantity
export const updateStock = async (
  inventoryItemId: string,
  dealerId: string,
  quantityChange: number,
  reason: string,
  transactionType: 'add' | 'remove'
): Promise<void> => {
  try {
    // Get current item data
    const inventoryRef = doc(db, 'dealerInventory', inventoryItemId);
    
    // Get current item
    const inventoryQuery = query(
      collection(db, 'dealerInventory'),
      where('dealerId', '==', dealerId)
    );
    
    const inventoryDocs = await getDocs(inventoryQuery);
    const currentItem = inventoryDocs.docs.find(doc => doc.id === inventoryItemId);
    
    if (!currentItem) throw new Error('Inventory item not found');
    
    const currentData = currentItem.data();
    const newStock = transactionType === 'add' 
      ? currentData.currentStock + quantityChange 
      : currentData.currentStock - quantityChange;
    
    if (newStock < 0) {
      throw new Error('Cannot reduce stock below zero');
    }
    
    // Update inventory
    await updateDoc(inventoryRef, {
      currentStock: newStock,
      totalValue: newStock * currentData.pricePerUnit,
      lastUpdated: Timestamp.now()
    });
    
    // Record transaction
    const transactionRef = collection(db, 'stockTransactions');
    await addDoc(transactionRef, {
      dealerId,
      inventoryItemId,
      itemName: currentData.itemName,
      transactionType,
      quantity: quantityChange,
      reason,
      date: Timestamp.now()
    });
    
  } catch (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
};

// Get stock transactions history
export const getStockTransactions = (
  dealerId: string,
  callback: (transactions: StockTransaction[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'stockTransactions'),
    where('dealerId', '==', dealerId),
    orderBy('date', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const transactions: StockTransaction[] = [];
    snapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as StockTransaction);
    });
    callback(transactions);
  });

  return unsubscribe;
};

// Export service object
export const inventoryService = {
  addInventoryItem,
  getDealerInventory,
  updateStock,
  getStockTransactions,
  subscribeToInventory: getDealerInventory,
  addStock: (dealerId: string, itemId: string, quantity: number, notes?: string) => 
    updateStock(itemId, dealerId, quantity, notes || 'Manual stock addition', 'add'),
  removeStock: (dealerId: string, itemId: string, quantity: number, notes?: string) => 
    updateStock(itemId, dealerId, quantity, notes || 'Manual stock removal', 'remove'),
  deleteInventoryItem: async (dealerId: string, itemId: string) => {
    // Add delete functionality if needed
    throw new Error('Delete functionality not implemented yet');
  }
};
