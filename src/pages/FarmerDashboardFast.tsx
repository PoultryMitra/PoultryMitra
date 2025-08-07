import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getFarmerDealers, type FarmerDealerData } from "@/services/connectionService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Thermometer,
  Droplets,
  Cloud,
  Sun,
  CloudRain,
  Eye,
  Phone,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  ShoppingCart,
  History,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe
} from "lucide-react";

function FarmerDashboardFast() {
  const [language, setLanguage] = useState("hi");
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const content = {
    hi: {
      title: "किसान डैशबोर्ड",
      subtitle: "फीड की कीमतें देखें, FCR की गणना करें, और अपने फार्म की वित्तीय व्यवस्था का प्रबंधन करें",
      allSystemsOperational: "सभी सिस्टम चालू हैं",
      overview: "सिंहावलोकन",
      connectedDealers: "जुड़े हुए डीलर",
      dealersAvailable: "डीलर उपलब्ध हैं",
      callDirectly: "ऑर्डर देने के लिए सीधे कॉल करें",
      todaysWeather: "आज का मौसम",
      activeBatches: "सक्रिय बैच",
      totalActiveBatches: "कुल सक्रिय बैच",
      birdsTotal: "कुल पक्षी",
      dealerAccountBalances: "डीलर खाता शेष",
      runningBalance: "प्रत्येक जुड़े हुए डीलर के साथ आपका चालू शेष",
      batchManagement: "बैच प्रबंधन",
      manageBatches: "अपने पोल्ट्री बैच का प्रबंधन करें",
      noActiveBatches: "कोई सक्रिय बैच नहीं",
      startManaging: "अपना पहला बैच बनाकर पोल्ट्री का प्रबंधन शुरू करें",
      createFirstBatch: "पहला बैच बनाएं",
      financialSummary: "वित्तीय सारांश",
      accountBalance: "डीलरों के साथ आपका खाता शेष",
      noFinancialData: "कोई वित्तीय डेटा नहीं",
      financialTransactions: "डीलरों के साथ व्यापार शुरू करने पर वित्तीय लेन-देन यहाँ दिखाई देगा",
      totalCredit: "कुल क्रेडिट",
      totalDebit: "कुल डेबिट",
      stockOverview: "स्टॉक सिंहावलोकन",
      currentInventory: "वर्तमान इन्वेंटरी स्थिति",
      noStockData: "कोई स्टॉक डेटा नहीं",
      inventoryAppear: "स्टॉक ट्रैक करना शुरू करने पर आपकी इन्वेंटरी यहाँ दिखाई देगी",
      bags: "बोरे",
      feed: "फीड",
      birds: "पक्षी",
      chicks: "चूजे",
      items: "वस्तुएं",
      medicine: "दवा",
      weatherInformation: "मौसम की जानकारी",
      currentWeather: "पोल्ट्री केयर के लिए वर्तमान मौसम की स्थिति",
      temperature: "तापमान",
      humidity: "नमी",
      rainfall: "बारिश",
      good: "अच्छा",
      poultryConditions: "पोल्ट्री स्थितियां",
      weatherForecast: "मौसम पूर्वानुमान",
      poultryAdvice: "पक्षियों की नियमित निगरानी करें और आवास की स्थिति को इष्टतम बनाए रखें",
      trustedSuppliers: "आपके विश्वसनीय फीड आपूर्तिकर्ता",
      noConnectedDealers: "कोई जुड़े हुए डीलर नहीं",
      connectDealers: "फीड की कीमतें देखने और ऑर्डर देने के लिए डीलरों से जुड़ें",
      findDealers: "डीलर खोजें",
      quickActions: "त्वरित कार्य",
      viewFeedPrices: "फीड की कीमतें देखें",
      compareDealerRates: "डीलर दरों की तुलना करें",
      batchManagementAction: "बैच प्रबंधन",
      managePoultryBatches: "अपने पोल्ट्री बैच का प्रबंधन करें",
      callDealers: "डीलरों को कॉल करें",
      placeOrders: "ऑर्डर दें",
      weatherInfo: "मौसम की जानकारी",
      currentConditions: "वर्तमान स्थितियां",
      viewAllBatches: "सभी बैच देखें",
      addBatch: "बैच जोड़ें",
      days: "दिन",
      active: "सक्रिय",
      credit: "क्रेडिट",
      debit: "डेबिट",
      pending: "लंबित",
      feedStock: "फीड स्टॉक",
      activeBirds: "सक्रिय पक्षी",
      medicines: "दवाइयां",
      totalStockValue: "कुल स्टॉक मूल्य",
      loadingWeatherData: "मौसम डेटा लोड हो रहा है...",
      weatherDataUnavailable: "मौसम डेटा उपलब्ध नहीं",
      excellent: "उत्कृष्ट",
      fair: "ठीक",
      monitor: "निगरानी करें",
      poultryAdviceRain: "बारिश की स्थिति - पक्षियों के लिए उचित जल निकासी और सूखा बिछावन सुनिश्चित करें",
      poultryAdviceSunny: "साफ मौसम - पर्याप्त वेंटिलेशन और ताजे पानी की आपूर्ति बनाए रखें",
      phoneNotAvailable: "फोन नंबर उपलब्ध नहीं",
      hasntProvidedPhone: "ने फोन नंबर प्रदान नहीं किया है",
      viewPrices: "कीमतें देखें",
      featureComingSoon: "फीचर जल्द आ रहा है",
      dealerDirectoryMessage: "हम डीलर डायरेक्टरी फीचर पर काम कर रहे हैं। अभी के लिए, आमंत्रण कोड के लिए मौजूदा डीलरों से पूछें।",
      loading: "लोड हो रहा है...",
      refresh: "रीफ्रेश करें"
    },
    en: {
      title: "Farmer Dashboard",
      subtitle: "View feed prices, calculate FCR, and manage your farm finances",
      allSystemsOperational: "All Systems Operational",
      overview: "Overview",
      connectedDealers: "Connected Dealers",
      dealersAvailable: "Dealers available",
      callDirectly: "Call directly to place orders",
      todaysWeather: "Today's Weather",
      activeBatches: "Active Batches",
      totalActiveBatches: "Total Active Batches",
      birdsTotal: "birds total",
      dealerAccountBalances: "Dealer Account Balances",
      runningBalance: "Your running balance with each connected dealer",
      batchManagement: "Batch Management",
      manageBatches: "Manage your poultry batches",
      noActiveBatches: "No Active Batches",
      startManaging: "Start managing your poultry by creating your first batch",
      createFirstBatch: "Create First Batch",
      financialSummary: "Financial Summary",
      accountBalance: "Your account balance with dealers",
      noFinancialData: "No Financial Data",
      financialTransactions: "Financial transactions will appear here once you start trading with dealers",
      totalCredit: "Total Credit",
      totalDebit: "Total Debit",
      stockOverview: "Stock Overview",
      currentInventory: "Current inventory status",
      noStockData: "No Stock Data",
      inventoryAppear: "Your inventory will appear here once you start tracking stock", 
      bags: "Bags",
      feed: "Feed",
      birds: "Birds",
      chicks: "Chicks",
      items: "Items",
      medicine: "Medicine",
      weatherInformation: "Weather Information",
      currentWeather: "Current weather conditions for poultry care",
      temperature: "Temperature",
      humidity: "Humidity",
      rainfall: "Rainfall",
      good: "Good",
      poultryConditions: "Poultry Conditions",
      weatherForecast: "Weather Forecast",
      poultryAdvice: "Monitor birds regularly and maintain optimal housing conditions",
      trustedSuppliers: "Your trusted feed suppliers",
      noConnectedDealers: "No Connected Dealers",
      connectDealers: "Connect with dealers to view feed prices and place orders",
      findDealers: "Find Dealers",
      quickActions: "Quick Actions",
      viewFeedPrices: "View Feed Prices",
      compareDealerRates: "Compare dealer rates",
      batchManagementAction: "Batch Management",
      managePoultryBatches: "Manage your poultry batches",
      callDealers: "Call Dealers",
      placeOrders: "Place orders",
      weatherInfo: "Weather Info",
      currentConditions: "Current conditions",
      viewAllBatches: "View All Batches",
      addBatch: "Add Batch",
      days: "days",
      active: "Active",
      credit: "Credit",
      debit: "Debit",
      pending: "Pending",
      feedStock: "Feed Stock",
      activeBirds: "Active Birds",
      medicines: "Medicines",
      totalStockValue: "Total Stock Value",
      loadingWeatherData: "Loading weather data...",
      weatherDataUnavailable: "Weather Data Unavailable",
      excellent: "Excellent",
      fair: "Fair",
      monitor: "Monitor",
      poultryAdviceRain: "Rainy conditions - ensure proper drainage and dry bedding for birds",
      poultryAdviceSunny: "Clear weather - maintain adequate ventilation and fresh water supply",
      phoneNotAvailable: "Phone number not available",
      hasntProvidedPhone: "hasn't provided a phone number",
      viewPrices: "View Prices",
      featureComingSoon: "Feature Coming Soon",
      dealerDirectoryMessage: "We're working on a dealer directory feature. For now, ask existing dealers for invitation codes.",
      loading: "Loading...",
      refresh: "Refresh"
    }
  };

  const t = content[language];
  
  // Simple state without complex stability hooks
  const [connectedDealers, setConnectedDealers] = useState<FarmerDealerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({
    temperature: '28°C',
    condition: 'sunny',
    humidity: '65%',
    rainfall: '0mm'
  });

  // Mock data for demonstration (in real app, this would come from Firestore)
  const mockBatches = [
    { id: 1, name: "बैच A", birds: 1000, age: 35, status: "सक्रिय" },
    { id: 2, name: "बैच B", birds: 800, age: 21, status: "सक्रिय" }
  ];

  const mockFinancials = {
    totalCredit: 15000,
    totalDebit: 8000,
    netBalance: 7000
  };

  const mockStock = {
    feeds: { bags: 45, value: 22500 },
    chicks: { count: 0, value: 0 },
    medicines: { items: 12, value: 3600 }
  };

  // Simple data loading without stability hooks
  useEffect(() => {
    if (!currentUser?.uid) return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load connected dealers - this is the only real API call
        const unsubscribe = getFarmerDealers(currentUser.uid, (farmerDealers) => {
          console.log('Connected dealers loaded:', farmerDealers.length);
          setConnectedDealers(farmerDealers);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error loading farmer data:', error);
        setLoading(false);
      }
    };

    const cleanup = loadData();
    return () => {
      if (cleanup) cleanup.then(fn => fn && fn());
    };
  }, [currentUser?.uid]);

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'rain':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'cloudy':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getWeatherAdvice = () => {
    if (weather.condition === 'rain') {
      return t.poultryAdviceRain;
    }
    return t.poultryAdviceSunny;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Language Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-600 mt-1">{t.subtitle}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            {language === "hi" ? "English" : "हिंदी"}
          </Button>
        </div>

        {/* Status Banner */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">{t.allSystemsOperational}</span>
            </div>
          </CardContent>
        </Card>

        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Connected Dealers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t.connectedDealers}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{connectedDealers.length}</div>
                  <p className="text-xs text-gray-500">{t.dealersAvailable}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* Active Batches */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t.activeBatches}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{mockBatches.length}</div>
                  <p className="text-xs text-gray-500">{mockBatches.reduce((sum, batch) => sum + batch.birds, 0)} {t.birdsTotal}</p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t.financialSummary}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">₹{mockFinancials.netBalance.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">{t.credit}: ₹{mockFinancials.totalCredit.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          {/* Weather */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t.todaysWeather}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{weather.temperature}</div>
                  <p className="text-xs text-gray-500">{t.humidity}: {weather.humidity}</p>
                </div>
                {getWeatherIcon()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connected Dealers Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t.trustedSuppliers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectedDealers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectedDealers.map((dealer) => (
                  <Card key={dealer.dealerId} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{dealer.dealerName}</h3>
                          <p className="text-sm text-gray-600">{dealer.dealerEmail}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {dealer.dealerPhone ? (
                            <Button
                              size="sm"
                              onClick={() => window.open(`tel:${dealer.dealerPhone}`)}
                              className="flex-1"
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              कॉल करें
                            </Button>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {t.phoneNotAvailable}
                            </div>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Navigate to feed prices
                              window.location.href = '/feed-prices';
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t.viewPrices}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h3 className="font-medium text-gray-900 mb-2">{t.noConnectedDealers}</h3>
                <p className="text-sm mb-4">{t.connectDealers}</p>
                <Button
                  onClick={() => {
                    toast({
                      title: t.featureComingSoon,
                      description: t.dealerDirectoryMessage,
                    });
                  }}
                >
                  {t.findDealers}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t.quickActions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => window.location.href = '/feed-prices'}
              >
                <Eye className="h-6 w-6" />
                <span className="text-sm">{t.viewFeedPrices}</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => window.location.href = '/batch-management'}
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm">{t.batchManagementAction}</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => {
                  toast({
                    title: t.featureComingSoon,
                    description: "Order management coming soon!",
                  });
                }}
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="text-sm">{t.placeOrders}</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => {
                  toast({
                    title: t.weatherInfo,
                    description: getWeatherAdvice(),
                  });
                }}
              >
                {getWeatherIcon()}
                <span className="text-sm">{t.currentConditions}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weather Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              {t.weatherInformation}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{weather.temperature}</div>
                <p className="text-sm text-gray-600">{t.temperature}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{weather.humidity}</div>
                <p className="text-sm text-gray-600">{t.humidity}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{weather.rainfall}</div>
                <p className="text-sm text-gray-600">{t.rainfall}</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  {t.good}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">{t.poultryConditions}</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">{getWeatherAdvice()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FarmerDashboardFast;
