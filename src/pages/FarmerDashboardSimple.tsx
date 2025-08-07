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
import { useEnhancedTranslation } from "@/contexts/EnhancedTranslationContext";
import { LanguageToggle, TranslationStatus } from "@/components/TranslationComponents";

// Enhanced imports for stability
import { useFarmerDashboardStability } from '@/hooks/useFarmerDashboardStability';
import { FarmerDashboardErrorBoundary } from '@/components/error/FarmerDashboardErrorBoundary';
import { CreditDebitNoteManager } from '@/components/finance/CreditDebitNoteManager';

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
  AlertCircle,
  RefreshCw,
  Shield,
  Globe
} from "lucide-react";

function FarmerDashboard() {
  const [language, setLanguage] = useState("hi");
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { language: enhancedLang, t } = useEnhancedTranslation();

  // Enhanced translation helper that prioritizes Google Translate
  const bt = (key: string): string => {
    // First try Enhanced Translation Context (Google Translate)
    const dynamicTranslation = t(key);
    if (dynamicTranslation && dynamicTranslation !== key) {
      console.log(`🌍 Google Translate used for FarmerDashboard: ${key} -> ${dynamicTranslation}`);
      return dynamicTranslation;
    }

    // Fallback to local content
    const keys = key.split('.');
    let value: any = content[language as keyof typeof content];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (value) {
      console.log(`📚 Static content used for FarmerDashboard: ${key} -> ${value}`);
      return value;
    }
    
    console.log(`❌ No translation found for FarmerDashboard: ${key}`);
    return key;
  };

  // Update local language when Enhanced Translation language changes
  useEffect(() => {
    if (enhancedLang) {
      setLanguage(enhancedLang);
    }
  }, [enhancedLang]);
  
  const content = {
    hi: {
      title: "किसान डैशबोर्ड",
      subtitle: "फीड की कीमतें देखें, FCR की गणना करें, और अपने फार्म की वित्तीय व्यवस्था का प्रबंधन करें",
      allSystemsOperational: "सभी सिस्टम चालू हैं",
      overview: "सिंहावलोकन",
      myOrders: "मेरे ऑर्डर",
      connectedDealers: "जुड़े हुए डीलर",
      dealersAvailable: "डीलर उपलब्ध हैं फीड की कीमतों के लिए",
      callDirectly: "ऑर्डर देने के लिए सीधे कॉल करें",
      todaysWeather: "आज का मौसम",
      activeBatches: "सक्रिय बैच",
      totalActiveBatches: "कुल सक्रिय बैच",
      birdsTotal: "कुल पक्षी",
      dealerAccountBalances: "डीलर खाता शेष",
      runningBalance: "प्रत्येक जुड़े हुए डीलर के साथ आपका चालू शेष",
      batchManagement: "बैच प्रबंधन",
      manageBatches: "अपने पोल्ट्री बैच का प्रबंधन करें (अधिकतम 1-10)",
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
      managePoultryBatches: "अपने मुर्गी पालन बैच का प्रबंधन करें",
      callDealers: "डीलरों को कॉल करें",
      placeOrders: "ऑर्डर दें",
      weatherInfo: "मौसम की जानकारी", 
      currentConditions: "वर्तमान स्थितियां",
      freeToolsTitle: "मुफ्त फार्म प्रबंधन उपकरण",
      multipleDealersAvailable: "कई डीलर उपलब्ध हैं",
      multipleDealersDescription: "डीलरों के पास फोन नंबर हैं। व्यक्तिगत कॉल बटन का उपयोग करें।",
      noPhoneNumbers: "कोई फोन नंबर उपलब्ध नहीं",
      noPhoneDescription: "आपके जुड़े डीलरों ने फोन नंबर प्रदान नहीं किए हैं",
      connectDealersFirst: "उनकी संपर्क जानकारी प्राप्त करने के लिए पहले डीलरों से जुड़ें",
      weatherUnavailable: "मौसम डेटा उपलब्ध नहीं",
      weatherLoading: "मौसम की जानकारी लोड हो रही है। कृपया एक पल प्रतीक्षा करें।",
      freeTools: "मुफ्त फार्म प्रबंधन उपकरण",
      allToolsFree: "सभी उपकरण बिल्कुल मुफ्त हैं! रिपोर्ट सेव करने और डाउनलोड करने के लिए केवल लॉगिन की आवश्यकता है।",
      trackBatches: "कई बैच ट्रैक करें, फीडिंग शेड्यूल प्रबंधित करें, विकास दर की निगरानी करें",
      freeToUse: "उपयोग के लिए मुफ्त",
      loginToSave: "रिपोर्ट सेव करने के लिए लॉगिन करें",
      fcrReports: "FCR रिपोर्ट्स",
      detailedFCR: "विस्तृत FCR ट्रैकिंग, प्रदर्शन विश्लेषण, रूपांतरण रुझान",
      batchManagementFull: "बैच प्रबंधन",
      comprehensiveBatch: "फीड, चूजे और दवा प्रबंधन के साथ व्यापक बैच ट्रैकिंग",
      fullFeatured: "पूर्ण सुविधा युक्त",
      loginRequired: "लॉगिन आवश्यक",
      yourAvailableBalance: "आपकी उपलब्ध शेष राशि:",
      totalDeposited: "कुल जमा:",
      availableForOrders: "ऑर्डर के लिए उपलब्ध:",
      lastUpdated: "अंतिम अपडेट:",
      noTransactionsYet: "अभी तक कोई लेन-देन नहीं",
      youOweDealer: "आप पर डीलर का बकाया:",
      dealerOwesYou: "डीलर पर आपका बकाया:",
      netBalance: "शुद्ध शेष:",
      viewAllBatches: "सभी बैच देखें",
      addBatch: "बैच जोड़ें",
      max: "(अधिकतम)",
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
      weatherServiceRestored: "सेवा बहाल होने पर मौसम की जानकारी उपलब्ध होगी",
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
      call: "कॉल"
    },
    en: {
      title: "Farmer Dashboard",
      subtitle: "View feed prices, calculate FCR, and manage your farm finances",
      allSystemsOperational: "All Systems Operational",
      overview: "Overview",
      myOrders: "My Orders",
      connectedDealers: "Connected Dealers",
      dealersAvailable: "Dealers available for feed prices",
      callDirectly: "Call directly to place orders",
      todaysWeather: "Today's Weather",
      activeBatches: "Active Batches",
      totalActiveBatches: "Total Active Batches",
      birdsTotal: "birds total",
      dealerAccountBalances: "Dealer Account Balances",
      runningBalance: "Your running balance with each connected dealer",
      batchManagement: "Batch Management",
      manageBatches: "Manage your poultry batches (1-10 max)",
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
      managePoultryBatches: "Manage your poultry batches",
      callDealers: "Call Dealers",
      placeOrders: "Place orders",
      weatherInfo: "Weather Info",
      currentConditions: "Current conditions",
      freeToolsTitle: "Free Farm Management Tools",
      multipleDealersAvailable: "Multiple dealers available",
      multipleDealersDescription: "dealers have phone numbers. Use individual Call buttons.",
      noPhoneNumbers: "No phone numbers available", 
      noPhoneDescription: "Your connected dealers haven't provided phone numbers",
      connectDealersFirst: "Connect with dealers first to get their contact information",
      weatherUnavailable: "Weather Data Unavailable",
      weatherLoading: "Weather information is loading. Please wait a moment.",
      freeTools: "Free Farm Management Tools",
      allToolsFree: "All tools are completely free to use! Login only required to save and download reports.",
      trackBatches: "Track multiple batches, manage feeding schedules, monitor growth rates",
      freeToUse: "Free to use",
      loginToSave: "Login to save reports",
      fcrReports: "FCR Reports",
      detailedFCR: "Detailed FCR tracking, performance analytics, conversion trends",
      batchManagementFull: "Batch Management",
      comprehensiveBatch: "Comprehensive batch tracking with feed, chicks, and medicine management",
      fullFeatured: "Full featured",
      loginRequired: "Login required",
      yourAvailableBalance: "Your Available Balance:",
      totalDeposited: "Total Deposited:",
      availableForOrders: "Available for Orders:",
      lastUpdated: "Last updated:",
      noTransactionsYet: "No transactions yet",
      youOweDealer: "You owe dealer:",
      dealerOwesYou: "Dealer owes you:",
      netBalance: "Net Balance:",
      viewAllBatches: "View All Batches",
      addBatch: "Add Batch",
      max: "(Max)",
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
      weatherServiceRestored: "Weather information will be available once the service is restored",
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
      call: "Call"
    }
  };
  
  // Enhanced stability hook
  const { 
    executeWithStability, 
    isStable, 
    isRecovering, 
    resetStability,
    isNetworkBlocked,
    circuitBreakerOpen
  } = useFarmerDashboardStability();
  
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

  // Subscribe to connected dealers with stability
  useEffect(() => {
    if (!currentUser?.uid) return;

    loadFarmerData();
    
    const loadDealersWithStability = async () => {
      try {
        await executeWithStability(
          async () => {
            return new Promise<void>((resolve, reject) => {
              try {
                const unsubscribe = getFarmerDealers(currentUser.uid, (farmerDealers) => {
                  setConnectedDealers(farmerDealers);
                  setLoading(false);
                  resolve();
                });
                // Store for cleanup
                (window as any)._farmerDealersUnsubscribe = unsubscribe;
              } catch (error) {
                reject(error);
              }
            });
          },
          'Load Connected Dealers',
          { 
            showErrorToast: true
          }
        );
      } catch (error) {
        // Fallback on stability failure
        setConnectedDealers([]);
        setLoading(false);
      }
    };

    loadDealersWithStability();

    return () => {
      if ((window as any)._farmerDealersUnsubscribe) {
        (window as any)._farmerDealersUnsubscribe();
      }
    };
  }, [currentUser?.uid, executeWithStability]);

  // Subscribe to order requests and transactions with stability
  useEffect(() => {
    if (!currentUser?.uid) return;

    const loadOrderDataWithStability = async () => {
      // Load order requests
      await executeWithStability(
        async () => {
          return new Promise<void>((resolve) => {
            const unsubscribe = orderService.subscribeFarmerOrderRequests(
              currentUser.uid,
              (orders) => {
                setOrderRequests(orders);
                resolve();
              }
            );
            (window as any)._farmerOrdersUnsubscribe = unsubscribe;
          });
        },
        'Load Order Requests',
        { showErrorToast: true }
      );

      // Load transactions and balances
      await executeWithStability(
        async () => {
          return new Promise<void>((resolve) => {
            const unsubscribeTransactions = orderService.subscribeFarmerTransactions(
              currentUser.uid,
              (transactions) => {
                setFarmerTransactions(transactions);
              }
            );
            
            const unsubscribeBalances = orderService.subscribeFarmerBalances(
              currentUser.uid,
              (balances) => {
                setFarmerBalances(balances);
              }
            );
            
            (window as any)._farmerTransactionsUnsubscribe = unsubscribeTransactions;
            (window as any)._farmerBalancesUnsubscribe = unsubscribeBalances;
            resolve();
          });
        },
        'Load Farmer Transactions and Balances',
        { showErrorToast: true }
      );
    };

    loadOrderDataWithStability();

    return () => {
      if ((window as any)._farmerOrdersUnsubscribe) {
        (window as any)._farmerOrdersUnsubscribe();
      }
      if ((window as any)._farmerTransactionsUnsubscribe) {
        (window as any)._farmerTransactionsUnsubscribe();
      }
      if ((window as any)._farmerBalancesUnsubscribe) {
        (window as any)._farmerBalancesUnsubscribe();
      }
    };
  }, [currentUser?.uid, executeWithStability]);

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
    <FarmerDashboardErrorBoundary>
      <div className="p-6 space-y-6">
        {/* Enhanced Header with Stability and Translation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{bt('title')}</h1>
            <p className="text-muted-foreground">
              {bt('subtitle')}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {!isStable && isNetworkBlocked ? (
                <Badge className="bg-orange-100 text-orange-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Network Blocked - Check Firewall/Ad Blocker
                </Badge>
              ) : !isStable ? (
                <Badge className="bg-red-100 text-red-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  System Issues
                </Badge>
              ) : isRecovering ? (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Recovering
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {bt('allSystemsOperational')}
                </Badge>
              )}
              {isNetworkBlocked && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-orange-800">
                    <strong>Connection Issue:</strong> Your network or browser is blocking Firebase connections. 
                    Try disabling ad blockers, checking firewall settings, or switching networks.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Translation Status - Keep for development monitoring */}
          <div className="flex items-center gap-2">
            <TranslationStatus />
            
            {!isStable && (
              <>
                <Button variant="outline" size="sm" onClick={resetStability}>
                  <Shield className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </>
            )}
          </div>
        </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">{bt('overview')}</TabsTrigger>
          <TabsTrigger value="orders">{bt('myOrders')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{bt('connectedDealers')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{connectedDealers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {bt('dealersAvailable')}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {bt('callDirectly')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{bt('todaysWeather')}</CardTitle>
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
                      <span className="text-blue-600">{bt('humidity')}: {weather.humidity}</span>
                      <span className="text-green-600">{bt('rainfall')}: {weather.rainfall}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{bt('activeBatches')}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeBatches}
                </div>
                <p className="text-xs text-muted-foreground">
                  {bt('totalActiveBatches')}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {totalBirds} {bt('birdsTotal')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Dealer Account Balances Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{bt('dealerAccountBalances')}</CardTitle>
              <p className="text-sm text-muted-foreground">{bt('runningBalance')}</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {connectedDealers.map(dealer => {
                  const balance = farmerBalances.find(b => b.dealerId === dealer.dealerId);
                  return (
                    <Card key={dealer.dealerId} className="border">
                      <CardHeader>
                        <CardTitle className="text-base">{dealer.dealerName}</CardTitle>
                        <p className="text-xs text-gray-500">{dealer.dealerEmail}</p>
                      </CardHeader>
                      <CardContent>
                        {balance ? (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">{bt('yourAvailableBalance')}</span>
                              <span className="text-sm font-medium text-green-600">₹{balance.netBalance}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">{bt('totalDeposited')}</span>
                              <span className="text-sm font-medium text-blue-600">₹{balance.creditBalance}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between">
                              <span className="font-medium">{bt('availableForOrders')}</span>
                              <span className={`font-medium ${balance.netBalance > 0 ? 'text-green-600' : balance.netBalance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                ₹{balance.netBalance}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">{bt('lastUpdated')} {balance.lastUpdated.toDate().toLocaleDateString()}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm text-gray-500 mb-2">{bt('noTransactionsYet')}</div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">{bt('youOweDealer')}</span>
                              <span className="text-sm font-medium text-red-600">₹0</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">{bt('dealerOwesYou')}</span>
                              <span className="text-sm font-medium text-green-600">₹0</span>
                            </div>
                            <hr />
                            <div className="flex justify-between">
                              <span className="font-medium">{bt('netBalance')}</span>
                              <span className="font-medium text-gray-600">₹0</span>
                            </div>
                            <div className="text-xs text-gray-500">{bt('noTransactionsYet')}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Batch Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {bt('batchManagement')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {bt('manageBatches')}
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
                <h3 className="text-lg font-semibold mb-2">{bt('noActiveBatches')}</h3>
                <p className="text-gray-600 mb-4">
                  {bt('startManaging')}
                </p>
                <Button onClick={addNewBatch} className="w-full">
                  {bt('createFirstBatch')}
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
              {bt('financialSummary')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {bt('accountBalance')}
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
                    <h4 className="font-medium text-blue-800">{bt('netBalance')}</h4>
                    <p className={`text-lg font-bold ${financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{Math.abs(financialSummary.netBalance).toLocaleString()}
                      {financialSummary.netBalance >= 0 ? ` ${bt('credit')}` : ` ${bt('debit')}`}
                    </p>
                  </div>
                  {financialSummary.pendingPayments > 0 && (
                    <p className="text-sm text-blue-700 mt-2">
                      {bt('pending')}: ₹{financialSummary.pendingPayments.toLocaleString()}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">{bt('noFinancialData')}</h3>
                <p className="text-gray-600 mb-4">
                  {bt('financialTransactions')}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">₹0</p>
                    <p className="text-gray-600">{bt('totalCredit')}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">₹0</p>
                    <p className="text-gray-600">{bt('totalDebit')}</p>
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
              {bt('stockOverview')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {bt('currentInventory')}
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
                        <p className="font-medium">{stockSummary.feeds.bags} {bt('bags')}</p>
                        <p className="text-sm text-gray-600">{bt('feedStock')}</p>
                      </div>
                      <p className="text-sm font-medium">₹{stockSummary.feeds.value.toLocaleString()}</p>
                    </div>
                  )}
                  
                  {stockSummary.chicks.count > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <Bird className="h-5 w-5 text-orange-600" />
                      <div className="flex-1">
                        <p className="font-medium">{stockSummary.chicks.count} {bt('chicks')}</p>
                        <p className="text-sm text-gray-600">{bt('activeBirds')}</p>
                      </div>
                      <p className="text-sm font-medium">₹{stockSummary.chicks.value.toLocaleString()}</p>
                    </div>
                  )}
                  
                  {stockSummary.medicines.items > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Pill className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="font-medium">{stockSummary.medicines.items} {bt('items')}</p>
                        <p className="text-sm text-gray-600">{bt('medicines')}</p>
                      </div>
                      <p className="text-sm font-medium">₹{stockSummary.medicines.value.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{bt('totalStockValue')}</h4>
                    <p className="text-lg font-bold text-blue-600">
                      ₹{(stockSummary.feeds.value + stockSummary.chicks.value + stockSummary.medicines.value).toLocaleString()}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">{bt('noStockData')}</h3>
                <p className="text-gray-600 mb-4">
                  {bt('inventoryAppear')}
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-medium">0 {bt('bags')}</p>
                    <p className="text-gray-600">{bt('feed')}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-medium">0 {bt('birds')}</p>
                    <p className="text-gray-600">{bt('chicks')}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-medium">0 {bt('items')}</p>
                    <p className="text-gray-600">{bt('medicine')}</p>
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
              {bt('weatherInformation')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {bt('currentWeather')}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {weather.isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{bt('loadingWeatherData')}</p>
              </div>
            ) : weather.error ? (
              <div className="text-center py-8 text-gray-500">
                <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">{bt('weatherDataUnavailable')}</h3>
                <p className="text-gray-600 mb-4">{weather.error}</p>
                <p className="text-sm text-gray-500">
                  {bt('weatherServiceRestored')}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Thermometer className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">{weather.temperature}</p>
                      <p className="text-sm text-gray-600">{bt('temperature')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{weather.humidity}</p>
                      <p className="text-sm text-gray-600">{bt('humidity')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CloudRain className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{weather.rainfall}</p>
                      <p className="text-sm text-gray-600">{bt('rainfall')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    {getWeatherIcon()}
                    <div>
                      <p className="font-medium">
                        {weather.condition === 'sunny' ? bt('excellent') : 
                         weather.condition === 'cloudy' ? bt('good') : 
                         weather.condition === 'rain' ? bt('fair') : bt('monitor')}
                      </p>
                      <p className="text-sm text-gray-600">{bt('poultryConditions')}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-1">{bt('weatherForecast')}</h4>
                  <p className="text-sm text-blue-700">
                    {weather.forecast}
                  </p>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-1">{bt('poultryAdvice')}</h4>
                  <p className="text-sm text-green-700">
                    {weather.condition === 'rain' ? 
                      bt('poultryAdviceRain') :
                      weather.condition === 'sunny' ?
                      bt('poultryAdviceSunny') :
                      bt('poultryAdvice')
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
              {bt('connectedDealers')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {bt('trustedSuppliers')}
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
                              title: bt('phoneNotAvailable'),
                              description: `${dealer.dealerName} ${bt('hasntProvidedPhone')}`,
                              variant: "default"
                            });
                          }
                        }}
                      >
                        <Phone className="h-3 w-3" />
                        {bt('call')}
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
                        {bt('viewPrices')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">{bt('noConnectedDealers')}</h3>
                <p className="text-gray-600 mb-4">
                  {bt('connectDealers')}
                </p>
                <Button onClick={() => {
                  toast({
                    title: bt('featureComingSoon'),
                    description: bt('dealerDirectoryMessage'),
                    variant: "default"
                  });
                }}>{bt('findDealers')}</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{bt('quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="gap-2 h-auto p-4 flex-col"
              onClick={() => window.location.href = '/farmer/feed-prices'}
            >
              <DollarSign className="h-6 w-6" />
              <span>{bt('viewFeedPrices')}</span>
              <span className="text-xs opacity-70">{bt('compareDealerRates')}</span>
            </Button>
            <Link to="/batch-management">
              <Button variant="outline" className="gap-2 h-auto p-4 flex-col w-full">
                <Package className="h-6 w-6" />
                <span>{bt('batchManagement')}</span>
                <span className="text-xs opacity-70">{bt('managePoultryBatches')}</span>
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
                        title: bt('multipleDealersAvailable') || "Multiple dealers available",
                        description: bt('multipleDealersDescription') || `${dealersWithPhone.length} dealers have phone numbers. Use individual Call buttons.`,
                        variant: "default"
                      });
                    }
                  } else {
                    toast({
                      title: bt('noPhoneNumbers') || "No phone numbers available",
                      description: bt('noPhoneDescription') || "Your connected dealers haven't provided phone numbers",
                      variant: "default"
                    });
                  }
                } else {
                  toast({
                    title: bt('noConnectedDealers') || "No connected dealers",
                    description: bt('connectDealersFirst') || "Connect with dealers first to get their contact information",
                    variant: "default"
                  });
                }
              }}
            >
              <Phone className="h-6 w-6" />
              <span>{bt('callDealers')}</span>
              <span className="text-xs opacity-70">{bt('placeOrders')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 h-auto p-4 flex-col"
              onClick={() => {
                if (!weather.isLoading && !weather.error) {
                  toast({
                    title: bt('weatherInformation') || "Weather Information",
                    description: `${weather.temperature}, ${weather.forecast}. ${bt('humidity') || 'Humidity'}: ${weather.humidity}`,
                    variant: "default"
                  });
                } else {
                  toast({
                    title: bt('weatherUnavailable') || "Weather Data Unavailable",
                    description: weather.error || bt('weatherLoading') || "Weather information is loading. Please wait a moment.",
                    variant: "default"
                  });
                }
              }}
            >
              <Cloud className="h-6 w-6" />
              <span>{bt('weatherInfo')}</span>
              <span className="text-xs opacity-70">{bt('currentConditions')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Free Tools Section */}
      <Card>
        <CardHeader>
          <CardTitle>{bt('freeToolsTitle')}</CardTitle>
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
                  <p className="text-sm text-muted-foreground">{dealer.dealerPhone || dealer.dealerEmail}</p>
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
        
        // ...existing code...
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
    </FarmerDashboardErrorBoundary>
  );
}

// Wrap with error boundary for stability
export default function WrappedFarmerDashboardSimple() {
  return (
    <FarmerDashboardErrorBoundary>
      <FarmerDashboard />
    </FarmerDashboardErrorBoundary>
  );
}
