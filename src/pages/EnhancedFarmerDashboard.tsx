import React, { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  ShoppingCart, 
  CreditCard, 
  Activity,
  AlertCircle,
  RefreshCw,
  Shield,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';

// Enhanced imports
import { useFarmerDashboardStability } from '@/hooks/useFarmerDashboardStability';
import { FarmerDashboardErrorBoundary } from '@/components/error/FarmerDashboardErrorBoundary';
import { CreditDebitNoteManager } from '@/components/finance/CreditDebitNoteManager';

// Existing imports
import { getFarmerDealers, type FarmerDealerData } from "@/services/connectionService";
import { 
  orderService, 
  type OrderRequest, 
  type FarmerAccountTransaction,
  type FarmerAccountBalance
} from "@/services/orderService";

// Loading component
const LoadingCard = ({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </CardContent>
  </Card>
);

// Stability indicator component
const StabilityIndicator = ({ isStable, isRecovering }: { isStable: boolean, isRecovering: boolean }) => {
  if (isStable && !isRecovering) {
    return (
      <Badge className="bg-green-100 text-green-800">
        <Shield className="w-3 h-3 mr-1" />
        System Stable
      </Badge>
    );
  }
  
  if (isRecovering) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800">
        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
        Recovering
      </Badge>
    );
  }
  
  return (
    <Badge className="bg-red-100 text-red-800">
      <AlertCircle className="w-3 h-3 mr-1" />
      Unstable
    </Badge>
  );
};

