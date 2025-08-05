import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  subscribeToConnectedDealerProducts,
  subscribeToConnectedDealers,
  type Product 
} from '@/services/dealerService';
import { 
  getFarmerDealers,
  type FarmerDealerData 
} from '@/services/connectionService';
import { 
  orderService,
  type OrderRequest,
  type FarmerAccountTransaction,
  type FarmerAccountBalance
} from '@/services/orderService';
import { 
  ShoppingCart, 
  Package, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  MapPin,
  Store,
  CreditCard,
  History,
  TrendingUp,
  TrendingDown,
  Plus
} from 'lucide-react';

export default function FarmerOrdering() {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // State management
  const [connectedDealers, setConnectedDealers] = useState<FarmerDealerData[]>([]);
  const [dealerProducts, setDealerProducts] = useState<Product[]>([]);
  const [myOrders, setMyOrders] = useState<OrderRequest[]>([]);
  const [transactions, setTransactions] = useState<FarmerAccountTransaction[]>([]);
  const [accountBalances, setAccountBalances] = useState<FarmerAccountBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dealers');

  // Filter states
  const [selectedDealer, setSelectedDealer] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDealerData, setSelectedDealerData] = useState<FarmerDealerData | null>(null);

  // Order form state
  const [orderForm, setOrderForm] = useState({
    orderType: 'Feed' as 'Feed' | 'Medicine' | 'Chicks',
    quantity: '',
    unit: 'bags',
    notes: '',
    urgency: 'normal' as 'normal' | 'urgent'
  });

  // Load data
  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to connected dealers
    const unsubscribeDealers = getFarmerDealers(currentUser.uid, (dealers) => {
      console.log('🔄 FarmerOrdering - Connected dealers updated:', dealers.length, dealers);
      setConnectedDealers(dealers);
    });

    // Subscribe to dealer products
    const unsubscribeProducts = subscribeToConnectedDealerProducts(currentUser.uid, (products) => {
      console.log('🔄 FarmerOrdering - Dealer products updated:', products.length, products);
      setDealerProducts(products);
    });

    // Subscribe to my orders
    const unsubscribeOrders = orderService.subscribeFarmerOrderRequests(currentUser.uid, (orders) => {
      setMyOrders(orders);
    });

    // Subscribe to transactions
    const unsubscribeTransactions = orderService.subscribeFarmerTransactions(currentUser.uid, (transactions) => {
      setTransactions(transactions);
      // Calculate balances
      const balances = orderService.calculateFarmerBalances(transactions);
      setAccountBalances(balances);
    });

    return () => {
      unsubscribeDealers();
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeTransactions();
    };
  }, [currentUser]);

  // Filter functions
  const filteredProducts = dealerProducts.filter(product => {
    const matchesDealer = selectedDealer === 'all' || product.dealerId === selectedDealer;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const inStock = product.currentStock > 0;
    
    return matchesDealer && matchesCategory && inStock;
  });

  console.log('🔍 FarmerOrdering - Filtering products:', {
    totalProducts: dealerProducts.length,
    filteredProducts: filteredProducts.length,
    selectedDealer,
    categoryFilter,
    connectedDealers: connectedDealers.length
  });

  const filteredOrders = myOrders.filter(order => {
    const matchesDealer = selectedDealer === 'all' || order.dealerId === selectedDealer;
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    
    return matchesDealer && matchesStatus;
  });

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!currentUser || !selectedDealerData) return;
    
    try {
      setLoading(true);
      
      await orderService.submitOrderRequest(
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Farmer',
        selectedDealerData.dealerId,
        selectedDealerData.dealerName,
        {
          orderType: orderForm.orderType,
          quantity: parseInt(orderForm.quantity),
          unit: orderForm.unit,
          notes: orderForm.notes
        }
      );
      
      toast({
        title: "Order Submitted",
        description: `Your ${orderForm.orderType.toLowerCase()} request has been sent to ${selectedDealerData.dealerName}`,
      });
      
      setShowOrderModal(false);
      resetOrderForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit order request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle quick order (from product card)
  const handleQuickOrder = (product: Product, dealerData: FarmerDealerData) => {
    setSelectedProduct(product);
    setSelectedDealerData(dealerData);
    setOrderForm({
      orderType: product.category as 'Feed' | 'Medicine' | 'Chicks',
      quantity: '1',
      unit: product.unit,
      notes: `Request for ${product.productName}`,
      urgency: 'normal'
    });
    setShowOrderModal(true);
  };

  // Reset order form
  const resetOrderForm = () => {
    setOrderForm({
      orderType: 'Feed',
      quantity: '',
      unit: 'bags',
      notes: '',
      urgency: 'normal'
    });
    setSelectedProduct(null);
    setSelectedDealerData(null);
  };

  // Get dealer data by ID
  const getDealerById = (dealerId: string) => {
    return connectedDealers.find(d => d.dealerId === dealerId);
  };

  // Get order status color
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get order status icon
  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <Package className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Calculate totals
  const totalPendingOrders = myOrders.filter(o => o.status === 'pending').length;
  const totalApprovedOrders = myOrders.filter(o => o.status === 'approved').length;
  const totalBalance = accountBalances.reduce((sum, balance) => sum + balance.netBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">Order from your connected dealers</p>
        </div>
        <div className="flex gap-3 sm:gap-4 text-sm">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{totalPendingOrders}</div>
            <div className="text-gray-600 text-xs sm:text-sm">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{totalApprovedOrders}</div>
            <div className="text-gray-600 text-xs sm:text-sm">Approved</div>
          </div>
          <div className="text-center">
            <div className={`text-xl sm:text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{Math.abs(totalBalance).toLocaleString()}
            </div>
            <div className="text-gray-600 text-xs sm:text-sm">{totalBalance >= 0 ? 'Credit' : 'Outstanding'}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center">
              <Store className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Connected Dealers</p>
                <p className="text-lg sm:text-2xl font-bold">{connectedDealers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Available Products</p>
                <p className="text-lg sm:text-2xl font-bold">{dealerProducts.filter(p => p.currentStock > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center">
              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-lg sm:text-2xl font-bold">{myOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center">
              <CreditCard className={`h-6 w-6 sm:h-8 sm:w-8 ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Account Balance</p>
                <p className={`text-lg sm:text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{Math.abs(totalBalance).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="dealer-filter" className="text-sm">Filter by Dealer</Label>
              <Select value={selectedDealer} onValueChange={setSelectedDealer}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Dealers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dealers</SelectItem>
                  {connectedDealers.filter(dealer => dealer.dealerId && dealer.dealerId !== '').map((dealer) => (
                    <SelectItem key={dealer.dealerId} value={dealer.dealerId}>
                      {dealer.dealerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category-filter" className="text-sm">Filter by Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Feed">Feed</SelectItem>
                  <SelectItem value="Medicine">Medicine</SelectItem>
                  <SelectItem value="Chicks">Chicks</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter" className="text-sm">Order Status</Label>
              <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="dealers" className="text-xs sm:text-sm">
            <Store className="w-4 h-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Dealers</span>
            <span className="sm:hidden">({connectedDealers.length})</span>
            <span className="hidden sm:inline"> ({connectedDealers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs sm:text-sm">
            <Package className="w-4 h-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Products</span>
            <span className="sm:hidden">({filteredProducts.length})</span>
            <span className="hidden sm:inline"> ({filteredProducts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs sm:text-sm">
            <ShoppingCart className="w-4 h-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Orders</span>
            <span className="sm:hidden">({myOrders.length})</span>
            <span className="hidden sm:inline"> ({myOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="text-xs sm:text-sm">
            <CreditCard className="w-4 h-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Account</span>
            <span className="sm:hidden">A</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Dealers Tab */}
        <TabsContent value="dealers" className="space-y-4">
          {connectedDealers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No connected dealers</h3>
                <p className="text-gray-600 mb-4">Connect with dealers to start ordering</p>
                <Button onClick={() => window.location.href = '/farmer-connect'}>
                  Connect with Dealers
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {connectedDealers.map((dealer) => {
                const dealerBalance = accountBalances.find(b => b.dealerId === dealer.dealerId);
                const currentDealerProducts = dealerProducts.filter(p => p.dealerId === dealer.dealerId);
                
                return (
                  <Card key={dealer.dealerId} className="border">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{dealer.dealerName}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{dealer.dealerCompany}</p>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2">Connected</Badge>
                      </div>
                      
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{dealer.dealerPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{dealer.dealerAddress}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span>{currentDealerProducts.filter(p => p.currentStock > 0).length} products available</span>
                        </div>
                      </div>
                      
                      {dealerBalance && (
                        <div className="p-2 bg-gray-50 rounded mb-3 sm:mb-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                            <span className="text-xs sm:text-sm text-gray-600">Account Balance:</span>
                            <span className={`font-medium text-xs sm:text-sm ${dealerBalance.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ₹{Math.abs(dealerBalance.netBalance).toLocaleString()}
                              <span className="hidden sm:inline">
                                {dealerBalance.netBalance >= 0 ? ' (Credit)' : ' (Outstanding)'}
                              </span>
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          className="flex-1 text-xs sm:text-sm"
                          onClick={() => {
                            setSelectedDealerData(dealer);
                            resetOrderForm();
                            setShowOrderModal(true);
                          }}
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Place Order
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs sm:text-sm"
                          onClick={() => {
                            setSelectedDealer(dealer.dealerId);
                            setActiveTab('products');
                          }}
                        >
                          View Products
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
                <p className="text-gray-600">No products match your current filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredProducts.map((product) => {
                const dealer = getDealerById(product.dealerId);
                
                return (
                  <Card key={product.id} className="border">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{product.productName}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{dealer?.dealerName}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {product.category}
                          </Badge>
                        </div>
                        <div className="text-right ml-2">
                          <div className="text-base sm:text-lg font-bold text-green-600">
                            ₹{product.pricePerUnit}
                          </div>
                          <div className="text-xs text-gray-600">per {product.unit}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm mb-3 sm:mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available Stock:</span>
                          <span className="font-medium text-green-600">
                            {product.currentStock} {product.unit}
                          </span>
                        </div>
                        
                        {product.supplier && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Supplier:</span>
                            <span className="text-xs truncate max-w-[120px]">{product.supplier}</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        className="w-full text-xs sm:text-sm"
                        size="sm"
                        onClick={() => dealer && handleQuickOrder(product, dealer)}
                        disabled={product.currentStock === 0}
                      >
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Order Now
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">Your order history will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredOrders.map((order) => {
                const dealer = getDealerById(order.dealerId);
                
                return (
                  <Card key={order.id} className="border">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{order.orderType}</h3>
                            <Badge className={getOrderStatusColor(order.status)}>
                              <div className="flex items-center gap-1">
                                {getOrderStatusIcon(order.status)}
                                <span className="text-xs">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                              </div>
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">To: {dealer?.dealerName}</p>
                        </div>
                        <div className="text-right mt-2 sm:mt-0">
                          <div className="text-xs sm:text-sm text-gray-600">Requested</div>
                          <div className="font-medium text-xs sm:text-sm">{order.requestDate.toDate().toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm mb-3 sm:mb-4">
                        <div>
                          <span className="text-gray-600">Quantity:</span>
                          <p className="font-medium">{order.quantity} {order.unit}</p>
                        </div>
                        {order.estimatedCost && (
                          <div>
                            <span className="text-gray-600">Estimated Cost:</span>
                            <p className="font-medium">₹{order.estimatedCost.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      
                      {order.notes && (
                        <div className="p-2 bg-gray-50 rounded mb-3 sm:mb-4">
                          <div className="text-xs text-gray-600">Your Notes:</div>
                          <div className="text-xs sm:text-sm">{order.notes}</div>
                        </div>
                      )}
                      
                      {order.dealerNotes && (
                        <div className="p-2 bg-blue-50 rounded mb-3 sm:mb-4">
                          <div className="text-xs text-gray-600">Dealer Response:</div>
                          <div className="text-xs sm:text-sm">{order.dealerNotes}</div>
                        </div>
                      )}
                      
                      {order.status === 'approved' && (
                        <Alert className="text-sm">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs sm:text-sm">
                            Your order has been approved! Contact your dealer for delivery details.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {order.status === 'rejected' && (
                        <Alert className="border-red-200 bg-red-50 text-sm">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs sm:text-sm">
                            Your order was rejected. Contact your dealer for more information.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Account Balances */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Account Balances</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your balance with each dealer</CardDescription>
              </CardHeader>
              <CardContent>
                {accountBalances.length === 0 ? (
                  <p className="text-center text-gray-600 py-4 text-sm">No transactions yet</p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {accountBalances.map((balance) => (
                      <div key={`${balance.farmerId}-${balance.dealerId}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">{balance.dealerName}</div>
                          <div className="text-xs text-gray-600">
                            Last updated: {balance.lastUpdated.toDate().toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold text-sm sm:text-base ${balance.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{Math.abs(balance.netBalance).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            {balance.netBalance >= 0 ? 'Credit Balance' : 'Outstanding Amount'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Recent Transactions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your latest account activities</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-600 py-4 text-sm">No transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-start gap-3 p-3 border rounded">
                        <div className={`p-1.5 sm:p-2 rounded-full ${transaction.transactionType === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.transactionType === 'credit' ? 
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" /> : 
                            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">{transaction.description}</div>
                          <div className="text-xs text-gray-600 truncate">
                            {transaction.dealerName} • {transaction.date.toDate().toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`font-medium text-xs sm:text-sm ${transaction.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.transactionType === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Place Order</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {selectedProduct ? 
                `Order ${selectedProduct.productName} from ${selectedDealerData?.dealerName}` :
                `Place an order with ${selectedDealerData?.dealerName}`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="orderType" className="text-sm">Order Type</Label>
              <Select value={orderForm.orderType} onValueChange={(value: any) => setOrderForm({...orderForm, orderType: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Feed">Feed</SelectItem>
                  <SelectItem value="Medicine">Medicine</SelectItem>
                  <SelectItem value="Chicks">Chicks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="quantity" className="text-sm">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({...orderForm, quantity: e.target.value})}
                  placeholder="Enter quantity"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="unit" className="text-sm">Unit</Label>
                <Select value={orderForm.unit} onValueChange={(value) => setOrderForm({...orderForm, unit: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="urgency" className="text-sm">Urgency</Label>
              <Select value={orderForm.urgency} onValueChange={(value: any) => setOrderForm({...orderForm, urgency: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={orderForm.notes}
                onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                placeholder="Any special instructions or notes..."
                rows={3}
                className="mt-1 text-sm"
              />
            </div>
            
            {selectedProduct && (
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-sm">
                  <div className="font-medium">{selectedProduct.productName}</div>
                  <div className="text-gray-600 text-xs">₹{selectedProduct.pricePerUnit} per {selectedProduct.unit}</div>
                  <div className="text-gray-600 text-xs">Available: {selectedProduct.currentStock} {selectedProduct.unit}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowOrderModal(false)} className="text-sm">
              Cancel
            </Button>
            <Button onClick={handleSubmitOrder} disabled={loading || !orderForm.quantity} className="text-sm">
              {loading ? 'Submitting...' : 'Submit Order'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
