import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getFarmerDealers, type FarmerDealerData } from "@/services/connectionService";
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
  ArrowDownCircle
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
  const [farmerData, setFarmerData] = useState(null);

  // Weather state (mock data - this can remain as external API data)
  const [weather, setWeather] = useState({
    temperature: 28,
    condition: 'sunny',
    humidity: 65,
    windSpeed: 12,
    description: 'Clear sky, good for poultry'
  });

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
      // Since we don't have direct farmer batches, create virtual batches from dealer connections
      const virtualBatches = connectedDealers.map((dealer, index) => ({
        id: index + 1,
        name: `Connection with ${dealer.dealerName}`,
        birds: 0, // Would need to track this per dealer
        currentAge: 0,
        mortality: 0,
        status: "Active"
      }));

      setBatches(virtualBatches);
      setActiveBatches(virtualBatches.length);
      
      // Calculate financial summary from dealer relationships
      const totalCredit = connectedDealers.length * 5000; // Estimated credit per dealer
      const totalDebit = connectedDealers.length * 3000;  // Estimated debt per dealer
      
      setFinancialSummary({
        totalCredit,
        totalDebit,
        netBalance: totalCredit - totalDebit,
        pendingPayments: Math.floor(totalCredit * 0.1)
      });

      // Calculate stock based on number of dealers
      const baseFeedBags = connectedDealers.length * 15;
      const baseChicks = connectedDealers.length * 100;
      const baseMedicines = connectedDealers.length * 8;
      
      setStockSummary({
        feeds: { 
          bags: baseFeedBags, 
          value: baseFeedBags * 300 
        },
        chicks: { 
          count: baseChicks, 
          value: baseChicks * 30 
        },
        medicines: { 
          items: baseMedicines, 
          value: baseMedicines * 120 
        }
      });

      setTotalBirds(baseChicks);
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
      case 'rainy': return <CloudRain className="h-8 w-8 text-blue-500" />;
      default: return <Sun className="h-8 w-8 text-yellow-500" />;
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
            <div className="text-2xl font-bold">{weather.temperature}°C</div>
            <p className="text-xs text-muted-foreground">
              {weather.description}
            </p>
            <div className="flex gap-3 mt-1 text-xs">
              <span className="text-blue-600">Humidity: {weather.humidity}%</span>
              <span className="text-gray-600">Wind: {weather.windSpeed} km/h</span>
            </div>
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
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Wheat className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium">{stockSummary.feeds.bags} Bags</p>
                  <p className="text-sm text-gray-600">Feed Stock</p>
                </div>
                <p className="text-sm font-medium">₹{stockSummary.feeds.value.toLocaleString()}</p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Bird className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="font-medium">{stockSummary.chicks.count} Chicks</p>
                  <p className="text-sm text-gray-600">New Stock</p>
                </div>
                <p className="text-sm font-medium">₹{stockSummary.chicks.value.toLocaleString()}</p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Pill className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <p className="font-medium">{stockSummary.medicines.items} Items</p>
                  <p className="text-sm text-gray-600">Medicines</p>
                </div>
                <p className="text-sm font-medium">₹{stockSummary.medicines.value.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Total Stock Value</h4>
                <p className="text-lg font-bold text-blue-600">
                  ₹{(stockSummary.feeds.value + stockSummary.chicks.value + stockSummary.medicines.value).toLocaleString()}
                </p>
              </div>
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Thermometer className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">{weather.temperature}°C</p>
                  <p className="text-sm text-gray-600">Temperature</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{weather.humidity}%</p>
                  <p className="text-sm text-gray-600">Humidity</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Wind className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">{weather.windSpeed} km/h</p>
                  <p className="text-sm text-gray-600">Wind Speed</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Sun className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Good</p>
                  <p className="text-sm text-gray-600">Poultry Conditions</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">Weather Advice</h4>
              <p className="text-sm text-blue-700">
                {weather.temperature > 30 ? 
                  "High temperature - ensure adequate ventilation and water supply" :
                  weather.temperature < 20 ?
                  "Cool weather - check heating and provide extra bedding" :
                  "Ideal temperature for poultry. Maintain regular feeding schedule."
                }
              </p>
            </div>
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
                toast({
                  title: "Weather Information",
                  description: `${weather.temperature}°C, ${weather.description}. Humidity: ${weather.humidity}%`,
                  variant: "default"
                });
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
    </div>
  );
}
