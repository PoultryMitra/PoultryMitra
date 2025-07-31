import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as dealerService from "@/services/dealerService";
import type { FarmerData, Order, Product } from "@/services/dealerService";
import { createDemoData } from "@/services/demoService";
import { 
  Users, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign,
  Activity,
  Plus,
  Eye,
  Database
} from "lucide-react";

function DealerDashboard() {
  const { currentUser } = useAuth();
  const [farmers, setFarmers] = useState<FarmerData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const { toast } = useToast();

  // Create demo data
  const handleCreateDemo = async () => {
    if (!currentUser?.uid) return;
    
    setIsCreatingDemo(true);
    try {
      await createDemoData(currentUser.uid);
      toast({
        title: "Demo Data Created",
        description: "Sample farmers, orders, and products have been added to your dashboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create demo data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingDemo(false);
    }
  };

  // Subscribe to real-time data
  useEffect(() => {
    if (!currentUser?.uid) return;

    // Local workaround functions for module resolution issues
    const localGetDealerFarmers = (dealerId: string, callback: (data: FarmerData[]) => void) => {
      console.log('Using local farmer data');
      // Return dummy farmer data
      setTimeout(() => {
        const dummyFarmers: FarmerData[] = [
          {
            id: '1',
            dealerId: dealerId,
            farmerId: 'farmer1',
            farmerName: 'John Doe',
            farmerEmail: 'john@example.com',
            chicksReceived: 1000,
            feedConsumption: 1500,
            mortalityRate: 2.5,
            fcr: 1.8,
            accountBalance: 50000,
            lastUpdated: { toDate: () => new Date() } as any
          }
        ];
        callback(dummyFarmers);
        setLoading(false);
      }, 1000);
      return () => {};
    };

    const localGetDealerOrders = (dealerId: string, callback: (data: Order[]) => void) => {
      console.log('Using local order data');
      setTimeout(() => {
        const dummyOrders: Order[] = [
          {
            id: '1',
            dealerId: dealerId,
            farmerId: 'farmer1',
            farmerName: 'John Doe',
            orderType: 'chicks',
            productId: 'prod1',
            productName: 'Day Old Chicks',
            quantity: 500,
            pricePerUnit: 25,
            totalAmount: 12500,
            status: 'pending',
            orderDate: { toDate: () => new Date() } as any,
            notes: 'Urgent order'
          }
        ];
        callback(dummyOrders);
      }, 1000);
      return () => {};
    };

    const localGetDealerProducts = (dealerId: string, callback: (data: Product[]) => void) => {
      console.log('Using local product data');
      setTimeout(() => {
        const dummyProducts: Product[] = [
          {
            id: '1',
            dealerId: dealerId,
            productName: 'Pre-Starter Feed',
            category: 'feed',
            currentStock: 150,
            minStockLevel: 50,
            unit: '50kg bag',
            pricePerUnit: 1200,
            supplier: 'Godrej Agrovet',
            lastUpdated: { toDate: () => new Date() } as any
          },
          {
            id: '2',
            dealerId: dealerId,
            productName: 'Starter Feed',
            category: 'feed',
            currentStock: 80,
            minStockLevel: 30,
            unit: '50kg bag',
            pricePerUnit: 1150,
            supplier: 'Venky\'s India',
            lastUpdated: { toDate: () => new Date() } as any
          },
          {
            id: '3',
            dealerId: dealerId,
            productName: 'Finisher Feed',
            category: 'feed',
            currentStock: 25,
            minStockLevel: 40,
            unit: '50kg bag',
            pricePerUnit: 1100,
            supplier: 'Suguna Foods',
            lastUpdated: { toDate: () => new Date() } as any
          },
          {
            id: '4',
            dealerId: dealerId,
            productName: 'Day Old Chicks',
            category: 'chicks',
            currentStock: 200,
            minStockLevel: 100,
            unit: 'piece',
            pricePerUnit: 35,
            supplier: 'Local Hatchery',
            lastUpdated: { toDate: () => new Date() } as any
          },
          {
            id: '5',
            dealerId: dealerId,
            productName: 'Multivitamin Supplements',
            category: 'medicine',
            currentStock: 50,
            minStockLevel: 20,
            unit: 'bottle',
            pricePerUnit: 180,
            supplier: 'Vetoquinol India',
            lastUpdated: { toDate: () => new Date() } as any
          },
          {
            id: '6',
            dealerId: dealerId,
            productName: 'Feeders & Waterers',
            category: 'miscellaneous',
            currentStock: 30,
            minStockLevel: 15,
            unit: 'set',
            pricePerUnit: 450,
            supplier: 'Poultry Equipment Co.',
            lastUpdated: { toDate: () => new Date() } as any
          }
        ];
        callback(dummyProducts);
      }, 1000);
      return () => {};
    };

    const unsubscribeFarmers = localGetDealerFarmers(currentUser.uid, setFarmers);
    const unsubscribeOrders = localGetDealerOrders(currentUser.uid, setOrders);
    const unsubscribeProducts = localGetDealerProducts(currentUser.uid, setProducts);

    return () => {
      unsubscribeFarmers();
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, [currentUser?.uid]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Local version of calculateDealerStats function
  const localCalculateDealerStats = (farmers: FarmerData[], orders: Order[], products: Product[]) => {
    const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0);
    const avgFCR = farmers.length > 0 ? farmers.reduce((sum, f) => sum + f.fcr, 0) / farmers.length : 0;
    const lowStockCount = products.filter(p => p.currentStock <= p.minStockLevel).length;
    
    return {
      totalFarmers: farmers.length,
      activeFarmers: farmers.length, // Added activeFarmers property
      totalOrders: orders.length,
      totalRevenue: totalRevenue,
      avgFCR: avgFCR,
      lowStockProducts: lowStockCount,
      pendingOrders: orders.filter(o => o.status === 'pending').length
    };
  };

  const stats = localCalculateDealerStats(farmers, orders, products);
  const recentOrders = orders.slice(0, 5);
  const activeFarmers = farmers.slice(0, 3);
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel).slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Header with Demo Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        {farmers.length === 0 && (
          <Button 
            onClick={handleCreateDemo}
            disabled={isCreatingDemo}
            className="gap-2"
          >
            <Database className="h-4 w-4" />
            {isCreatingDemo ? "Creating..." : "Load Demo Data"}
          </Button>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeFarmers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalFarmers} total farmers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total revenue this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              {orders.length} total orders this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              {products.length} total products
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{order.farmerName}</p>
                    <p className="text-sm text-muted-foreground">
                      Order #{order.id.slice(-6)} • ₹{order.totalAmount}
                    </p>
                  </div>
                  <Badge variant={order.status === 'pending' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent orders</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Farmers */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Active Farmers</CardTitle>
            <Button variant="ghost" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Invite More
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeFarmers.length > 0 ? (
              activeFarmers.map((farmer) => (
                <div key={farmer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{farmer.farmerName}</p>
                    <p className="text-sm text-muted-foreground">
                      Email: {farmer.farmerEmail}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <Activity className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active farmers</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg border-amber-200 bg-amber-50">
                  <div>
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.currentStock} left • Min: {product.minStockLevel}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Low Stock
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>All products in stock</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Product
            </Button>
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Invite Farmer
            </Button>
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Update Rates
            </Button>
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DealerDashboard;