export default function EnhancedFarmerDashboard() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { 
    executeWithStability, 
    isStable, 
    isRecovering, 
    lastError,
    operationCount,
    resetStability,
    forceStabilityCheck
  } = useFarmerDashboardStability();

  // State management with stability
  const [connectedDealers, setConnectedDealers] = useState<FarmerDealerData[]>([]);
  const [orderRequests, setOrderRequests] = useState<OrderRequest[]>([]);
  const [farmerTransactions, setFarmerTransactions] = useState<FarmerAccountTransaction[]>([]);
  const [farmerBalances, setFarmerBalances] = useState<FarmerAccountBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Statistics
  const [dashboardStats, setDashboardStats] = useState({
    totalConnectedDealers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalBalance: 0,
    creditNotesCount: 0,
    debitNotesCount: 0
  });

  // Initialize dashboard data with stability
  useEffect(() => {
    if (!currentUser?.uid) return;

    const initializeDashboard = async () => {
      console.log('🚀 Enhanced Farmer Dashboard: Initializing with stability features');

      // Force stability check first
      const isStable = await forceStabilityCheck();
      if (!isStable) {
        console.warn('⚠️ System is not stable, will retry initialization');
        return;
      }

      // Load connected dealers
      await executeWithStability(
        async () => {
          return new Promise<void>((resolve) => {
            const unsubscribe = getFarmerDealers(currentUser.uid, (dealers) => {
              setConnectedDealers(dealers);
              console.log('✅ Connected dealers loaded:', dealers.length);
              resolve();
            });
            // Store unsubscribe function for cleanup
            (window as any)._farmerDealersUnsubscribe = unsubscribe;
          });
        },
        'Load Connected Dealers',
        { showErrorToast: true }
      );

      // Load order requests
      await executeWithStability(
        async () => {
          return new Promise<void>((resolve) => {
            const unsubscribe = orderService.subscribeFarmerOrderRequests(
              currentUser.uid,
              (orders) => {
                setOrderRequests(orders);
                console.log('✅ Order requests loaded:', orders.length);
                resolve();
              }
            );
            (window as any)._farmerOrdersUnsubscribe = unsubscribe;
          });
        },
        'Load Order Requests',
        { showErrorToast: true }
      );

      // Load transactions
      await executeWithStability(
        async () => {
          return new Promise<void>((resolve) => {
            const unsubscribe = orderService.subscribeFarmerTransactions(
              currentUser.uid,
              (transactions) => {
                setFarmerTransactions(transactions);
                const balances = orderService.calculateFarmerBalances(transactions);
                setFarmerBalances(balances);
                console.log('✅ Transactions loaded:', transactions.length);
                resolve();
              }
            );
            (window as any)._farmerTransactionsUnsubscribe = unsubscribe;
          });
        },
        'Load Transactions',
        { showErrorToast: true }
      );

      setLoading(false);
    };

    initializeDashboard();

    // Cleanup function
    return () => {
      if ((window as any)._farmerDealersUnsubscribe) {
        (window as any)._farmerDealersUnsubscribe();
      }
      if ((window as any)._farmerOrdersUnsubscribe) {
        (window as any)._farmerOrdersUnsubscribe();
      }
      if ((window as any)._farmerTransactionsUnsubscribe) {
        (window as any)._farmerTransactionsUnsubscribe();
      }
    };
  }, [currentUser?.uid, executeWithStability, forceStabilityCheck]);

  // Calculate dashboard statistics
  useEffect(() => {
    const stats = {
      totalConnectedDealers: connectedDealers.length,
      totalOrders: orderRequests.length,
      pendingOrders: orderRequests.filter(o => o.status === 'pending').length,
      totalBalance: farmerBalances.reduce((sum, b) => sum + b.netBalance, 0),
      creditNotesCount: farmerTransactions.filter(t => t.transactionType === 'credit').length,
      debitNotesCount: farmerTransactions.filter(t => t.transactionType === 'debit').length
    };
    
    setDashboardStats(stats);
  }, [connectedDealers, orderRequests, farmerBalances, farmerTransactions]);

  // Force refresh handler
  const handleForceRefresh = async () => {
    await executeWithStability(
      async () => {
        console.log('🔄 Enhanced Farmer Dashboard: Force refresh requested');
        resetStability();
        window.location.reload();
      },
      'Force Refresh Dashboard',
      { showSuccessToast: false }
    );
  };

  // Manual stability reset
  const handleStabilityReset = async () => {
    await executeWithStability(
      async () => {
        console.log('🔧 Resetting dashboard stability');
        resetStability();
        toast({
          title: "Stability Reset",
          description: "Dashboard stability has been reset successfully",
        });
      },
      'Reset Dashboard Stability',
      { showSuccessToast: false }
    );
  };

  if (loading) {
    return (
      <FarmerDashboardErrorBoundary>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
            <StabilityIndicator isStable={isStable} isRecovering={isRecovering} />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <LoadingCard title="Connected Dealers" />
            <LoadingCard title="Order Requests" />
            <LoadingCard title="Account Balance" />
            <LoadingCard title="Recent Activity" />
          </div>
        </div>
      </FarmerDashboardErrorBoundary>
    );
  }

  return (
    <FarmerDashboardErrorBoundary>
      <div className="p-6 space-y-6">
        {/* Enhanced Header with Stability Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Enhanced Farmer Dashboard</h1>
            <p className="text-gray-600">
              Manage your poultry business with improved stability and financial tools
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <span>Operations: {operationCount}</span>
              {lastError && (
                <span className="text-red-600">Last Error: {lastError.message.substring(0, 50)}...</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <StabilityIndicator isStable={isStable} isRecovering={isRecovering} />
            <Button variant="outline" size="sm" onClick={handleStabilityReset}>
              <Shield className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handleForceRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected Dealers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalConnectedDealers}</div>
              <p className="text-xs text-muted-foreground">
                Active business connections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${dashboardStats.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{Math.abs(dashboardStats.totalBalance).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.totalBalance >= 0 ? 'Credit balance' : 'Outstanding amount'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Financial Notes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.creditNotesCount + dashboardStats.debitNotesCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.creditNotesCount} credit, {dashboardStats.debitNotesCount} debit
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="account">My Account</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Connected Dealers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Connected Dealers
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your business partners
                  </p>
                </CardHeader>
                <CardContent>
                  {connectedDealers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No connected dealers</h3>
                      <p className="text-gray-600">Ask your dealer for an invitation code to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {connectedDealers.slice(0, 3).map((dealer) => (
                        <div key={dealer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{dealer.dealerName}</p>
                            <p className="text-sm text-gray-600">{dealer.dealerEmail}</p>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      ))}
                      {connectedDealers.length > 3 && (
                        <p className="text-sm text-gray-600 text-center">
                          +{connectedDealers.length - 3} more dealers
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Recent Orders
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your latest order requests
                  </p>
                </CardHeader>
                <CardContent>
                  {orderRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600">Start by requesting feed, medicine, or chicks from your dealers.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orderRequests.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{order.orderType}</p>
                            <p className="text-sm text-gray-600">
                              {order.quantity} {order.unit} from {order.dealerName}
                            </p>
                          </div>
                          <Badge
                            className={
                              order.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {order.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {order.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {order.status}
                          </Badge>
                        </div>
                      ))}
                      {orderRequests.length > 3 && (
                        <p className="text-sm text-gray-600 text-center">
                          +{orderRequests.length - 3} more orders
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            {/* Orders content will be implemented here */}
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your order requests and track their status
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Order Management</h3>
                  <p className="text-gray-600">This section will contain detailed order management features.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            {/* Account Balances */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {farmerBalances.map((balance) => (
                <Card key={balance.dealerId}>
                  <CardHeader>
                    <CardTitle className="text-lg">{balance.dealerName}</CardTitle>
                    <p className="text-sm text-muted-foreground">Account Balance</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">You owe:</span>
                        <span className="text-sm font-medium text-red-600">₹{balance.creditBalance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">They owe:</span>
                        <span className="text-sm font-medium text-green-600">₹{balance.debitBalance}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between">
                        <span className="font-medium">Net Balance:</span>
                        <span className={`font-medium ${balance.netBalance > 0 ? 'text-red-600' : balance.netBalance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                          {balance.netBalance > 0 && '+'}₹{balance.netBalance}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your recent account activities
                </p>
              </CardHeader>
              <CardContent>
                {farmerTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-600">Your transaction history will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {farmerTransactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${transaction.transactionType === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {transaction.transactionType === 'credit' ? 
                              <TrendingUp className="w-4 h-4 text-green-600" /> : 
                              <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                            }
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.dealerName} • {transaction.date.toDate().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.transactionType === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance" className="space-y-6">
            <Suspense fallback={<LoadingCard title="Credit/Debit Notes" />}>
              <CreditDebitNoteManager 
                userRole="farmer"
                targetUserId={undefined}
                targetUserName={undefined}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </FarmerDashboardErrorBoundary>
  );
}
