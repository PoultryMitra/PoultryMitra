import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getFarmerDealers, type FarmerDealerData } from "@/services/connectionService";
import { 
  orderService, 
  type OrderRequest, 
  type FarmerAccountTransaction,
  type FarmerAccountBalance
} from "@/services/orderService";
import { fetchWeatherData, fetchWeatherByCoordinates } from "@/lib/weather";
import { getCurrentLocation } from "@/lib/location";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Link } from "react-router-dom";
import {
  Package,
  Phone,
  DollarSign,
  Users,
  Cloud,
  Sun,
  CloudRain,
  Thermometer,
  Wind,
  Activity,
  TrendingUp,
  TrendingDown,
  Bird,
  Wheat,
  Pill,
  Calendar,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  ShoppingCart,
  History,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

export default function FarmerDashboard() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // Batch Management State (will be calculated from real data)
  const [batches, setBatches] = useState([]);
  const [totalBirds, setTotalBirds] = useState(0);
  const [activeBatches, setActiveBatches] = useState(0);
  
  // Financial State (will be calculated from real data)
  const [financialSummary, setFinancialSummary] = useState({
    totalCredit: 0,  // Amount dealers owe to farmer
    totalDebit: 0,   // Amount farmer owes to dealers
    netBalance: 0,   // totalCredit - totalDebit
    pendingPayments: 0
  });
  
  // Stock State (will be calculated from real data)
  const [stockSummary, setStockSummary] = useState({
    feeds: { bags: 0, value: 0 },
    chicks: { count: 0, value: 0 },
    medicines: { items: 0, value: 0 }
  });
  
  // Connected dealers state
  const [connectedDealers, setConnectedDealers] = useState<FarmerDealerData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Order Request State
  const [orderRequests, setOrderRequests] = useState<OrderRequest[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<FarmerDealerData | null>(null);
  const [orderForm, setOrderForm] = useState({
    orderType: 'Feed' as 'Feed' | 'Medicine' | 'Chicks',
    quantity: '',
    unit: 'bags',
    notes: ''
  });
  
  // Account Management State
  const [farmerTransactions, setFarmerTransactions] = useState<FarmerAccountTransaction[]>([]);
  const [farmerBalances, setFarmerBalances] = useState<FarmerAccountBalance[]>([]);
  const [selectedDealerForAccount, setSelectedDealerForAccount] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [farmerData, setFarmerData] = useState(null);

  // Weather state with real API integration
  const [weather, setWeather] = useState({
    temperature: 'Loading...',
    condition: 'unknown',
    humidity: 'Loading...',
    rainfall: 'Loading...',
    forecast: 'Loading weather data...',
    isLoading: true,
    error: null as string | null
  });

  // Load weather data using real weather API
  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setWeather(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Try to get user's location first
        try {
          const location = await getCurrentLocation();
          console.log('📍 Got user location:', location);
          
          // Use coordinates for more accurate weather
          const weatherData = await fetchWeatherByCoordinates(location.latitude, location.longitude);
          
          setWeather({
            temperature: weatherData.temperature,
            condition: weatherData.forecast.toLowerCase().includes('rain') ? 'rain' : 
                      weatherData.forecast.toLowerCase().includes('cloud') ? 'cloudy' : 'sunny',
            humidity: weatherData.humidity,
            rainfall: weatherData.rainfall,
            forecast: weatherData.forecast,
            isLoading: false,
            error: null
          });
          
        } catch (locationError) {
          console.log('📍 Location not available, using default city');
          
          // Fallback to default city weather
          const weatherData = await fetchWeatherData('Chennai'); // Default city
          
          setWeather({
            temperature: weatherData.temperature,
            condition: weatherData.forecast.toLowerCase().includes('rain') ? 'rain' : 
                      weatherData.forecast.toLowerCase().includes('cloud') ? 'cloudy' : 'sunny',
            humidity: weatherData.humidity,
            rainfall: weatherData.rainfall,
            forecast: weatherData.forecast + ' (Default location)',
            isLoading: false,
            error: null
          });
        }
        
      } catch (error) {
        console.error('🌤️ Weather API error:', error);
        setWeather({
          temperature: 'N/A',
          condition: 'unknown',
          humidity: 'N/A',
          rainfall: 'N/A',
          forecast: 'Weather data temporarily unavailable',
          isLoading: false,
          error: 'Unable to load weather data'
        });
      }
    };

    loadWeatherData();
    
    // Refresh weather data every 30 minutes
    const weatherInterval = setInterval(loadWeatherData, 30 * 60 * 1000);
    
    return () => clearInterval(weatherInterval);
  }, []);

  // Load real farmer data from dealerFarmers collection
  const loadFarmerData = async () => {
    if (!currentUser?.uid) return;

    try {
      // In a real app, we would have a dedicated farmers collection
      // For now, we'll use the dealerFarmers data to get farmer's own data
      const { getDealerFarmers } = await import('@/services/connectionService');
      
      // We need to find this farmer's data in the dealerFarmers collection
      // This is a temporary solution - ideally we'd have a dedicated farmer data structure
      console.log('Loading farmer data for:', currentUser.uid);
      
      // For now, initialize with basic structure that can be expanded
      setFarmerData({
        farmerId: currentUser.uid,
        totalChicks: 0,
        totalFeedConsumption: 0,
        totalExpenses: 0,
        accountBalance: 0
      });
      
    } catch (error) {
      console.error('Error loading farmer data:', error);
    }
  };

  // Calculate real data from connected dealers information
  useEffect(() => {
    if (connectedDealers.length > 0) {
      // Since we don't have direct farmer batches yet, show actual dealer connections
      const virtualBatches = connectedDealers.map((dealer, index) => ({
        id: index + 1,
        name: `Connection with ${dealer.dealerName}`,
        birds: 0, // This should come from actual batch data when implemented
        currentAge: 0, // This should come from actual batch data when implemented
        mortality: 0,
        status: "Active"
      }));

      setBatches(virtualBatches);
      setActiveBatches(virtualBatches.length);
      
      // Reset financial summary to show actual data (currently no real financial data)
      setFinancialSummary({
        totalCredit: 0,  // Should come from actual transactions
        totalDebit: 0,   // Should come from actual transactions
        netBalance: 0,   // Should be calculated from real data
        pendingPayments: 0 // Should come from actual pending transactions
      });

      // Reset stock to show actual data (currently no real stock data)
      setStockSummary({
        feeds: { 
          bags: 0,     // Should come from actual inventory
          value: 0     // Should be calculated from actual inventory
        },
        chicks: { 
          count: 0,    // Should come from actual batch data
          value: 0     // Should be calculated from actual batch data
        },
        medicines: { 
          items: 0,    // Should come from actual inventory
          value: 0     // Should be calculated from actual inventory
        }
      });

      setTotalBirds(0); // Should be sum of all birds in active batches
    } else {
      // Reset everything to empty when no dealers connected
      setBatches([]);
      setActiveBatches(0);
      setFinancialSummary({
        totalCredit: 0,
        totalDebit: 0,
        netBalance: 0,
        pendingPayments: 0
      });
      setStockSummary({
        feeds: { bags: 0, value: 0 },
        chicks: { count: 0, value: 0 },
        medicines: { items: 0, value: 0 }
      });
      setTotalBirds(0);
    }
  }, [connectedDealers]);

  // Subscribe to connected dealers
  useEffect(() => {
    if (!currentUser?.uid) return;

    loadFarmerData();
    
    const unsubscribe = getFarmerDealers(currentUser.uid, (farmerDealers) => {
      setConnectedDealers(farmerDealers);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser?.uid]);

  // Subscribe to order requests and transactions
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribeOrders = orderService.subscribeFarmerOrderRequests(
      currentUser.uid,
      (orders) => {
        setOrderRequests(orders);
      }
    );

    const unsubscribeTransactions = orderService.subscribeFarmerTransactions(
      currentUser.uid,
      (transactions) => {
        setFarmerTransactions(transactions);
        const balances = orderService.calculateFarmerBalances(transactions);
        setFarmerBalances(balances);
      }
    );

    return () => {
      unsubscribeOrders();
      unsubscribeTransactions();
    };
  }, [currentUser?.uid]);

  // Batch Management Functions
  const addNewBatch = () => {
    const newBatch = {
      id: batches.length + 1,
      name: `Batch-${String(batches.length + 1).padStart(3, '0')}`,
      birds: 0,
      currentAge: 0,
      mortality: 0,
      status: "Planning"
    };
    setBatches([...batches, newBatch]);
    toast({
      title: "New Batch Added",
      description: `${newBatch.name} has been created`,
      variant: "default"
    });
  };

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'sunny': return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rain': return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'rainy': return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'unknown':
      default: return <Cloud className="h-8 w-8 text-gray-400" />;
    }
  };

  // Order Request Handlers
  const handleOrderRequest = (dealer: FarmerDealerData, orderType: 'Feed' | 'Medicine' | 'Chicks') => {
    setSelectedDealer(dealer);
    setOrderForm({
      ...orderForm,
      orderType,
      unit: orderType === 'Feed' ? 'bags' : orderType === 'Chicks' ? 'pieces' : 'bottles'
    });
    setShowOrderModal(true);
  };

  const submitOrderRequest = async () => {
    if (!currentUser?.uid || !selectedDealer || !orderForm.quantity) return;

    try {
      await orderService.submitOrderRequest(
        currentUser.uid,
        currentUser.displayName || 'Farmer',
        selectedDealer.dealerId,
        selectedDealer.dealerName,
        {
          orderType: orderForm.orderType,
          quantity: parseInt(orderForm.quantity),
          unit: orderForm.unit,
          notes: orderForm.notes
        }
      );

      // Reset form
      setOrderForm({
        orderType: 'Feed',
        quantity: '',
        unit: 'bags',
        notes: ''
      });
      setSelectedDealer(null);
      setShowOrderModal(false);

      toast({
        title: "Order Request Sent",
        description: `Your ${orderForm.orderType.toLowerCase()} request has been sent to ${selectedDealer.dealerName}`,
      });

    } catch (error) {
      console.error('Error submitting order request:', error);
      toast({
        title: "Error",
        description: "Failed to send order request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-blue-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
        <p className="text-muted-foreground">
          View feed prices, calculate FCR, and check weather conditions
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="account">My Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Dealers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedDealers.length}</div>
            <p className="text-xs text-muted-foreground">
              Dealers available for feed prices
            </p>
            <p className="text-xs text-green-600 mt-1">
              Call directly to place orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Weather</CardTitle>
            {getWeatherIcon()}
          </CardHeader>
          <CardContent>
            {weather.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading weather...</div>
            ) : weather.error ? (
              <div className="text-sm text-red-600">{weather.error}</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {weather.temperature}
                </div>
                <p className="text-xs text-muted-foreground">
                  {weather.forecast}
                </p>
                <div className="flex gap-3 mt-1 text-xs">
                  <span className="text-blue-600">Humidity: {weather.humidity}</span>
                  <span className="text-green-600">Rainfall: {weather.rainfall}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeBatches}
            </div>
            <p className="text-xs text-muted-foreground">
              Total Active Batches
            </p>
            <p className="text-xs text-green-600 mt-1">
              {totalBirds} birds total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Batch Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Batch Management
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your poultry batches (1-10 max)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {batches.length > 0 ? (
              <>
                <div className="space-y-3">
                  {batches.slice(0, 3).map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{batch.name}</h4>
                        <p className="text-sm text-gray-600">{batch.birds} birds • {batch.currentAge} days</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          batch.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {batch.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Link to="/batch-management" className="flex-1">
                    <Button className="w-full">
                      View All Batches
                    </Button>
                  </Link>
                  <Button onClick={addNewBatch} variant="outline" className="flex-1" disabled={batches.length >= 10}>
                    Add Batch {batches.length >= 10 ? '(Max)' : ''}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Active Batches</h3>
                <p className="text-gray-600 mb-4">
                  Start managing your poultry by creating your first batch
                </p>
                <Button onClick={addNewBatch} className="w-full">
                  Create First Batch
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Financial Summary
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your account balance with dealers
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {financialSummary.totalCredit > 0 || financialSummary.totalDebit > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <ArrowUpCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-600">₹{financialSummary.totalCredit.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Credit</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <ArrowDownCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-600">₹{financialSummary.totalDebit.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Debit</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-blue-800">Net Balance</h4>
                    <p className={`text-lg font-bold ${financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{Math.abs(financialSummary.netBalance).toLocaleString()}
                      {financialSummary.netBalance >= 0 ? ' Credit' : ' Debit'}
                    </p>
                  </div>
                  {financialSummary.pendingPayments > 0 && (
                    <p className="text-sm text-blue-700 mt-2">
                      Pending: ₹{financialSummary.pendingPayments.toLocaleString()}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Financial Data</h3>
                <p className="text-gray-600 mb-4">
                  Financial transactions will appear here once you start trading with dealers
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">₹0</p>
                    <p className="text-gray-600">Total Credit</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">₹0</p>
                    <p className="text-gray-600">Total Debit</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wheat className="h-5 w-5" />
              Stock Overview
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Current inventory status
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(stockSummary.feeds.bags > 0 || stockSummary.chicks.count > 0 || stockSummary.medicines.items > 0) ? (
              <>
                <div className="space-y-3">
                  {stockSummary.feeds.bags > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Wheat className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="font-medium">{stockSummary.feeds.bags} Bags</p>
                        <p className="text-sm text-gray-600">Feed Stock</p>
                      </div>
                      <p className="text-sm font-medium">₹{stockSummary.feeds.value.toLocaleString()}</p>
                    </div>
                  )}
                  
                  {stockSummary.chicks.count > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <Bird className="h-5 w-5 text-orange-600" />
                      <div className="flex-1">
                        <p className="font-medium">{stockSummary.chicks.count} Chicks</p>
                        <p className="text-sm text-gray-600">Active Birds</p>
                      </div>
                      <p className="text-sm font-medium">₹{stockSummary.chicks.value.toLocaleString()}</p>
                    </div>
                  )}
                  
                  {stockSummary.medicines.items > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Pill className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="font-medium">{stockSummary.medicines.items} Items</p>
                        <p className="text-sm text-gray-600">Medicines</p>
                      </div>
                      <p className="text-sm font-medium">₹{stockSummary.medicines.value.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Total Stock Value</h4>
                    <p className="text-lg font-bold text-blue-600">
                      ₹{(stockSummary.feeds.value + stockSummary.chicks.value + stockSummary.medicines.value).toLocaleString()}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Stock Data</h3>
                <p className="text-gray-600 mb-4">
                  Your inventory will appear here once you start tracking stock
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-medium">0 Bags</p>
                    <p className="text-gray-600">Feed</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-medium">0 Birds</p>
                    <p className="text-gray-600">Chicks</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-medium">0 Items</p>
                    <p className="text-gray-600">Medicine</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weather Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getWeatherIcon()}
              Weather Information
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Current weather conditions for poultry care
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {weather.isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading weather data...</p>
              </div>
            ) : weather.error ? (
              <div className="text-center py-8 text-gray-500">
                <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Weather Data Unavailable</h3>
                <p className="text-gray-600 mb-4">{weather.error}</p>
                <p className="text-sm text-gray-500">
                  Weather information will be available once the service is restored
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Thermometer className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">{weather.temperature}</p>
                      <p className="text-sm text-gray-600">Temperature</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{weather.humidity}</p>
                      <p className="text-sm text-gray-600">Humidity</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CloudRain className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{weather.rainfall}</p>
                      <p className="text-sm text-gray-600">Rainfall</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    {getWeatherIcon()}
                    <div>
                      <p className="font-medium">
                        {weather.condition === 'sunny' ? 'Excellent' : 
                         weather.condition === 'cloudy' ? 'Good' : 
                         weather.condition === 'rain' ? 'Fair' : 'Monitor'}
                      </p>
                      <p className="text-sm text-gray-600">Poultry Conditions</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-1">Weather Forecast</h4>
                  <p className="text-sm text-blue-700">
                    {weather.forecast}
                  </p>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-1">Poultry Care Advice</h4>
                  <p className="text-sm text-green-700">
                    {weather.condition === 'rain' ? 
                      "Rainy conditions - ensure proper drainage and dry bedding for birds" :
                      weather.condition === 'sunny' ?
                      "Clear weather - maintain adequate ventilation and fresh water supply" :
                      "Monitor birds regularly and maintain optimal housing conditions"
                    }
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Connected Dealers */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Connected Dealers
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your trusted feed suppliers
            </p>
          </CardHeader>
          <CardContent>
            {connectedDealers.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {connectedDealers.map((dealer) => (
                  <div key={dealer.id || dealer.dealerId} className="border rounded-lg p-4 space-y-3">
                    <div>
                      <h4 className="font-semibold">{dealer.dealerName}</h4>
                      <p className="text-sm text-gray-600">{dealer.dealerEmail}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => {
                          if (dealer.dealerPhone) {
                            window.open(`tel:${dealer.dealerPhone}`);
                          } else {
                            toast({
                              title: "Phone number not available",
                              description: `${dealer.dealerName} hasn't provided a phone number`,
                              variant: "default"
                            });
                          }
                        }}
                      >
                        <Phone className="h-3 w-3" />
                        Call
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={() => {
                          // Navigate to farmer feed prices page
                          window.location.href = '/farmer/feed-prices';
                        }}
                      >
                        <DollarSign className="h-3 w-3" />
                        View Prices
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Connected Dealers</h3>
                <p className="text-gray-600 mb-4">
                  Connect with dealers to view feed prices and place orders
                </p>
                <Button onClick={() => {
                  toast({
                    title: "Feature Coming Soon",
                    description: "We're working on a dealer directory feature. For now, ask existing dealers for invitation codes.",
                    variant: "default"
                  });
                }}>Find Dealers</Button>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="gap-2 h-auto p-4 flex-col"
              onClick={() => window.location.href = '/farmer/feed-prices'}
            >
              <DollarSign className="h-6 w-6" />
              <span>View Feed Prices</span>
              <span className="text-xs opacity-70">Compare dealer rates</span>
            </Button>
            <Link to="/batch-management">
              <Button variant="outline" className="gap-2 h-auto p-4 flex-col w-full">
                <Package className="h-6 w-6" />
                <span>Batch Management</span>
                <span className="text-xs opacity-70">Manage your poultry batches</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="gap-2 h-auto p-4 flex-col"
              onClick={() => {
                if (connectedDealers.length > 0) {
                  const dealersWithPhone = connectedDealers.filter(d => d.dealerPhone);
                  if (dealersWithPhone.length > 0) {
                    // If multiple dealers have phone numbers, show a list
                    if (dealersWithPhone.length === 1) {
                      window.open(`tel:${dealersWithPhone[0].dealerPhone}`);
                    } else {
                      toast({
                        title: "Multiple dealers available",
                        description: `${dealersWithPhone.length} dealers have phone numbers. Use individual Call buttons.`,
                        variant: "default"
                      });
                    }
                  } else {
                    toast({
                      title: "No phone numbers available",
                      description: "Your connected dealers haven't provided phone numbers",
                      variant: "default"
                    });
                  }
                } else {
                  toast({
                    title: "No connected dealers",
                    description: "Connect with dealers first to get their contact information",
                    variant: "default"
                  });
                }
              }}
            >
              <Phone className="h-6 w-6" />
              <span>Call Dealers</span>
              <span className="text-xs opacity-70">Place orders</span>
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 h-auto p-4 flex-col"
              onClick={() => {
                if (!weather.isLoading && !weather.error) {
                  toast({
                    title: "Weather Information",
                    description: `${weather.temperature}, ${weather.forecast}. Humidity: ${weather.humidity}`,
                    variant: "default"
                  });
                } else {
                  toast({
                    title: "Weather Data Unavailable",
                    description: weather.error || "Weather information is loading. Please wait a moment.",
                    variant: "default"
                  });
                }
              }}
            >
              <Cloud className="h-6 w-6" />
              <span>Weather Info</span>
              <span className="text-xs opacity-70">Current conditions</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Free Tools Section */}
      <Card>
        <CardHeader>
          <CardTitle>Free Farm Management Tools</CardTitle>
          <p className="text-sm text-muted-foreground">
            All tools are completely free to use! Login only required to save and download reports.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/batch-management">
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Batch Management</h4>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Track multiple batches, manage feeding schedules, monitor growth rates
                </p>
                <p className="text-xs text-blue-600 font-medium">Free to use • Login to save reports</p>
              </div>
            </Link>

            <Link to="/fcr-reports">
              <div className="p-4 border rounded-lg bg-green-50 border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">FCR Reports</h4>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  Detailed FCR tracking, performance analytics, conversion trends
                </p>
                <p className="text-xs text-green-600 font-medium">Free to use • Login to save reports</p>
              </div>
            </Link>

            <Link to="/batch-management">
              <div className="p-4 border rounded-lg bg-orange-50 border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-800">Batch Management</h4>
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  Comprehensive batch tracking with feed, chicks, and medicine management
                </p>
                <p className="text-xs text-orange-600 font-medium">Full featured • Login required</p>
              </div>
            </Link>
          </div>

          {!currentUser && (
            <div className="mt-6 text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground mb-4">
                Want to save your calculations and download reports?
              </p>
              <div className="flex gap-4 justify-center">
                <Button>Create Account</Button>
                <Button variant="outline">Login</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-6">
          {/* Order Requests Section */}
          <div className="grid gap-4 md:grid-cols-3">
            {connectedDealers.map((dealer) => (
              <Card key={dealer.dealerId}>
                <CardHeader>
                  <CardTitle className="text-lg">{dealer.dealerName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{dealer.phone}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    onClick={() => handleOrderRequest(dealer, 'Feed')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Wheat className="w-4 h-4 mr-2" />
                    Request Feed
                  </Button>
                  <Button 
                    onClick={() => handleOrderRequest(dealer, 'Medicine')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Pill className="w-4 h-4 mr-2" />
                    Request Medicine
                  </Button>
                  <Button 
                    onClick={() => handleOrderRequest(dealer, 'Chicks')}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Bird className="w-4 h-4 mr-2" />
                    Request Chicks
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Order Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Order Requests</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your recent orders and their status
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
                  {orderRequests.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{order.orderType}</h4>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.quantity} {order.unit} from {order.dealerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Requested on {order.requestDate.toDate().toLocaleDateString()}
                        </p>
                        {order.dealerNotes && (
                          <p className="text-xs text-blue-600 mt-1">
                            Dealer notes: {order.dealerNotes}
                          </p>
                        )}
                      </div>
                      {order.estimatedCost && (
                        <div className="text-right">
                          <p className="text-sm font-medium">₹{order.estimatedCost}</p>
                          <p className="text-xs text-muted-foreground">Estimated</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6">
          {/* Account Balance Cards */}
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
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setSelectedDealerForAccount(balance.dealerId)}
                  >
                    <History className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your transaction history with dealers
                  </p>
                </div>
                <Select value={selectedDealerForAccount} onValueChange={setSelectedDealerForAccount}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All dealers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All dealers</SelectItem>
                    {connectedDealers.map((dealer) => (
                      <SelectItem key={dealer.dealerId} value={dealer.dealerId}>
                        {dealer.dealerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  {farmerTransactions
                    .filter(t => !selectedDealerForAccount || t.dealerId === selectedDealerForAccount)
                    .map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {transaction.transactionType === 'credit' ? (
                          <ArrowUpCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <ArrowDownCircle className="w-5 h-5 text-green-500" />
                        )}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.dealerName} • {transaction.date.toDate().toLocaleDateString()}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.transactionType === 'credit' ? 'text-red-600' : 'text-green-600'}`}>
                          {transaction.transactionType === 'credit' ? '+' : '-'}₹{transaction.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Request Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request {orderForm.orderType}</DialogTitle>
            <DialogDescription>
              Send a request to {selectedDealer?.dealerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={orderForm.quantity}
                onChange={(e) => setOrderForm({...orderForm, quantity: e.target.value})}
                placeholder={`Enter quantity in ${orderForm.unit}`}
              />
            </div>
            
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={orderForm.unit}
                onChange={(e) => setOrderForm({...orderForm, unit: e.target.value})}
                placeholder="bags, pieces, bottles, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={orderForm.notes}
                onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                placeholder="Any special requirements or notes..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowOrderModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitOrderRequest}
              disabled={!orderForm.quantity}
            >
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
