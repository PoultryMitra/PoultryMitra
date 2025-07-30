import { 
  addDoc, 
  collection, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Demo data to show how the system works
export const createDemoData = async (dealerId: string) => {
  try {
    // Add demo farmers
    const farmersRef = collection(db, 'dealerFarmers');
    
    const demoFarmers = [
      {
        farmerId: 'FARM001',
        farmerName: 'Raj Kumar',
        farmerEmail: 'raj.kumar@email.com',
        dealerId,
        chicksReceived: 5000,
        feedConsumption: 8500,
        mortalityRate: 2.5,
        currentWeight: 2.1,
        fcr: 1.7,
        totalExpenses: 185000,
        totalIncome: 220000,
        accountBalance: 35000,
        lastUpdated: Timestamp.now()
      },
      {
        farmerId: 'FARM002',
        farmerName: 'Priya Sharma',
        farmerEmail: 'priya.sharma@email.com',
        dealerId,
        chicksReceived: 3000,
        feedConsumption: 5200,
        mortalityRate: 1.8,
        currentWeight: 2.3,
        fcr: 1.73,
        totalExpenses: 115000,
        totalIncome: 145000,
        accountBalance: 30000,
        lastUpdated: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000))
      },
      {
        farmerId: 'FARM003',
        farmerName: 'Mohammad Ali',
        farmerEmail: 'mohammad.ali@email.com',
        dealerId,
        chicksReceived: 2500,
        feedConsumption: 4800,
        mortalityRate: 3.2,
        currentWeight: 1.9,
        fcr: 1.92,
        totalExpenses: 98000,
        totalIncome: 115000,
        accountBalance: 17000,
        lastUpdated: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
      }
    ];

    for (const farmer of demoFarmers) {
      await addDoc(farmersRef, farmer);
    }

    // Add demo orders
    const ordersRef = collection(db, 'dealerOrders');
    
    const demoOrders = [
      {
        farmerId: 'FARM001',
        farmerName: 'Raj Kumar',
        dealerId,
        orderType: 'chicks' as const,
        quantity: 5000,
        unitPrice: 45,
        totalAmount: 225000,
        status: 'delivered' as const,
        orderDate: Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        deliveryDate: Timestamp.fromDate(new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)),
        notes: 'Day-old chicks delivery'
      },
      {
        farmerId: 'FARM001',
        farmerName: 'Raj Kumar',
        dealerId,
        orderType: 'feed' as const,
        quantity: 2000,
        unitPrice: 35,
        totalAmount: 70000,
        status: 'delivered' as const,
        orderDate: Timestamp.fromDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)),
        deliveryDate: Timestamp.fromDate(new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)),
        notes: 'Starter feed'
      },
      {
        farmerId: 'FARM002',
        farmerName: 'Priya Sharma',
        dealerId,
        orderType: 'chicks' as const,
        quantity: 3000,
        unitPrice: 45,
        totalAmount: 135000,
        status: 'delivered' as const,
        orderDate: Timestamp.fromDate(new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)),
        deliveryDate: Timestamp.fromDate(new Date(Date.now() - 23 * 24 * 60 * 60 * 1000)),
        notes: 'Premium broiler chicks'
      },
      {
        farmerId: 'FARM003',
        farmerName: 'Mohammad Ali',
        dealerId,
        orderType: 'vaccine' as const,
        quantity: 500,
        unitPrice: 15,
        totalAmount: 7500,
        status: 'pending' as const,
        orderDate: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        notes: 'Newcastle vaccine'
      }
    ];

    for (const order of demoOrders) {
      await addDoc(ordersRef, order);
    }

    // Add demo products
    const productsRef = collection(db, 'dealerProducts');
    
    const demoProducts = [
      {
        dealerId,
        name: 'Day Old Chicks - Broiler',
        category: 'chicks',
        currentStock: 15000,
        minStockLevel: 5000,
        pricePerUnit: 45,
        unit: 'pieces',
        description: 'High-quality broiler chicks from certified hatchery',
        lastUpdated: Timestamp.now()
      },
      {
        dealerId,
        name: 'Starter Feed',
        category: 'feed',
        currentStock: 500,
        minStockLevel: 1000,
        pricePerUnit: 35,
        unit: 'kg',
        description: 'Nutritious starter feed for chicks 0-3 weeks',
        lastUpdated: Timestamp.now()
      },
      {
        dealerId,
        name: 'Newcastle Vaccine',
        category: 'vaccines',
        currentStock: 200,
        minStockLevel: 100,
        pricePerUnit: 15,
        unit: 'doses',
        description: 'Newcastle disease vaccine for poultry',
        lastUpdated: Timestamp.now()
      }
    ];

    for (const product of demoProducts) {
      await addDoc(productsRef, product);
    }

    console.log('Demo data created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating demo data:', error);
    throw error;
  }
};

export const clearDemoData = async (dealerId: string) => {
  // This would implement clearing demo data
  // For now, we'll just log
  console.log('Demo data clearing not implemented yet');
};
