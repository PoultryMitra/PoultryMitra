import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  Timestamp,
  addDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SystemActivity {
  id: string;
  type: 'user_registration' | 'connection_created' | 'rate_update' | 'product_added' | 'system_backup';
  title: string;
  description: string;
  timestamp: Timestamp;
  userId?: string;
  userEmail?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeFarmers: number;
  totalDealers: number;
  problemConnections: number;
  totalConnections: number;
  totalProducts: number;
  recentRegistrations: number; // last 7 days
}

interface UserData {
  id: string;
  email?: string;
  displayName?: string;
  role?: string;
  createdAt?: Timestamp;
  profileComplete?: boolean;
  [key: string]: any;
}

interface ConnectionData {
  id: string;
  dealerEmail?: string;
  dealerName?: string;
  farmerName?: string;
  connectedDate?: Timestamp;
  [key: string]: any;
}

interface ProductData {
  id: string;
  productName?: string;
  pricePerUnit?: number;
  unit?: string;
  createdAt?: Timestamp;
  [key: string]: any;
}

export class AdminService {
  
  // Get comprehensive admin statistics
  static async getAdminStats(): Promise<AdminStats> {
    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users: UserData[] = usersSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as UserData));
      
      const totalUsers = users.length;
      const activeFarmers = users.filter(user => user.role === 'farmer').length;
      const totalDealers = users.filter(user => user.role === 'dealer').length;
      
      // Get recent registrations (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUsers = users.filter(user => {
        const createdAt = user.createdAt?.toDate?.() || new Date(0);
        return createdAt >= sevenDaysAgo;
      });
      const recentRegistrations = recentUsers.length;

      // Get total connections
      const connectionsSnapshot = await getDocs(collection(db, 'farmerDealers'));
      const totalConnections = connectionsSnapshot.size;

      // Get problem connections
      const problemConnections = connectionsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.dealerEmail === 'dealer@example.com' || data.dealerName === 'Dealer';
      }).length;

      // Get total products
      const productsSnapshot = await getDocs(collection(db, 'dealerProducts'));
      const totalProducts = productsSnapshot.size;

      return {
        totalUsers,
        activeFarmers,
        totalDealers,
        problemConnections,
        totalConnections,
        totalProducts,
        recentRegistrations
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }

  // Market rates (admin-managed) - add a market rate and subscribe to market rates
  static async addMarketRate(rateData: { category: string; subcategory: string; rate: number; previousRate?: number; region: string; status?: string; }) {
    try {
      const ratesRef = collection(db, 'marketRates');
      await addDoc(ratesRef, {
        ...rateData,
        status: rateData.status || 'active',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding market rate:', error);
      throw error;
    }
  }

  static getMarketRates(callback: (rates: any[]) => void) {
    try {
      const q = query(collection(db, 'marketRates'), orderBy('updatedAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const rates: any[] = [];
        snapshot.forEach(doc => {
          rates.push({ id: doc.id, ...doc.data() });
        });
        callback(rates);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to market rates:', error);
      return () => {};
    }
  }

  // Get recent system activities
  static async getRecentActivities(): Promise<SystemActivity[]> {
    try {
      const activities: SystemActivity[] = [];

      // Get recent user registrations
      const usersSnapshot = await getDocs(
        query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(5)
        )
      );

      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        if (userData.createdAt) {
          activities.push({
            id: `user_${doc.id}`,
            type: 'user_registration',
            title: 'New user registration',
            description: `${userData.displayName || userData.email} registered as ${userData.role || 'user'}`,
            timestamp: userData.createdAt,
            userId: doc.id,
            userEmail: userData.email
          });
        }
      });

      // Get recent connections
      const connectionsSnapshot = await getDocs(
        query(
          collection(db, 'farmerDealers'),
          orderBy('connectedDate', 'desc'),
          limit(3)
        )
      );

      connectionsSnapshot.docs.forEach(doc => {
        const connectionData = doc.data();
        if (connectionData.connectedDate) {
          activities.push({
            id: `connection_${doc.id}`,
            type: 'connection_created',
            title: 'New farmer-dealer connection',
            description: `${connectionData.farmerName} connected with ${connectionData.dealerName}`,
            timestamp: connectionData.connectedDate
          });
        }
      });

      // Get recent products
      const productsSnapshot = await getDocs(
        query(
          collection(db, 'dealerProducts'),
          orderBy('createdAt', 'desc'),
          limit(3)
        )
      );

      productsSnapshot.docs.forEach(doc => {
        const productData = doc.data();
        if (productData.createdAt) {
          activities.push({
            id: `product_${doc.id}`,
            type: 'product_added',
            title: 'New product added',
            description: `${productData.productName} added by dealer (₹${productData.pricePerUnit}/${productData.unit})`,
            timestamp: productData.createdAt
          });
        }
      });

      // Sort all activities by timestamp
      activities.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

      // Return top 10 most recent activities
      return activities.slice(0, 10);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  // Get detailed user analytics
  static async getUserAnalytics() {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users: UserData[] = usersSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as UserData));

      // User registration over time (last 28 days)
      const dailyRegistrations = new Map<string, number>();
      const today = new Date();
      
      // Initialize last 28 days
      for (let i = 27; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dailyRegistrations.set(dateKey, 0);
      }

      // Count registrations by day
      users.forEach(user => {
        if (user.createdAt) {
          const createdDate = user.createdAt.toDate();
          const dateKey = createdDate.toISOString().split('T')[0];
          if (dailyRegistrations.has(dateKey)) {
            dailyRegistrations.set(dateKey, (dailyRegistrations.get(dateKey) || 0) + 1);
          }
        }
      });

      // Role distribution
      const roleDistribution = {
        farmer: users.filter(u => u.role === 'farmer').length,
        dealer: users.filter(u => u.role === 'dealer').length,
        admin: users.filter(u => u.role === 'admin').length,
        other: users.filter(u => !u.role || !['farmer', 'dealer', 'admin'].includes(u.role)).length
      };

      return {
        dailyRegistrations: Array.from(dailyRegistrations.entries()).map(([date, count]) => ({
          date,
          count
        })),
        roleDistribution,
        totalUsers: users.length,
        profileCompleteUsers: users.filter(u => u.profileComplete).length
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }
}
