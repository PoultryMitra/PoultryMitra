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
import { useDashboardStability } from '@/hooks/useDashboardStability';
import { 
  orderService,
  type OrderRequest,
  type FarmerAccountTransaction,
  type FarmerAccountBalance
} from '@/services/orderService';
import { 
  getDealerFarmers,
  type DealerFarmerData
} from '@/services/connectionService';
import { autoCalculationService } from '@/services/autoCalculationService';
import { 
  ShoppingCart, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  User,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  Filter,
  Search,
  Download,
  Eye,
  Globe
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query as firestoreQuery, where, onSnapshot } from 'firebase/firestore';

export default function DealerOrderManagement() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { isStable, executeWithStability } = useDashboardStability();
  const [language, setLanguage] = useState("hi");
  
  const content = {
    hi: {
      title: "ऑर्डर प्रबंधन",
      subtitle: "किसानों के ऑर्डर अनुरोध और खाता प्रबंधन",
      orderRequests: "ऑर्डर अनुरोध",
      accountManagement: "खाता प्रबंधन",
      farmerAccounts: "किसान खाते",
      allRequests: "सभी अनुरोध",
      pendingRequests: "लंबित अनुरोध",
      approvedRequests: "अनुमोदित अनुरोध",
      rejectedRequests: "अस्वीकृत अनुरोध",
      completedRequests: "पूर्ण अनुरोध",
      farmerName: "किसान का नाम",
      orderType: "ऑर्डर प्रकार",
      quantity: "मात्रा",
      status: "स्थिति",
      requestDate: "अनुरोध की तारीख",
      actions: "कार्य",
      approve: "अनुमोदित करें",
      reject: "अस्वीकार करें",
      complete: "पूर्ण करें",
      pending: "लंबित",
      approved: "अनुमोदित",
      rejected: "अस्वीकृत",
      completed: "पूर्ण",
      noOrdersFound: "कोई ऑर्डर नहीं मिला",
      loadingOrders: "ऑर्डर लोड हो रहे हैं...",
      accountBalance: "खाता शेष",
      creditBalance: "क्रेडिट शेष",
      debitBalance: "डेबिट शेष",
      netBalance: "शुद्ध शेष",
      recordPayment: "भुगतान रिकॉर्ड करें",
      amount: "राशि",
      notes: "नोट्स",
      cancel: "रद्द करें",
      save: "सेव करें",
      loading: "लोड हो रहा है...",
      invalidAmount: "अमान्य राशि",
      enterValidAmount: "कृपया 0 से अधिक मान्य राशि दर्ज करें",
      paymentRecorded: "भुगतान रिकॉर्ड हो गया",
      paymentSuccess: "भुगतान सफलतापूर्वक रिकॉर्ड हो गया",
      error: "त्रुटि",
      paymentFailed: "भुगतान रिकॉर्ड करने में विफल",
      orderApproved: "ऑर्डर अनुमोदित",
      orderRejected: "ऑर्डर अस्वीकृत",
      orderCompleted: "ऑर्डर पूर्ण",
      orderStatusUpdated: "ऑर्डर स्थिति अपडेट हो गई",
      failedToUpdate: "स्थिति अपडेट करने में विफल",
      lastUpdated: "अंतिम अपडेट",
      totalAmount: "कुल राशि",
      depositAmount: "जमा राशि",
      addNote: "नोट जोड़ें (वैकल्पिक)"
    },
    en: {
      title: "Order Management",
      subtitle: "Manage farmer order requests and account balances",
      orderRequests: "Order Requests",
      accountManagement: "Account Management", 
      farmerAccounts: "Farmer Accounts",
      allRequests: "All Requests",
      pendingRequests: "Pending Requests",
      approvedRequests: "Approved Requests",
      rejectedRequests: "Rejected Requests",
      completedRequests: "Completed Requests",
      farmerName: "Farmer Name",
      orderType: "Order Type",
      quantity: "Quantity",
      status: "Status",
      requestDate: "Request Date",
      actions: "Actions",
      approve: "Approve",
      reject: "Reject",
      complete: "Complete",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      completed: "Completed",
      noOrdersFound: "No orders found",
      loadingOrders: "Loading orders...",
      accountBalance: "Account Balance",
      creditBalance: "Credit Balance",
      debitBalance: "Debit Balance",
      netBalance: "Net Balance",
      recordPayment: "Record Payment",
      amount: "Amount",
      notes: "Notes",
      cancel: "Cancel",
      save: "Save",
      loading: "Loading...",
      invalidAmount: "Invalid Amount",
      enterValidAmount: "Please enter a valid amount greater than 0",
      paymentRecorded: "Payment Recorded",
      paymentSuccess: "Payment recorded successfully",
      error: "Error",
      paymentFailed: "Failed to record payment",
      orderApproved: "Order Approved",
      orderRejected: "Order Rejected",
      orderCompleted: "Order Completed",
      orderStatusUpdated: "Order status updated",
      failedToUpdate: "Failed to update status",
      lastUpdated: "Last Updated",
      totalAmount: "Total Amount", 
      depositAmount: "Deposit Amount",
      addNote: "Add note (optional)"
    }
  };

  const t = content[language];

  // State management
  const [orderRequests, setOrderRequests] = useState<OrderRequest[]>([]);
  const [connectedFarmers, setConnectedFarmers] = useState<DealerFarmerData[]>([]);
  const [loading, setLoading] = useState(false);
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<DealerFarmerData | null>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', note: '' });

  // Farmer balances state
  const [farmerBalances, setFarmerBalances] = useState<FarmerAccountBalance[]>([]);

  // Subscribe to all farmer balances for this dealer from Firestore
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = orderService.subscribeDealerBalances(
      currentUser.uid,
      (balances) => {
        setFarmerBalances(balances);
      }
    );
    
    return () => unsubscribe();
  }, [currentUser]);
  // Helper: get balance for a farmer
  const getFarmerBalance = (farmerId: string) => {
    return farmerBalances.find(b => b.farmerId === farmerId && b.dealerId === currentUser?.uid);
  };

  // Handle manual payment (credit) from dealer to farmer
  const handleRecordPayment = async () => {
    if (!currentUser || !selectedFarmer || !paymentForm.amount) return;
    
    const amount = parseFloat(paymentForm.amount);
    if (amount <= 0) {
      toast({
        title: t.invalidAmount,
        description: t.enterValidAmount,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await orderService.depositToFarmerAccount(
        selectedFarmer.farmerId,
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Dealer',
        amount,
        paymentForm.note || `Deposit to ${selectedFarmer.farmerName}`
      );
      
      setShowPaymentModal(false);
      setPaymentForm({ amount: '', note: '' });
      setSelectedFarmer(null);
      
      toast({
        title: t.paymentRecorded,
        description: `₹${amount.toLocaleString()} deposited to ${selectedFarmer.farmerName}'s account`,
      });
    } catch (error) {
      console.error('Payment recording error:', error);
      toast({
        title: t.paymentFailed,
        description: error instanceof Error ? error.message : t.paymentFailed,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [farmerFilter, setFarmerFilter] = useState<string>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal states
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRequest | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Response form state
  const [responseForm, setResponseForm] = useState({
    status: 'approved' as 'approved' | 'rejected' | 'completed',
    dealerNotes: '',
    estimatedCost: '',
    actualCost: '',
    deliveryDate: ''
  });

  // Auto-calculation state
  const [calculationSuggestion, setCalculationSuggestion] = useState<any>(null);
  const [loadingCalculation, setLoadingCalculation] = useState(false);

  // Load data
  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to order requests
    const unsubscribeOrders = orderService.subscribeDealerOrderRequests(currentUser.uid, (orders) => {
      setOrderRequests(orders);
    });

    // Subscribe to connected farmers
    const unsubscribeFarmers = getDealerFarmers(currentUser.uid, (farmers) => {
      setConnectedFarmers(farmers);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeFarmers();
    };
  }, [currentUser]);

  // Filter orders
  const filteredOrders = orderRequests.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesFarmer = farmerFilter === 'all' || order.farmerId === farmerFilter;
    const matchesOrderType = orderTypeFilter === 'all' || order.orderType === orderTypeFilter;
    const matchesSearch = searchTerm === '' || 
      order.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderType.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const now = new Date();
      const orderDate = order.requestDate.toDate();
      
      switch (dateFilter) {
        case 'today': {
          matchesDate = orderDate.toDateString() === now.toDateString();
          break;
        }
        case 'yesterday': {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          matchesDate = orderDate.toDateString() === yesterday.toDateString();
          break;
        }
        case 'week': {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = orderDate >= weekAgo;
          break;
        }
        case 'month': {
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDate = orderDate >= monthAgo;
          break;
        }
      }
    }
    
    return matchesStatus && matchesFarmer && matchesOrderType && matchesSearch && matchesDate;
  });

  // Handle order response with stability protection
  const handleOrderResponse = async () => {
    if (!currentUser || !selectedOrder) return;

    await executeWithStability(async () => {
      setLoading(true);
      const estimatedCost = responseForm.estimatedCost ? parseFloat(responseForm.estimatedCost) : undefined;
      const actualCost = responseForm.actualCost ? parseFloat(responseForm.actualCost) : estimatedCost;

      try {
        if (responseForm.status === 'approved') {
          // For approved orders, go directly to completed to trigger balance deduction
          await orderService.updateOrderRequestStatus(
            selectedOrder.id,
            'completed',
            responseForm.dealerNotes,
            estimatedCost,
            actualCost || estimatedCost // Use estimatedCost as actualCost if not provided
          );
          
          toast({
            title: "Order Approved & Completed",
            description: `Order approved, completed, and ₹${(actualCost || estimatedCost || 0).toLocaleString()} deducted from farmer balance.`,
          });
        } else {
          // For rejected or manually completed orders
          await orderService.updateOrderRequestStatus(
            selectedOrder.id,
            responseForm.status,
            responseForm.dealerNotes,
            estimatedCost,
            actualCost
          );
          
          toast({
            title: "Order Updated Successfully",
            description: `Order ${responseForm.status} and farmer has been notified`,
          });
        }
        
        // Reset form and close modal
        setShowResponseModal(false);
        resetResponseForm();
        
      } catch (error) {
        console.error('Order response error:', error);
        toast({
          title: "Error Updating Order",
          description: error instanceof Error ? error.message : "Failed to update order",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }, 'order response');
  };

  // Auto-calculate costs for order
  const handleAutoCalculation = async (order: OrderRequest) => {
    if (!currentUser?.uid) return;
    
    setLoadingCalculation(true);
    try {
      const suggestion = await autoCalculationService.getIntelligentCostSuggestion(
        currentUser.uid,
        order.orderType,
        order.quantity,
        order.unit || 'kg'
      );
      
      setCalculationSuggestion(suggestion);
      
      // Auto-fill the estimated cost if calculation is successful
      if (suggestion.suggestedCost) {
        setResponseForm(prev => ({
          ...prev,
          estimatedCost: suggestion.suggestedCost.toString()
        }));
      }
      
      toast({
        title: "Cost Calculated",
        description: `Suggested cost: ₹${suggestion.suggestedCost?.toLocaleString()} (${suggestion.confidence}% confidence)`,
      });
    } catch (error) {
      console.error('Auto-calculation error:', error);
      toast({
        title: "Calculation Error",
        description: "Could not auto-calculate cost. Please enter manually.",
        variant: "destructive",
      });
    } finally {
      setLoadingCalculation(false);
    }
  };

  // Quick actions
  const handleQuickApprove = async (order: OrderRequest) => {
    setSelectedOrder(order);
    setResponseForm({
      status: 'approved',
      dealerNotes: 'Order approved',
      estimatedCost: '',
      actualCost: '',
      deliveryDate: ''
    });
    
    // Trigger auto-calculation
    await handleAutoCalculation(order);
    setShowResponseModal(true);
  };

  const handleQuickReject = async (order: OrderRequest) => {
    setSelectedOrder(order);
    setResponseForm({
      status: 'rejected',
      dealerNotes: 'Order rejected',
      estimatedCost: '',
      actualCost: '',
      deliveryDate: ''
    });
    setShowResponseModal(true);
  };

  // Reset response form
  const resetResponseForm = () => {
    setResponseForm({
      status: 'approved',
      dealerNotes: '',
      estimatedCost: '',
      actualCost: '',
      deliveryDate: ''
    });
    setSelectedOrder(null);
    setCalculationSuggestion(null);
  };

  // Get farmer data by ID
  const getFarmerById = (farmerId: string) => {
    return connectedFarmers.find(f => f.farmerId === farmerId);
  };

  // Get order status color
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Calculate stats
  const totalOrders = orderRequests.length;
  const pendingOrders = orderRequests.filter(o => o.status === 'pending').length;
  const approvedOrders = orderRequests.filter(o => o.status === 'approved').length;
  const totalValue = orderRequests
    .filter(o => o.estimatedCost)
    .reduce((sum, o) => sum + (o.estimatedCost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Dashboard Stability Indicator */}
      {!isStable && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Processing operation... Dashboard remains stable during updates.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="mt-2 text-gray-600">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            {language === 'hi' ? 'EN' : 'हिं'}
          </Button>
          <div className="flex gap-3 sm:gap-4 text-sm">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">{pendingOrders}</div>
              <div className="text-gray-600 text-xs sm:text-sm">{t.pending}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{approvedOrders}</div>
              <div className="text-gray-600 text-xs sm:text-sm">{t.approved}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">₹{totalValue.toLocaleString()}</div>
              <div className="text-gray-600 text-xs sm:text-sm">{t.totalAmount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {/* Farmer Balances Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Farmer Account Balances</CardTitle>
          <CardDescription>Running balance for each connected farmer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connectedFarmers.map(farmer => {
              // Find balance for this farmer, if any
              const balance = farmerBalances.find(b => b.farmerId === farmer.farmerId && b.dealerId === currentUser?.uid);
              return (
                <Card key={farmer.farmerId} className="border">
                  <CardHeader>
                    <CardTitle className="text-base">{farmer.farmerName}</CardTitle>
                    <CardDescription>{farmer.farmerEmail}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {balance ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Farmer's Available Balance:</span>
                          <span className="text-sm font-medium text-green-600">₹{balance.netBalance}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Deposited:</span>
                          <span className="text-sm font-medium text-blue-600">₹{balance.creditBalance}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between">
                          <span className="font-medium">Available for Orders:</span>
                          <span className={`font-medium ${balance.netBalance > 0 ? 'text-green-600' : balance.netBalance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            ₹{balance.netBalance}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">Last updated: {balance.lastUpdated.toDate().toLocaleDateString()}</div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs"
                          onClick={() => {
                            setSelectedFarmer(farmer);
                            setShowPaymentModal(true);
                          }}
                        >
                          Record Payment
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">No transactions yet</div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Farmer owes you:</span>
                          <span className="text-sm font-medium text-red-600">₹0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">You owe farmer:</span>
                          <span className="text-sm font-medium text-green-600">₹0</span>
                        </div>
                        <hr />
                        <div className="flex justify-between">
                          <span className="font-medium">Net Balance:</span>
                          <span className="font-medium text-gray-600">₹0</span>
                        </div>
                        <div className="text-xs text-gray-500">No transactions yet</div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs"
                          onClick={() => {
                            setSelectedFarmer(farmer);
                            setShowPaymentModal(true);
                          }}
                        >
                          Record Payment
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center">
              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-lg sm:text-2xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-lg sm:text-2xl font-bold">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Approved</p>
                <p className="text-lg sm:text-2xl font-bold">{approvedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-lg sm:text-2xl font-bold">₹{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <Label className="text-xs sm:text-sm">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Farmer</Label>
              <Select value={farmerFilter} onValueChange={setFarmerFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Farmers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Farmers</SelectItem>
                  {connectedFarmers.map((farmer) => (
                    <SelectItem key={farmer.farmerId} value={farmer.farmerId}>
                      {farmer.farmerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Order Type</Label>
              <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Feed">Feed</SelectItem>
                  <SelectItem value="Medicine">Medicine</SelectItem>
                  <SelectItem value="Chicks">Chicks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('all');
                  setFarmerFilter('all');
                  setOrderTypeFilter('all');
                  setDateFilter('all');
                  setSearchTerm('');
                }}
                className="w-full text-sm"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="w-[95vw] max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Record Payment from Farmer</DialogTitle>
            <DialogDescription>
              Enter payment amount received from <b>{selectedFarmer?.farmerName}</b>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentAmount">Amount (₹)</Label>
              <Input
                id="paymentAmount"
                type="number"
                min="1"
                value={paymentForm.amount}
                onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="Enter amount received"
              />
            </div>
            <div>
              <Label htmlFor="paymentNote">Note (optional)</Label>
              <Textarea
                id="paymentNote"
                value={paymentForm.note}
                onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })}
                placeholder="E.g. Cash payment, UPI, etc."
                rows={2}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment} disabled={loading || !paymentForm.amount} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">Order Requests ({filteredOrders.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Manual Payment Button for each farmer */}
          <div className="mb-4">
            <Label className="text-sm mb-2 block">Record Payment from Farmer</Label>
            <div className="flex flex-wrap gap-2">
              {connectedFarmers.map(farmer => (
                <Button
                  key={farmer.farmerId}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    setSelectedFarmer(farmer);
                    setShowPaymentModal(true);
                  }}
                >
                  {farmer.farmerName}
                </Button>
              ))}
            </div>
          </div>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-sm sm:text-base text-gray-600">No orders match your current filters</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredOrders.map((order) => {
                const farmer = getFarmerById(order.farmerId);
                
                return (
                  <Card key={order.id} className="border">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-sm sm:text-base">{order.farmerName}</h3>
                              <p className="text-xs sm:text-sm text-gray-600">{farmer?.farmerEmail}</p>
                            </div>
                            <Badge className={getOrderStatusColor(order.status)}>
                              <div className="flex items-center gap-1">
                                {getOrderStatusIcon(order.status)}
                                <span className="text-xs sm:text-sm">
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm mb-4">
                            <div>
                              <span className="text-gray-600">Order Type:</span>
                              <p className="font-medium">{order.orderType}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Quantity:</span>
                              <p className="font-medium">{order.quantity} {order.unit}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Requested:</span>
                              <p className="font-medium">{order.requestDate.toDate().toLocaleDateString()}</p>
                            </div>
                            {order.estimatedCost && (
                              <div>
                                <span className="text-gray-600">Estimated Cost:</span>
                                <p className="font-medium">₹{order.estimatedCost.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                          
                          {order.notes && (
                            <div className="p-2 sm:p-3 bg-gray-50 rounded mb-3">
                              <div className="text-xs text-gray-600 mb-1">Farmer Notes:</div>
                              <div className="text-xs sm:text-sm">{order.notes}</div>
                            </div>
                          )}
                          
                          {order.dealerNotes && (
                            <div className="p-2 sm:p-3 bg-blue-50 rounded mb-3">
                              <div className="text-xs text-gray-600 mb-1">Your Response:</div>
                              <div className="text-xs sm:text-sm">{order.dealerNotes}</div>
                            </div>
                          )}
                        </div>
                        
                        <div className="sm:ml-4 mt-3 sm:mt-0">
                          <div className="flex flex-row sm:flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderDetails(true);
                              }}
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Details
                            </Button>
                            
                            {order.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleQuickApprove(order)}
                                  className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none text-xs sm:text-sm"
                                >
                                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  <span className="hidden sm:inline">Approve</span>
                                  <span className="sm:hidden">✓</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleQuickReject(order)}
                                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                                >
                                  <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  <span className="hidden sm:inline">Reject</span>
                                  <span className="sm:hidden">✗</span>
                                </Button>
                              </>
                            )}
                            
                            {order.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setResponseForm({
                                    status: 'completed',
                                    dealerNotes: 'Order completed and delivered',
                                    estimatedCost: order.estimatedCost?.toString() || '',
                                    actualCost: order.estimatedCost?.toString() || '',
                                    deliveryDate: ''
                                  });
                                  setShowResponseModal(true);
                                }}
                                className="w-full sm:w-auto text-xs sm:text-sm"
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {order.status === 'pending' && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            This order is waiting for your response. Please approve or reject it.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Response Modal */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent className="w-[95vw] max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>
              {responseForm.status === 'approved' ? 'Approve Order' : 
               responseForm.status === 'rejected' ? 'Reject Order' : 
               'Complete Order'}
            </DialogTitle>
            <DialogDescription>
              {responseForm.status === 'completed' ? 
                `Mark order as completed and add to farmer's account` :
                `Respond to order from ${selectedOrder?.farmerName}`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedOrder && (
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm">
                  <div className="font-medium">{selectedOrder.orderType}</div>
                  <div className="text-gray-600">
                    {selectedOrder.quantity} {selectedOrder.unit} requested
                  </div>
                  <div className="text-gray-600">
                    Requested on {selectedOrder.requestDate.toDate().toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="status">Response</Label>
              <Select value={responseForm.status} onValueChange={(value: any) => setResponseForm({...responseForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve Order</SelectItem>
                  <SelectItem value="rejected">Reject Order</SelectItem>
                  <SelectItem value="completed">Complete Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {responseForm.status === 'approved' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="estimatedCost">Estimated Cost (₹)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => selectedOrder && handleAutoCalculation(selectedOrder)}
                    disabled={loadingCalculation}
                    className="text-xs"
                  >
                    {loadingCalculation ? 'Calculating...' : '🤖 Auto-Calculate'}
                  </Button>
                </div>
                <Input
                  id="estimatedCost"
                  type="number"
                  step="0.01"
                  value={responseForm.estimatedCost}
                  onChange={(e) => setResponseForm({...responseForm, estimatedCost: e.target.value})}
                  placeholder="Enter estimated cost"
                />
                
                {/* Balance Check Display */}
                {responseForm.estimatedCost && selectedOrder && (
                  (() => {
                    const cost = parseFloat(responseForm.estimatedCost);
                    const balance = getFarmerBalance(selectedOrder.farmerId);
                    const availableBalance = balance ? balance.netBalance : 0; // Net balance is now directly the available amount
                    const sufficient = availableBalance >= cost;
                    const shortfall = Math.max(0, cost - availableBalance);
                    
                    return (
                      <div className={`p-3 border rounded-lg text-sm ${sufficient ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                        <div className="font-medium mb-1">
                          {sufficient ? '✅ Balance Check' : '⚠️ Balance Check'}
                        </div>
                        <div className="space-y-1">
                          <div>Farmer's Available Balance: ₹{availableBalance.toLocaleString()}</div>
                          <div>Order Cost: ₹{cost.toLocaleString()}</div>
                          {sufficient ? (
                            <div className="text-green-700 font-medium">
                              ✅ Sufficient balance (₹{(availableBalance - cost).toLocaleString()} remaining)
                            </div>
                          ) : (
                            <div className="text-yellow-700">
                              ⚠️ Insufficient balance (₹{shortfall.toLocaleString()} shortfall)
                              <div className="text-xs mt-1">Order will still be processed but farmer account will go negative</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}
                
                {calculationSuggestion && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <div className="font-medium text-blue-900 mb-1">💡 Auto-Calculation Suggestion</div>
                    <div className="text-blue-800">
                      <div>Suggested Cost: ₹{calculationSuggestion.suggestedCost?.toLocaleString()}</div>
                      <div>Confidence: {calculationSuggestion.confidence}%</div>
                      {calculationSuggestion.reasoning && (
                        <div className="mt-1 text-xs">{calculationSuggestion.reasoning}</div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setResponseForm(prev => ({
                        ...prev,
                        estimatedCost: calculationSuggestion.suggestedCost.toString()
                      }))}
                      className="p-0 h-auto text-blue-600 text-xs"
                    >
                      Use this suggestion
                    </Button>
                  </div>
                )}
              </div>
            )}

            {responseForm.status === 'completed' && (
              <>
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost (₹)</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    step="0.01"
                    value={responseForm.estimatedCost}
                    onChange={(e) => setResponseForm({...responseForm, estimatedCost: e.target.value})}
                    placeholder="Enter estimated cost"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="actualCost">Final/Actual Cost (₹) *</Label>
                  <Input
                    id="actualCost"
                    type="number"
                    step="0.01"
                    value={responseForm.actualCost}
                    onChange={(e) => setResponseForm({...responseForm, actualCost: e.target.value})}
                    placeholder="Enter final cost for accounting"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    This amount will be automatically added to farmer's account
                  </p>
                </div>
              </>
            )}
            
            <div>
              <Label htmlFor="dealerNotes">Response Message</Label>
              <Textarea
                id="dealerNotes"
                value={responseForm.dealerNotes}
                onChange={(e) => setResponseForm({...responseForm, dealerNotes: e.target.value})}
                placeholder={responseForm.status === 'approved' ? 
                  "Order approved. Will be prepared and delivered soon." :
                  "Unfortunately, we cannot fulfill this order at this time."
                }
                rows={3}
              />
            </div>
            
            {responseForm.status === 'approved' && (
              <div>
                <Label htmlFor="deliveryDate">Expected Delivery Date (Optional)</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={responseForm.deliveryDate}
                  onChange={(e) => setResponseForm({...responseForm, deliveryDate: e.target.value})}
                />
              </div>
            )}
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowResponseModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleOrderResponse} 
              disabled={loading || !responseForm.dealerNotes || (responseForm.status === 'completed' && !responseForm.actualCost)}
              className={responseForm.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 
                        responseForm.status === 'completed' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {loading ? 'Processing...' : 
               responseForm.status === 'approved' ? 'Approve Order' : 
               responseForm.status === 'rejected' ? 'Reject Order' :
               'Complete Order & Update Account'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="w-[95vw] max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Complete order information</DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Order Type:</span>
                        <p className="font-medium">{selectedOrder.orderType}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantity:</span>
                        <p className="font-medium">{selectedOrder.quantity} {selectedOrder.unit}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <Badge className={getOrderStatusColor(selectedOrder.status)}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Farmer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium">{selectedOrder.farmerName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium">{getFarmerById(selectedOrder.farmerId)?.farmerEmail}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium">N/A</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div>
                        <div className="font-medium text-sm">Order Requested</div>
                        <div className="text-xs text-gray-600">
                          {selectedOrder.requestDate.toDate().toLocaleDateString()} at {selectedOrder.requestDate.toDate().toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    {selectedOrder.responseDate && (
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${selectedOrder.status === 'approved' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        <div>
                          <div className="font-medium text-sm">
                            Order {selectedOrder.status === 'approved' ? 'Approved' : 'Rejected'}
                          </div>
                          <div className="text-xs text-gray-600">
                            {selectedOrder.responseDate.toDate().toLocaleDateString()} at {selectedOrder.responseDate.toDate().toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Notes */}
              {(selectedOrder.notes || selectedOrder.dealerNotes) && (
                <div className="space-y-4">
                  {selectedOrder.notes && (
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm font-medium mb-2">Farmer Notes:</div>
                      <div className="text-sm">{selectedOrder.notes}</div>
                    </div>
                  )}
                  
                  {selectedOrder.dealerNotes && (
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm font-medium mb-2">Your Response:</div>
                      <div className="text-sm">{selectedOrder.dealerNotes}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowOrderDetails(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
