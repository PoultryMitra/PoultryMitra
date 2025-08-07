import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as dealerService from "@/services/dealerService";
import type { DealerProfile, Product, FarmerData, Order } from "@/services/dealerService";
import { createInvitationCode, getDealerFarmers, type DealerFarmerData } from "@/services/connectionService";
import { createDemoData } from "@/services/demoService";
import { LedgerView } from "@/components/accounting/LedgerView";
import { AccountSummary } from "@/components/accounting/AccountSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign,
  Activity,
  Plus,
  Eye,
  Database,
  Share,
  Copy,
  QrCode,
  MessageCircle,
  Link2,
  Phone,
  Building2,
  MapPin,
  Mail,
  Globe
} from "lucide-react";

function DealerDashboard() {
  const [language, setLanguage] = useState("hi");
  const { currentUser } = useAuth();
  
  const content = {
    hi: {
      title: "डीलर डैशबोर्ड",
      overview: "सिंहावलोकन",
      farmers: "किसान",
      products: "उत्पाद",
      orders: "ऑर्डर",
      accounting: "लेखांकन",
      totalFarmers: "कुल किसान",
      totalProducts: "कुल उत्पाद",
      totalOrders: "कुल ऑर्डर",
      monthlyRevenue: "मासिक आय",
      connectedFarmers: "जुड़े हुए किसान",
      recentOrders: "हाल के ऑर्डर",
      productCatalog: "उत्पाद कैटलॉग",
      inviteFarmers: "किसानों को आमंत्रित करें",
      generateCode: "कोड जेनरेट करें",
      shareCode: "कोड साझा करें",
      loading: "लोड हो रहा है...",
      noData: "कोई डेटा उपलब्ध नहीं",
      addProduct: "उत्पाद जोड़ें",
      businessProfile: "व्यापारिक प्रोफ़ाइल",
      welcome: "वापसी पर स्वागत है",
      generateInviteCode: "आमंत्रण कोड जेनरेट करें",
      editProfile: "प्रोफ़ाइल संपादित करें",
      inInventory: "इन्वेंटरी में",
      totalRevenue: "कुल आय",
      fromAllFarmers: "सभी किसानों से",
      amountGiven: "दी गई राशि",
      toFarmers: "किसानों को",
      feedCompanies: "फीड कंपनियां",
      medicineCompanies: "दवा कंपनियां",
      chickCompanies: "चूजा कंपनियां",
      totalGiven: "कुल दिया गया",
      pendingRecovery: "लंबित वसूली",
      amountToRecover: "वसूली योग्य राशि",
      allCompaniesCombined: "सभी कंपनियों को मिलाकर",
      quickActions: "त्वरित कार्य",
      manageOperations: "अपने डीलर संचालन को कुशलतापूर्वक प्रबंधित करें",
      updatePrices: "मूल्य अपडेट करें",
      inventory: "इन्वेंटरी",
      guides: "गाइड",
      yourProducts: "आपके उत्पाद",
      manageInventoryPricing: "अपनी उत्पाद इन्वेंटरी और मूल्य निर्धारण का प्रबंधन करें",
      price: "मूल्य",
      stock: "स्टॉक",
      supplier: "आपूर्तिकर्ता",
      bags: "बोरे",
      feed: "फीड",
      dashboard: "डैशबोर्ड",
      accounts: "खाते",
      ledger: "खाता बही",
      insights: "अंतर्दृष्टि",
      active: "सक्रिय",
      noFarmersConnected: "अभी तक कोई किसान जुड़े नहीं हैं। शुरुआत करने के लिए अपना आमंत्रण कोड साझा करें!",
      call: "कॉल करें",
      productsNeedRestocking: "उत्पादों को फिर से स्टॉक करने की आवश्यकता है",
      fromLastMonth: "पिछले महीने से +12%",
      trackAmounts: "विभिन्न कंपनियों से किसानों को प्रदान की गई राशि को ट्रैक करें",
      amountGivenToFarmers: "किसानों को दी गई राशि",
      createDemoData: "डेमो डेटा बनाएं",
      creating: "बना रहे हैं...",
      yourInvitationCode: "आपका आमंत्रण कोड",
      lowStockAlerts: "कम स्टॉक अलर्ट",
      pendingOrders: "लंबित ऑर्डर",
      fromLastMonth2: "पिछले महीने से +2",
      addFeedProduct: "फीड उत्पाद जोड़ें",
      viewPriceInquiries: "मूल्य पूछताछ देखें",
      updateContactInfo: "संपर्क जानकारी अपडेट करें",
      noOrdersYet: "अभी तक कोई ऑर्डर नहीं। जब किसान ऑर्डर देंगे तो वे यहाँ दिखाई देंगे।",
      productAlerts: "उत्पाद अलर्ट",
      allProductsWellStocked: "सभी उत्पाद अच्छी तरह से स्टॉक में हैं!",
      update: "अपडेट करें",
      stockLabel: "स्टॉक"
    },
    en: {
      title: "Dealer Dashboard",
      overview: "Overview",
      farmers: "Farmers", 
      products: "Products",
      orders: "Orders",
      accounting: "Accounting",
      totalFarmers: "Total Farmers",
      totalProducts: "Total Products",
      totalOrders: "Total Orders",
      monthlyRevenue: "Monthly Revenue",
      connectedFarmers: "Connected Farmers",
      recentOrders: "Recent Orders",
      productCatalog: "Product Catalog",
      inviteFarmers: "Invite Farmers",
      generateCode: "Generate Code",
      shareCode: "Share Code",
      loading: "Loading...",
      noData: "No data available",
      addProduct: "Add Product",
      businessProfile: "Business Profile",
      welcome: "Welcome back",
      generateInviteCode: "Generate Invite Code",
      editProfile: "Edit Profile",
      inInventory: "In inventory",
      totalRevenue: "Total Revenue",
      fromAllFarmers: "From all farmers",
      amountGiven: "Amount Given",
      toFarmers: "To farmers",
      feedCompanies: "Feed Companies",
      medicineCompanies: "Medicine Companies",
      chickCompanies: "Chick Companies",
      totalGiven: "Total Given",
      pendingRecovery: "Pending Recovery",
      amountToRecover: "Amount to recover",
      allCompaniesCombined: "All companies combined",
      quickActions: "Quick Actions",
      manageOperations: "Manage your dealer operations efficiently",
      updatePrices: "Update Prices",
      inventory: "Inventory",
      guides: "Guides",
      yourProducts: "Your Products",
      manageInventoryPricing: "Manage your product inventory and pricing",
      price: "Price",
      stock: "Stock",
      supplier: "Supplier",
      bags: "bags",
      feed: "Feed",
      dashboard: "Dashboard",
      accounts: "Accounts",
      ledger: "Ledger",
      insights: "Insights",
      active: "Active",
      noFarmersConnected: "No farmers connected yet. Share your invitation code to get started!",
      call: "Call",
      productsNeedRestocking: "Products need restocking",
      fromLastMonth: "+12% from last month",
      trackAmounts: "Track amounts from different companies provided to farmers",
      amountGivenToFarmers: "Amount given to farmers",
      createDemoData: "Create Demo Data",
      creating: "Creating...",
      yourInvitationCode: "Your Invitation Code",
      lowStockAlerts: "Low Stock Alerts",
      pendingOrders: "Pending Orders",
      fromLastMonth2: "+2 from last month",
      addFeedProduct: "Add Feed Product",
      viewPriceInquiries: "View Price Inquiries",
      updateContactInfo: "Update Contact Info",
      noOrdersYet: "No orders yet. They will appear here when farmers place orders.",
      productAlerts: "Product Alerts",
      allProductsWellStocked: "All products are well stocked!",
      update: "Update",
      stockLabel: "Stock"
    }
  };

  const t = content[language];
  
  const [farmers, setFarmers] = useState<FarmerData[]>([]);
  const [connectedFarmers, setConnectedFarmers] = useState<DealerFarmerData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [currentInviteCode, setCurrentInviteCode] = useState<string>('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showAddFeedModal, setShowAddFeedModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [dealerProfile, setDealerProfile] = useState<DealerProfile | null>(null);
  const [newProductForm, setNewProductForm] = useState({
    productName: '',
    supplier: '',
    pricePerUnit: '',
    currentStock: '',
    unit: '50kg bag',
    category: 'feed',
    minStockLevel: ''
  });
  const [contactForm, setContactForm] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: ''
  });
  const { toast } = useToast();

  // Generate new invitation code
  const handleGenerateInviteCode = async () => {
    if (!currentUser?.uid) return;
    
    setIsGeneratingCode(true);
    try {
      // Use dealer profile info if available, otherwise fallback to user info
      const dealerName = dealerProfile?.businessName || 
        dealerProfile?.ownerName || 
        currentUser.displayName || 
        currentUser.email?.split('@')[0] || 
        'Dealer';
      
      const inviteCode = await createInvitationCode(
        currentUser.uid,
        dealerName,
        currentUser.email || ''
      );
      
      setCurrentInviteCode(inviteCode);
      toast({
        title: "Invitation Code Generated!",
        description: "Share this code with farmers to connect them to your network.",
      });
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast({
        title: "Error",
        description: "Failed to generate invitation code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Copy invitation code to clipboard
  const copyInviteCode = async () => {
    if (!currentInviteCode) return;
    
    try {
      await navigator.clipboard.writeText(currentInviteCode);
      toast({
        title: "Copied!",
        description: "Invitation code copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  // Share invitation link
  const shareInviteLink = () => {
    if (!currentInviteCode) return;
    
    const inviteUrl = `${window.location.origin}/farmer-connect?invite=${currentInviteCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join My Poultry Network',
        text: `Join my poultry dealer network using code: ${currentInviteCode}`,
        url: inviteUrl,
      });
    } else {
      navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Link Copied!",
        description: "Invitation link copied to clipboard.",
      });
    }
  };

  // Load dealer profile from Firebase
  const loadDealerProfile = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const profile = await dealerService.getDealerProfile(currentUser.uid);
      setDealerProfile(profile);
      
      if (profile) {
        setContactForm({
          businessName: profile.businessName || '',
          ownerName: profile.ownerName || '',
          phone: profile.phone || '',
          whatsapp: profile.whatsapp || '',
          email: profile.email || currentUser.email || '',
          address: profile.address || ''
        });
      }
    } catch (error) {
      console.error('Error loading dealer profile:', error);
      toast({
        title: "Error",
        description: "Failed to load dealer profile.",
        variant: "destructive",
      });
    }
  };

  // Save new product to Firebase
  const handleSaveNewProduct = async () => {
    if (!currentUser?.uid) return;
    
    const { productName, supplier, pricePerUnit, currentStock, unit, category, minStockLevel } = newProductForm;
    
    if (!productName || !supplier || !pricePerUnit || !currentStock) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await dealerService.addProduct(currentUser.uid, {
        productName,
        supplier,
        pricePerUnit: parseFloat(pricePerUnit),
        currentStock: parseInt(currentStock),
        unit,
        category,
        minStockLevel: parseInt(minStockLevel) || 10
      });

      toast({
        title: "Product Added Successfully!",
        description: `${productName} has been added to your catalog.`,
      });
      
      setShowAddFeedModal(false);
      setNewProductForm({
        productName: '',
        supplier: '',
        pricePerUnit: '',
        currentStock: '',
        unit: '50kg bag',
        category: 'feed',
        minStockLevel: ''
      });
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle update price with real Firebase
  const handleUpdatePrice = async (productId: string, productName: string) => {
    const newPrice = prompt(`Enter new price for ${productName}:`);
    if (!newPrice || isNaN(parseFloat(newPrice))) return;

    try {
      await dealerService.updateProduct(productId, {
        pricePerUnit: parseFloat(newPrice)
      });

      toast({
        title: "Price Updated!",
        description: `${productName} price updated to ₹${newPrice}`,
      });
    } catch (error) {
      console.error('Error updating price:', error);
      toast({
        title: "Error",
        description: "Failed to update price. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle save contact info
  const handleSaveContactInfo = async () => {
    if (!currentUser?.uid) return;
    
    const { businessName, ownerName, phone, whatsapp, email, address } = contactForm;
    
    try {
      await dealerService.createOrUpdateDealerProfile(currentUser.uid, {
        businessName,
        ownerName,
        phone,
        whatsapp: whatsapp || phone,
        email,
        address
      });

      toast({
        title: "Contact Information Updated!",
        description: "Your contact details have been saved successfully.",
      });
      
      setShowContactModal(false);
      loadDealerProfile();
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast({
        title: "Error",
        description: "Failed to save contact information. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle view all inquiries
  const handleViewAllInquiries = () => {
    toast({
      title: "Price Inquiries",
      description: "Viewing all recent price inquiries from farmers.",
    });
  };

  // Handle call back to farmer
  const handleCallBack = (farmerName: string, phone?: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_blank');
    }
    toast({
      title: "Calling Farmer",
      description: `Initiating call to ${farmerName}`,
    });
  };

  // Handle add feed product
  const handleAddFeed = () => {
    setNewProductForm({
      productName: '',
      supplier: '',
      pricePerUnit: '',
      currentStock: '',
      unit: '50kg bag',
      category: 'feed',
      minStockLevel: ''
    });
    setShowAddFeedModal(true);
  };

  // Handle edit contact
  const handleEditContact = () => {
    if (dealerProfile) {
      setContactForm({
        businessName: dealerProfile.businessName,
        ownerName: dealerProfile.ownerName,
        phone: dealerProfile.phone,
        whatsapp: dealerProfile.whatsapp,
        email: dealerProfile.email,
        address: dealerProfile.address
      });
    } else {
      setContactForm({
        businessName: '',
        ownerName: currentUser?.displayName || '',
        phone: '',
        whatsapp: '',
        email: currentUser?.email || '',
        address: ''
      });
    }
    setShowContactModal(true);
  };

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
      loadDealerProfile();
    } catch (error) {
      console.error('Error creating demo data:', error);
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

    console.log('Setting up real-time data subscriptions for dealer:', currentUser.uid);
    
    // Load dealer profile
    loadDealerProfile();

    // Subscribe to connected farmers
    const unsubscribeFarmers = getDealerFarmers(currentUser.uid, (dealerFarmers) => {
      console.log('Connected farmers updated:', dealerFarmers);
      setConnectedFarmers(dealerFarmers);
      
      // Convert to FarmerData format for compatibility
      const formattedFarmers: FarmerData[] = dealerFarmers.map(df => ({
        id: df.id || df.farmerId,
        dealerId: df.dealerId,
        farmerId: df.farmerId,
        farmerName: df.farmerName,
        farmerEmail: df.farmerEmail || '',
        chicksReceived: df.chicksReceived || 0,
        feedConsumption: df.feedConsumption || 0,
        mortalityRate: df.mortalityRate || 0,
        fcr: df.fcr || 0,
        accountBalance: df.accountBalance || 0,
        lastUpdated: df.lastUpdated || { toDate: () => new Date() } as any
      }));
      
      setFarmers(formattedFarmers);
      setLoading(false);
    });

    // Subscribe to products
    const unsubscribeProducts = dealerService.getDealerProducts(currentUser.uid, (products) => {
      console.log('Products updated:', products);
      setProducts(products);
    });

    // Subscribe to orders
    const unsubscribeOrders = dealerService.getDealerOrders(currentUser.uid, (orders) => {
      console.log('Orders updated:', orders);
      setOrders(orders);
    });

    return () => {
      console.log('Cleaning up dealer dashboard subscriptions');
      unsubscribeFarmers();
      unsubscribeProducts();
      unsubscribeOrders();
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

  // Calculate dashboard statistics
  const totalFarmers = farmers.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const lowStockProducts = products.filter(product => product.currentStock <= product.minStockLevel).length;
  const totalRevenue = orders.filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">
            {t.welcome}, {dealerProfile?.businessName || currentUser?.displayName || 'Dealer'}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Language Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            {language === 'hi' ? 'EN' : 'हिं'}
          </Button>
          
          <Button onClick={handleCreateDemo} disabled={isCreatingDemo}>
            <Database className="mr-2 h-4 w-4" />
            {isCreatingDemo ? t.creating : t.createDemoData}
          </Button>
          <Button onClick={handleGenerateInviteCode} disabled={isGeneratingCode}>
            <Share className="mr-2 h-4 w-4" />
            {isGeneratingCode ? 'Generating...' : t.generateCode}
          </Button>
        </div>
      </div>

      {/* Invitation Code Display */}
      {currentInviteCode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">{t.yourInvitationCode}</h3>
                <p className="text-blue-700 font-mono text-lg">{currentInviteCode}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyInviteCode}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={shareInviteLink}>
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.connectedFarmers}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFarmers}</div>
            <p className="text-xs text-muted-foreground">
              {t.fromLastMonth2}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.pendingOrders}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.lowStockAlerts}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              {t.productsNeedRestocking}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              {t.fromLastMonth}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">{t.dashboard}</TabsTrigger>
          <TabsTrigger value="accounts">{t.accounts}</TabsTrigger>
          <TabsTrigger value="ledger">{t.ledger}</TabsTrigger>
          <TabsTrigger value="insights">{t.insights}</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Main Content Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Connected Farmers */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t.connectedFarmers}</span>
              <Badge variant="secondary">{farmers.length} {t.active}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {farmers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {t.noFarmersConnected}
                </p>
              ) : (
                farmers.slice(0, 5).map((farmer) => (
                  <div key={farmer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{farmer.farmerName}</p>
                        <p className="text-sm text-muted-foreground">FCR: {farmer.fcr}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{farmer.accountBalance.toLocaleString('en-IN')}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCallBack(farmer.farmerName)}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        {t.call}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t.quickActions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleAddFeed} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {t.addFeedProduct}
            </Button>
            <Button onClick={handleViewAllInquiries} variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              {t.viewPriceInquiries}
            </Button>
            <Button onClick={handleEditContact} variant="outline" className="w-full">
              <Building2 className="mr-2 h-4 w-4" />
              {t.updateContactInfo}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t.recentOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {t.noOrdersYet}
                </p>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.farmerName} • {order.quantity} {order.orderType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                      <Badge variant={
                        order.status === 'pending' ? 'default' :
                        order.status === 'confirmed' ? 'secondary' :
                        order.status === 'delivered' ? 'outline' : 'destructive'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>{t.productAlerts}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.filter(p => p.currentStock <= p.minStockLevel).length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {t.allProductsWellStocked}
                </p>
              ) : (
                products
                  .filter(p => p.currentStock <= p.minStockLevel)
                  .slice(0, 5)
                  .map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-medium text-red-900">{product.productName}</p>
                        <p className="text-sm text-red-600">
                          {t.stockLabel}: {product.currentStock} {product.unit}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdatePrice(product.id, product.productName)}
                      >
                        {t.update}
                      </Button>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </TabsContent>

      <TabsContent value="accounts" className="space-y-6">
        <AccountSummary dealerId={currentUser?.uid} />
      </TabsContent>

      <TabsContent value="ledger" className="space-y-6">
        <LedgerView 
          dealerId={currentUser?.uid}
          userRole="dealer"
        />
      </TabsContent>

      <TabsContent value="insights" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Business Analytics</h3>
              <p className="text-gray-600">Advanced business insights and analytics coming soon!</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>

      {/* Add Feed Modal */}
      <Dialog open={showAddFeedModal} onOpenChange={setShowAddFeedModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productName" className="text-right">
                Product Name
              </Label>
              <Input
                id="productName"
                value={newProductForm.productName}
                onChange={(e) => setNewProductForm({...newProductForm, productName: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">
                Supplier
              </Label>
              <Input
                id="supplier"
                value={newProductForm.supplier}
                onChange={(e) => setNewProductForm({...newProductForm, supplier: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pricePerUnit" className="text-right">
                Price per Unit
              </Label>
              <Input
                id="pricePerUnit"
                type="number"
                value={newProductForm.pricePerUnit}
                onChange={(e) => setNewProductForm({...newProductForm, pricePerUnit: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentStock" className="text-right">
                Current Stock
              </Label>
              <Input
                id="currentStock"
                type="number"
                value={newProductForm.currentStock}
                onChange={(e) => setNewProductForm({...newProductForm, currentStock: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Unit
              </Label>
              <Input
                id="unit"
                value={newProductForm.unit}
                onChange={(e) => setNewProductForm({...newProductForm, unit: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddFeedModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewProduct}>
              Add Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Contact Information</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="businessName" className="text-right">
                Business Name
              </Label>
              <Input
                id="businessName"
                value={contactForm.businessName}
                onChange={(e) => setContactForm({...contactForm, businessName: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ownerName" className="text-right">
                Owner Name
              </Label>
              <Input
                id="ownerName"
                value={contactForm.ownerName}
                onChange={(e) => setContactForm({...contactForm, ownerName: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={contactForm.phone}
                onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Textarea
                id="address"
                value={contactForm.address}
                onChange={(e) => setContactForm({...contactForm, address: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowContactModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveContactInfo}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DealerDashboard;
