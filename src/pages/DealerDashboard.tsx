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
import { useEnhancedTranslation } from "@/contexts/EnhancedTranslationContext";
import { LanguageToggle } from "@/components/TranslationComponents";
import { 
  getDealerProducts,
  addProduct,
  updateProduct,
  getDealerProfile,
  createOrUpdateDealerProfile,
  createInvitationCode,
  addRateUpdate,
  type Product,
  type DealerProfile
} from '@/services/dealerService';
import { 
  getDealerFarmers,
  type DealerFarmerData
} from '@/services/connectionService';
import { 
  inventoryService,
  type InventoryItem
} from '@/services/inventoryService';
import { 
  orderService,
  type OrderRequest,
  type FarmerAccountTransaction
} from '@/services/orderService';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Edit,
  UserPlus,
  AlertCircle,
  Settings,
  Archive,
  Minus,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Wallet
} from 'lucide-react';
import { WalletManagement } from '@/components/WalletManagement';

const DealerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { language, t } = useEnhancedTranslation();

  // Enhanced translation helper that prioritizes Google Translate
  const bt = (key: string): string => {
    // First try Enhanced Translation Context (Google Translate)
    const dynamicTranslation = t(key);
    if (dynamicTranslation && dynamicTranslation !== key) {
      console.log(`🌍 Google Translate used for DealerDashboard: ${key} -> ${dynamicTranslation}`);
      return dynamicTranslation;
    }

    // Fallback to local content - fix the nested structure lookup
    const localContent = content[key as keyof typeof content];
    if (localContent && typeof localContent === 'object') {
      const translatedValue = localContent[language as keyof typeof localContent];
      if (translatedValue) {
        console.log(`📚 Static content used for DealerDashboard: ${key} -> ${translatedValue}`);
        return translatedValue as string;
      }
    }
    
    const result = key;
    console.log(`⚠️ No translation found for DealerDashboard: ${key}`);
    return result;
  };

  // Content object for translations
  const content = {
    // Page header
    dealerDashboard: { en: "Dealer Dashboard", hi: "डीलर डैशबोर्ड" },
    welcomeBack: { en: "Welcome back", hi: "स्वागत है" },
    generateInviteCode: { en: "Generate Invite Code", hi: "इनवाइट कोड बनाएं" },
    editProfile: { en: "Edit Profile", hi: "प्रोफ़ाइल संपादित करें" },
    
    // Stats cards
    totalProducts: { en: "Total Products", hi: "कुल उत्पाद" },
    inInventory: { en: "In inventory", hi: "इन्वेंटरी में" },
    totalRevenue: { en: "Total Revenue", hi: "कुल आय" },
    fromAllFarmers: { en: "From all farmers", hi: "सभी किसानों से" },
    amountGiven: { en: "Amount Given", hi: "दी गई राशि" },
    toFarmers: { en: "To farmers", hi: "किसानों को" },
    
    // Company amounts section
    companyAmountsTitle: { en: "Company Amounts Given to Farmers", hi: "कंपनी की राशि किसानों को दी गई" },
    companyAmountsDesc: { en: "Track amounts from different companies provided to farmers", hi: "किसानों को प्रदान की गई विभिन्न कंपनियों की राशि को ट्रैक करें" },
    feedCompanies: { en: "Feed Companies", hi: "फीड कंपनियां" },
    medicineCompanies: { en: "Medicine Companies", hi: "दवा कंपनियां" },
    chickCompanies: { en: "Chick Companies", hi: "चूजा कंपनियां" },
    amountGivenToFarmers: { en: "Amount given to farmers", hi: "किसानों को दी गई राशि" },
    totalGiven: { en: "Total Given", hi: "कुल दी गई" },
    allCompaniesCombined: { en: "All companies combined", hi: "सभी कंपनियां मिलाकर" },
    pendingRecovery: { en: "Pending Recovery", hi: "लंबित वसूली" },
    amountToRecover: { en: "Amount to recover", hi: "वसूली की जाने वाली राशि" },
    
    // Quick actions
    quickActions: { en: "Quick Actions", hi: "त्वरित क्रियाएं" },
    quickActionsDesc: { en: "Manage your dealer operations efficiently", hi: "अपने डीलर ऑपरेशन को कुशलता से प्रबंधित करें" },
    addProduct: { en: "Add Product", hi: "उत्पाद जोड़ें" },
    updatePrices: { en: "Update Prices", hi: "कीमतें अपडेट करें" },
    products: { en: "Products", hi: "उत्पाद" },
    inventory: { en: "Inventory", hi: "इन्वेंटरी" },
    orders: { en: "Orders", hi: "ऑर्डर" },
    farmers: { en: "Farmers", hi: "किसान" },
    guides: { en: "Guides", hi: "गाइड्स" },
    
    // Products section
    yourProducts: { en: "Your Products", hi: "आपके उत्पाद" },
    manageProductsDesc: { en: "Manage your product inventory and pricing", hi: "अपनी उत्पाद सूची और मूल्य निर्धारण का प्रबंधन करें" },
    
    // Product details
    feed: { en: "Feed", hi: "चारा" },
    price: { en: "Price", hi: "कीमत" },
    stock: { en: "Stock", hi: "स्टॉक" },
    supplier: { en: "Supplier", hi: "आपूर्तिकर्ता" },
    bags: { en: "bags", hi: "बैग" },
    
    // Product management
    manageProductInventory: { en: "Manage your product inventory and pricing", hi: "अपनी उत्पाद इन्वेंट्री और मूल्य निर्धारण का प्रबंधन करें" },
    noProductsYet: { en: "No Products Yet", hi: "अभी तक कोई उत्पाद नहीं" },
    addFirstProductMsg: { en: "Add your first product to start selling to farmers.", hi: "किसानों को बेचना शुरू करने के लिए अपना पहला उत्पाद जोड़ें।" },
    addFirstProduct: { en: "Add First Product", hi: "पहला उत्पाद जोड़ें" },
    lowStockWarning: { en: "Low stock! Only", hi: "कम स्टॉक! केवल" },
    remaining: { en: "remaining", hi: "बचे हैं" },
    
    // Inventory section
    inventoryManagement: { en: "Inventory Management", hi: "इन्वेंट्री प्रबंधन" },
    items: { en: "items", hi: "आइटम" },
    trackStockLevels: { en: "Track and manage your stock levels manually", hi: "अपने स्टॉक स्तर को मैन्युअल रूप से ट्रैक और प्रबंधित करें" },
    addItem: { en: "Add Item", hi: "आइटम जोड़ें" },
    noInventoryItems: { en: "No inventory items yet", hi: "अभी तक कोई इन्वेंट्री आइटम नहीं" },
    addFirstInventoryMsg: { en: "Start by adding your first inventory item to track stock levels.", hi: "स्टॉक स्तर को ट्रैक करने के लिए अपना पहला इन्वेंट्री आइटम जोड़ना शुरू करें।" },
    addFirstItem: { en: "Add First Item", hi: "पहला आइटम जोड़ें" },
    
    // Orders section
    farmerOrderRequests: { en: "Farmer Order Requests", hi: "किसान ऑर्डर अनुरोध" },
    pending: { en: "pending", hi: "लंबित" },
    manageIncomingOrders: { en: "Manage incoming orders from your farmers", hi: "अपने किसानों से आने वाले ऑर्डर का प्रबंधन करें" },
    noOrderRequests: { en: "No order requests yet", hi: "अभी तक कोई ऑर्डर अनुरोध नहीं" },
    farmersWillRequestProducts: { en: "Farmers will be able to request feed, medicine, and chicks from you.", hi: "किसान आपसे चारा, दवाई और चूजों की मांग कर सकेंगे।" },
    
    // Farmers section
    connectedFarmers: { en: "Connected Farmers", hi: "जुड़े हुए किसान" },
    farmersConnectedToDealer: { en: "Farmers connected to your dealership", hi: "आपकी डीलरशिप से जुड़े किसान" },
    noConnectedFarmers: { en: "No Connected Farmers", hi: "कोई जुड़े हुए किसान नहीं" },
    generateInviteCodeMsg: { en: "Generate an invite code to connect with farmers or create demo data", hi: "किसानों से जुड़ने के लिए इनवाइट कोड बनाएं या डेमो डेटा बनाएं" },
    
    // Guides section
    poultryBusinessGuides: { en: "Poultry Business Guides", hi: "पोल्ट्री बिजनेस गाइड्स" },
    accessBusinessTips: { en: "Access business tips, market insights, and best practices for dealers", hi: "डीलरों के लिए व्यावसायिक सुझाव, बाजार की जानकारी और सर्वोत्तम प्रथाओं तक पहुंच" },
    loadingGuides: { en: "Loading guides and business tips...", hi: "गाइड और व्यावसायिक सुझाव लोड कर रहे हैं..." },
    viewAllGuides: { en: "View All Guides & Tips", hi: "सभी गाइड और टिप्स देखें" },
    
    // Product modal
    editProduct: { en: "Edit Product", hi: "उत्पाद संपादित करें" },
    addNewProduct: { en: "Add New Product", hi: "नया उत्पाद जोड़ें" },
    updateProductInfo: { en: "Update product information", hi: "उत्पाद की जानकारी अपडेट करें" },
    addNewProductToInventory: { en: "Add a new product to your inventory", hi: "अपनी इन्वेंट्री में नया उत्पाद जोड़ें" },
    productName: { en: "Product Name", hi: "उत्पाद का नाम" },
    productNamePlaceholder: { en: "e.g., Starter Feed", hi: "जैसे, स्टार्टर फीड" },
    category: { en: "Category", hi: "श्रेणी" },
    selectCategory: { en: "Select category", hi: "श्रेणी चुनें" },
    medicine: { en: "Medicine", hi: "दवाई" },
    equipment: { en: "Equipment", hi: "उपकरण" },
    chicks: { en: "Chicks", hi: "चूजे" },
    other: { en: "Other", hi: "अन्य" },
    unit: { en: "Unit", hi: "इकाई" },
    
    // Loading message
    loadingDashboard: { en: "Loading dealer dashboard...", hi: "डीलर डैशबोर्ड लोड कर रहे हैं..." }
  };

  // State management
  const [dealerProfile, setDealerProfile] = useState<DealerProfile | null>(null);
  const [dealerProducts, setDealerProducts] = useState<Product[]>([]);
  const [connectedFarmers, setConnectedFarmers] = useState<DealerFarmerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Inventory state
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  
  // Order requests state
  const [dealerOrderRequests, setDealerOrderRequests] = useState<OrderRequest[]>([]);
  const [showOrderResponseModal, setShowOrderResponseModal] = useState(false);
  const [selectedOrderRequest, setSelectedOrderRequest] = useState<OrderRequest | null>(null);
  const [orderResponseForm, setOrderResponseForm] = useState({
    status: 'approved' as 'approved' | 'rejected',
    dealerNotes: '',
    estimatedCost: ''
  });
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form states
  const [productForm, setProductForm] = useState({
    productName: '',
    category: 'Feed' as 'Feed' | 'Medicine' | 'Equipment' | 'Chicks' | 'Other',
    pricePerUnit: '',
    unit: 'bags',
    currentStock: '',
    minStockLevel: '',
    supplier: ''
  });

  const [contactForm, setContactForm] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: ''
  });

  const [priceUpdateForm, setPriceUpdateForm] = useState({
    productId: '',
    productName: '',
    oldPrice: '',
    newPrice: '',
    reason: ''
  });

  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    category: 'Feed' as 'Feed' | 'Medicine' | 'Equipment' | 'Chicks' | 'Other',
    currentStock: '',
    unit: 'bags',
    costPrice: '',
    sellingPrice: '',
    supplier: '',
    minStockLevel: ''
  });

  const [stockForm, setStockForm] = useState({
    quantity: '',
    type: 'add' as 'add' | 'remove',
    notes: ''
  });

  const [generatedInviteCode, setGeneratedInviteCode] = useState('');
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    avgFCR: 0
  });

  // Financial tracking for company amounts given to farmers (calculated from real data)
  const [companyAmounts, setCompanyAmounts] = useState({
    feedCompanyAmounts: 0,      // Amount from feed companies given to farmers
    medicineCompanyAmounts: 0,  // Amount from medicine companies given to farmers  
    chickCompanyAmounts: 0,     // Amount from chick companies given to farmers
    totalGivenToFarmers: 0,     // Total amount given to farmers
    pendingRecovery: 0          // Amount still to be recovered
  });

  // State for error handling
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Firebase listeners setup
  useEffect(() => {
    if (!currentUser?.uid) return;

    const dealerId = currentUser.uid;
    
    const initializeDashboard = async () => {
      try {
        setError(null);
        setIsLoading(true);
        
        // Load dealer profile
        await loadDealerProfile();
        
        // Set up real-time listeners with error handling
        const unsubscribeFarmers = getDealerFarmers(dealerId, (farmers) => {
          setConnectedFarmers(farmers);
          updateStats(farmers, dealerProducts);
        });

        const unsubscribeProducts = getDealerProducts(dealerId, (products) => {
          setDealerProducts(products);
          updateStats(connectedFarmers, products);
        });

        // Set up inventory listener
        const unsubscribeInventory = inventoryService.subscribeToInventory(dealerId, (inventory) => {
          setInventoryItems(inventory);
        });

        // Set up order requests listener  
        const unsubscribeOrders = orderService.subscribeDealerOrderRequests(dealerId, (orders) => {
          setDealerOrderRequests(orders);
        });

        setIsLoading(false);

        return () => {
          unsubscribeFarmers();
          unsubscribeProducts();
          unsubscribeInventory();
          unsubscribeOrders();
        };
      } catch (error) {
        console.error('Error initializing dealer dashboard:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard');
        setIsLoading(false);
        
        // Auto-retry logic (up to 3 times)
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000 * (retryCount + 1)); // Exponential backoff
        }
      }
    };

    initializeDashboard();
  }, [currentUser?.uid, retryCount]);

  // Update statistics
  const updateStats = (farmers: DealerFarmerData[], products: Product[]) => {
    const totalRevenue = farmers.reduce((sum, farmer) => sum + (farmer.accountBalance || 0), 0);
    const avgFCR = farmers.length > 0 
      ? farmers.reduce((sum, farmer) => sum + (farmer.fcr || 0), 0) / farmers.length 
      : 0;

    setStats({
      totalFarmers: farmers.length,
      totalProducts: products.length,
      totalRevenue,
      avgFCR: Number(avgFCR.toFixed(2))
    });

    // Only calculate company amounts if we have farmers with meaningful data
    if (farmers.length > 0 && farmers.some(farmer => farmer.totalExpenses > 0)) {
      // Calculate company amounts based on actual farmer expenses and dealer's share
      const totalFeedExpenses = farmers.reduce((sum, farmer) => {
        return sum + (farmer.totalExpenses * 0.4); // 40% of farmer expenses typically from feed
      }, 0);
      
      const totalChicksValue = farmers.reduce((sum, farmer) => {
        return sum + (farmer.totalExpenses * 0.25); // 25% of farmer expenses typically from chicks
      }, 0);

      const totalMedicineExpenses = farmers.reduce((sum, farmer) => {
        return sum + (farmer.totalExpenses * 0.1); // 10% of farmer expenses typically from medicine
      }, 0);

      // Update company amounts with calculated dealer's contribution to farmers
      setCompanyAmounts({
        feedCompanyAmounts: Math.round(totalFeedExpenses),
        medicineCompanyAmounts: Math.round(totalMedicineExpenses),
        chickCompanyAmounts: Math.round(totalChicksValue),
        totalGivenToFarmers: Math.round(totalFeedExpenses + totalMedicineExpenses + totalChicksValue),
        pendingRecovery: Math.round((totalFeedExpenses + totalMedicineExpenses + totalChicksValue) * 0.15) // 15% pending recovery
      });
    } else {
      // Reset to zeros when no meaningful farmer data
      setCompanyAmounts({
        feedCompanyAmounts: 0,
        medicineCompanyAmounts: 0,
        chickCompanyAmounts: 0,
        totalGivenToFarmers: 0,
        pendingRecovery: 0
      });
    }
  };

  // Load dealer profile
  const loadDealerProfile = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const profile = await getDealerProfile(currentUser.uid);
      setDealerProfile(profile);
      
      if (profile) {
        setContactForm({
          businessName: profile.businessName || '',
          ownerName: profile.ownerName || '',
          phone: profile.phone || '',
          whatsapp: profile.whatsapp || '',
          email: profile.email || '',
          address: profile.address || ''
        });
      }
    } catch (error) {
      console.error('Error loading dealer profile:', error);
    }
  };

  // Generate invite code
  const handleGenerateInviteCode = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const inviteCode = await createInvitationCode(currentUser.uid);
      setGeneratedInviteCode(inviteCode);
      setShowInviteModal(true);
      
      // Create shareable link
      const baseUrl = window.location.origin;
      const shareableLink = `${baseUrl}/farmer-connect?code=${inviteCode}`;
      
      // Copy link to clipboard
      navigator.clipboard.writeText(shareableLink).then(() => {
        console.log('Link copied to clipboard:', shareableLink);
      }).catch(err => {
        console.error('Failed to copy link:', err);
      });
      
      toast({
        title: "Invite Code Generated",
        description: `Share this code or link with farmers: ${inviteCode}`,
      });
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast({
        title: "Error",
        description: "Failed to generate invite code.",
        variant: "destructive",
      });
    }
  };

  // Add or update product
  const handleSaveProduct = async () => {
    if (!currentUser?.uid) return;
    
    if (!productForm.productName || !productForm.pricePerUnit) {
      toast({
        title: "Missing Information",
        description: "Please fill in product name and price.",
        variant: "destructive",
      });
      return;
    }

    try {
      const productData = {
        productName: productForm.productName,
        category: productForm.category,
        pricePerUnit: parseFloat(productForm.pricePerUnit),
        unit: productForm.unit,
        currentStock: parseInt(productForm.currentStock) || 0,
        minStockLevel: parseInt(productForm.minStockLevel) || 0,
        supplier: productForm.supplier
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast({
          title: "Product Updated",
          description: "Product has been updated successfully.",
        });
      } else {
        await addProduct(currentUser.uid, productData);
        toast({
          title: "Product Added",
          description: "New product has been added successfully.",
        });
      }

      setShowProductModal(false);
      setEditingProduct(null);
      resetProductForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product.",
        variant: "destructive",
      });
    }
  };

  // Update contact information
  const handleUpdateContact = async () => {
    if (!currentUser?.uid) return;
    
    try {
      await createOrUpdateDealerProfile(currentUser.uid, contactForm);
      
      toast({
        title: "Profile Updated",
        description: "Your contact information has been updated.",
      });
      
      setShowContactModal(false);
      loadDealerProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  // Update price
  const handleUpdatePrice = async () => {
    if (!currentUser?.uid || !priceUpdateForm.productId) return;
    
    try {
      // Update product price
      await updateProduct(priceUpdateForm.productId, {
        pricePerUnit: parseFloat(priceUpdateForm.newPrice)
      });

      // Add rate update record
      await addRateUpdate(currentUser.uid, {
        productName: priceUpdateForm.productName,
        category: 'Feed', // Default category
        newRate: parseFloat(priceUpdateForm.newPrice),
        unit: 'bags' // Default unit
      });

      toast({
        title: "Price Updated",
        description: `${priceUpdateForm.productName} price updated successfully.`,
      });

      setShowPriceModal(false);
      resetPriceForm();
    } catch (error) {
      console.error('Error updating price:', error);
      toast({
        title: "Error",
        description: "Failed to update price.",
        variant: "destructive",
      });
    }
  };

  // Reset forms
  const resetProductForm = () => {
    setProductForm({
      productName: '',
      category: 'Feed',
      pricePerUnit: '',
      unit: 'bags',
      currentStock: '',
      minStockLevel: '',
      supplier: ''
    });
  };

  const resetPriceForm = () => {
    setPriceUpdateForm({
      productId: '',
      productName: '',
      oldPrice: '',
      newPrice: '',
      reason: ''
    });
  };

  // Edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      productName: product.productName,
      category: product.category as any,
      pricePerUnit: product.pricePerUnit.toString(),
      unit: product.unit,
      currentStock: product.currentStock.toString(),
      minStockLevel: product.minStockLevel.toString(),
      supplier: product.supplier || ''
    });
    setShowProductModal(true);
  };

  // Prepare price update
  const handlePriceUpdate = (product: Product) => {
    setPriceUpdateForm({
      productId: product.id,
      productName: product.productName,
      oldPrice: product.pricePerUnit.toString(),
      newPrice: product.pricePerUnit.toString(),
      reason: ''
    });
    setShowPriceModal(true);
  };

  // Inventory handlers
  const handleAddInventoryItem = async () => {
    if (!currentUser?.uid) return;

    try {
      setIsLoadingInventory(true);
      await inventoryService.addInventoryItem(currentUser.uid, {
        name: inventoryForm.name,
        category: inventoryForm.category,
        currentStock: parseInt(inventoryForm.currentStock),
        unit: inventoryForm.unit,
        costPrice: parseFloat(inventoryForm.costPrice),
        sellingPrice: parseFloat(inventoryForm.sellingPrice),
        supplier: inventoryForm.supplier,
        minStockLevel: parseInt(inventoryForm.minStockLevel)
      });

      // Reset form
      setInventoryForm({
        name: '',
        category: 'Feed',
        currentStock: '',
        unit: 'bags',
        costPrice: '',
        sellingPrice: '',
        supplier: '',
        minStockLevel: ''
      });
      setShowInventoryModal(false);

      toast({
        title: "Success",
        description: "Inventory item added successfully!",
      });
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to add inventory item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInventory(false);
    }
  };

  const handleStockUpdate = async () => {
    if (!currentUser?.uid || !selectedInventoryItem) return;

    try {
      setIsLoadingInventory(true);
      const quantity = parseInt(stockForm.quantity);
      
      if (stockForm.type === 'add') {
        await inventoryService.addStock(currentUser.uid, selectedInventoryItem.id, quantity, stockForm.notes);
      } else {
        await inventoryService.removeStock(currentUser.uid, selectedInventoryItem.id, quantity, stockForm.notes);
      }

      // Reset form
      setStockForm({
        quantity: '',
        type: 'add',
        notes: ''
      });
      setSelectedInventoryItem(null);
      setShowStockModal(false);

      toast({
        title: "Success",
        description: "Stock updated successfully!",
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error",
        description: "Failed to update stock. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInventory(false);
    }
  };

  const handleDeleteInventoryItem = async (itemId: string) => {
    if (!currentUser?.uid) return;

    try {
      await inventoryService.deleteInventoryItem(currentUser.uid, itemId);
      toast({
        title: "Success",
        description: "Inventory item deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Order response handler
  const handleOrderResponse = async () => {
    if (!selectedOrderRequest) return;

    try {
      await orderService.updateOrderRequestStatus(
        selectedOrderRequest.id,
        orderResponseForm.status,
        orderResponseForm.dealerNotes,
        orderResponseForm.estimatedCost ? parseFloat(orderResponseForm.estimatedCost) : undefined
      );

      // Reset form
      setOrderResponseForm({
        status: 'approved',
        dealerNotes: '',
        estimatedCost: ''
      });
      setSelectedOrderRequest(null);
      setShowOrderResponseModal(false);

      toast({
        title: "Success",
        description: `Order request ${orderResponseForm.status} successfully!`,
      });

    } catch (error) {
      console.error('Error responding to order request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to order request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
          <p className="mt-4 text-lg text-gray-600">{bt('loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{bt('dealerDashboard')}</h1>
          <p className="text-gray-600 mt-1">
            {bt('welcomeBack')}, {dealerProfile?.businessName || bt('dealer')}!
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleGenerateInviteCode} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            {bt('generateInviteCode')}
          </Button>
          
          <Button variant="outline" onClick={() => setShowContactModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            {bt('editProfile')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{bt('totalProducts')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">{bt('inInventory')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{bt('totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{bt('fromAllFarmers')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{bt('amountGiven')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{companyAmounts.totalGivenToFarmers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{bt('toFarmers')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Company Amounts Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{bt('companyAmountsTitle')}</CardTitle>
          <CardDescription>{bt('companyAmountsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Package className="h-8 w-8 text-yellow-600" />
              <div>
                <h4 className="font-semibold text-yellow-800">{bt('feedCompanies')}</h4>
                <p className="text-2xl font-bold text-yellow-600">₹{companyAmounts.feedCompanyAmounts.toLocaleString()}</p>
                <p className="text-sm text-yellow-700">{bt('amountGivenToFarmers')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Package className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-semibold text-purple-800">{bt('medicineCompanies')}</h4>
                <p className="text-2xl font-bold text-purple-600">₹{companyAmounts.medicineCompanyAmounts.toLocaleString()}</p>
                <p className="text-sm text-purple-700">{bt('amountGivenToFarmers')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Package className="h-8 w-8 text-orange-600" />
              <div>
                <h4 className="font-semibold text-orange-800">{bt('chickCompanies')}</h4>
                <p className="text-2xl font-bold text-orange-600">₹{companyAmounts.chickCompanyAmounts.toLocaleString()}</p>
                <p className="text-sm text-orange-700">{bt('amountGivenToFarmers')}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-green-800">{bt('totalGiven')}</h4>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">₹{companyAmounts.totalGivenToFarmers.toLocaleString()}</p>
              <p className="text-sm text-green-700">{bt('allCompaniesCombined')}</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-red-800">{bt('pendingRecovery')}</h4>
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600">₹{companyAmounts.pendingRecovery.toLocaleString()}</p>
              <p className="text-sm text-red-700">{bt('amountToRecover')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{bt('quickActions')}</CardTitle>
          <CardDescription>{bt('quickActionsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => setShowProductModal(true)}
              className="h-20 flex flex-col gap-2"
            >
              <Plus className="w-6 h-6" />
              {bt('addProduct')}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowPriceModal(true)}
              className="h-20 flex flex-col gap-2"
              disabled={dealerProducts.length === 0}
            >
              <Edit className="w-6 h-6" />
              {bt('updatePrices')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="overview">{bt('products')}</TabsTrigger>
          <TabsTrigger value="inventory">{bt('inventory')}</TabsTrigger>
          <TabsTrigger value="orders">{bt('orders')}</TabsTrigger>
          <TabsTrigger value="farmers">{bt('farmers')}</TabsTrigger>
          <TabsTrigger value="wallet">
            <Wallet className="w-4 h-4 mr-2" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="guides">{bt('guides')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Products Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{bt('yourProducts')} ({dealerProducts.length})</CardTitle>
                  <CardDescription>{bt('manageProductInventory')}</CardDescription>
                </div>
                <Button 
                  onClick={() => setShowProductModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {bt('addProduct')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dealerProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">{bt('noProductsYet')}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {bt('addFirstProductMsg')}
                  </p>
                  <Button 
                    onClick={() => setShowProductModal(true)}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {bt('addFirstProduct')}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dealerProducts.map((product) => (
                    <Card key={product.id} className="border-2">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{product.productName}</CardTitle>
                            <Badge variant="secondary">{product.category}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePriceUpdate(product)}
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">{bt('price')}:</span>
                            <span className="font-medium">₹{product.pricePerUnit}/{product.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">{bt('stock')}:</span>
                            <span className={`font-medium ${product.currentStock <= product.minStockLevel ? 'text-red-600' : ''}`}>
                              {product.currentStock} {product.unit}
                            </span>
                          </div>
                          {product.supplier && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">{bt('supplier')}:</span>
                              <span className="text-sm">{product.supplier}</span>
                            </div>
                          )}
                          {product.currentStock <= product.minStockLevel && (
                            <Alert className="mt-2">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                {bt('lowStockWarning')} {product.currentStock} {product.unit} {bt('remaining')}.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-6">
          {/* Inventory Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{bt('inventoryManagement')} ({inventoryItems.length} {bt('items')})</CardTitle>
                  <CardDescription>{bt('trackStockLevels')}</CardDescription>
                </div>
                <Button onClick={() => setShowInventoryModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {bt('addItem')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {inventoryItems.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{bt('noInventoryItems')}</h3>
                  <p className="text-gray-600 mb-4">{bt('addFirstInventoryMsg')}</p>
                  <Button onClick={() => setShowInventoryModal(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    {bt('addFirstItem')}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventoryItems.map((item) => (
                    <Card key={item.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedInventoryItem(item);
                                setStockForm({ ...stockForm, type: 'add' });
                                setShowStockModal(true);
                              }}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedInventoryItem(item);
                                setStockForm({ ...stockForm, type: 'remove' });
                                setShowStockModal(true);
                              }}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteInventoryItem(item.id)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Stock:</span>
                            <span className={`font-medium ${item.currentStock <= item.minStockLevel ? 'text-red-600' : 'text-green-600'}`}>
                              {item.currentStock} {item.unit}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cost Price:</span>
                            <span>₹{item.costPrice}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-600">Selling Price:</span>
                            <span>₹{item.sellingPrice}</span>
                          </div>
                          
                          {item.supplier && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Supplier:</span>
                              <span className="text-xs">{item.supplier}</span>
                            </div>
                          )}
                          
                          {item.currentStock <= item.minStockLevel && (
                            <Alert className="mt-2">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                Low stock! Minimum level: {item.minStockLevel} {item.unit}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-6">
          {/* Order Requests Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{bt('farmerOrderRequests')} ({dealerOrderRequests.filter(o => o.status === 'pending').length} {bt('pending')})</CardTitle>
                  <CardDescription>{bt('manageIncomingOrders')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {dealerOrderRequests.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{bt('noOrderRequests')}</h3>
                  <p className="text-gray-600">{bt('farmersWillRequestProducts')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dealerOrderRequests.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{order.farmerName}</h4>
                            <Badge variant={order.status === 'pending' ? 'outline' : 'default'}>
                              {order.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Item:</span>
                              <p className="font-medium">{order.orderType}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Quantity:</span>
                              <p className="font-medium">{order.quantity} {order.unit}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Requested:</span>
                              <p>{order.requestDate.toDate().toLocaleDateString()}</p>
                            </div>
                            {order.estimatedCost && (
                              <div>
                                <span className="text-muted-foreground">Estimated Cost:</span>
                                <p className="font-medium">₹{order.estimatedCost}</p>
                              </div>
                            )}
                          </div>
                          
                          {order.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                              <span className="text-muted-foreground">Notes:</span> {order.notes}
                            </div>
                          )}
                          
                          {order.dealerNotes && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                              <span className="text-muted-foreground">Your response:</span> {order.dealerNotes}
                            </div>
                          )}
                        </div>
                        
                        {order.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedOrderRequest(order);
                                setOrderResponseForm({
                                  status: 'approved',
                                  dealerNotes: '',
                                  estimatedCost: ''
                                });
                                setShowOrderResponseModal(true);
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedOrderRequest(order);
                                setOrderResponseForm({
                                  status: 'rejected',
                                  dealerNotes: '',
                                  estimatedCost: ''
                                });
                                setShowOrderResponseModal(true);
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="farmers" className="space-y-6">
          {/* Farmers Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{bt('connectedFarmers')}</CardTitle>
                  <CardDescription>{bt('farmersConnectedToDealer')}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleGenerateInviteCode} className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {bt('generateInviteCode')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {connectedFarmers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">{bt('noConnectedFarmers')}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {bt('generateInviteCodeMsg')}
                  </p>
                  <div className="flex justify-center gap-3 mt-4">
                    <Button onClick={handleGenerateInviteCode}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {bt('generateInviteCode')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connectedFarmers.map((farmer) => (
                    <Card key={farmer.id} className="border-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{farmer.farmerName}</CardTitle>
                        <div className="text-sm text-gray-600">{farmer.farmerEmail}</div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Chicks:</span>
                            <span className="font-medium">{farmer.chicksReceived}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Feed Consumption:</span>
                            <span className="font-medium">{farmer.feedConsumption} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">FCR:</span>
                            <span className={`font-medium ${farmer.fcr > 2.0 ? 'text-red-600' : 'text-green-600'}`}>
                              {farmer.fcr}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Mortality Rate:</span>
                            <span className={`font-medium ${farmer.mortalityRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                              {farmer.mortalityRate}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Account Balance:</span>
                            <span className={`font-medium ${farmer.accountBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              ₹{farmer.accountBalance.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6">
          <WalletManagement />
        </TabsContent>

        <TabsContent value="guides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{bt('poultryBusinessGuides')}</CardTitle>
              <p className="text-gray-600">{bt('accessBusinessTips')}</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">{bt('loadingGuides')}</p>
                <Button 
                  onClick={() => window.open('/posts', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {bt('viewAllGuides')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? bt('editProduct') : bt('addNewProduct')}</DialogTitle>
            <DialogDescription>
              {editingProduct ? bt('updateProductInfo') : bt('addNewProductToInventory')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">{bt('productName')} *</Label>
              <Input
                id="productName"
                value={productForm.productName}
                onChange={(e) => setProductForm({...productForm, productName: e.target.value})}
                placeholder={bt('productNamePlaceholder')}
              />
            </div>
            
            <div>
              <Label htmlFor="category">{bt('category')}</Label>
              <Select 
                value={productForm.category} 
                onValueChange={(value) => setProductForm({...productForm, category: value as any})}
              >
                <SelectTrigger>
                  <SelectValue placeholder={bt('selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Feed">{bt('feed')}</SelectItem>
                  <SelectItem value="Medicine">{bt('medicine')}</SelectItem>
                  <SelectItem value="Equipment">{bt('equipment')}</SelectItem>
                  <SelectItem value="Chicks">{bt('chicks')}</SelectItem>
                  <SelectItem value="Other">{bt('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pricePerUnit">{bt('price')} *</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  value={productForm.pricePerUnit}
                  onChange={(e) => setProductForm({...productForm, pricePerUnit: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="unit">{bt('unit')}</Label>
                <Select 
                  value={productForm.unit} 
                  onValueChange={(value) => setProductForm({...productForm, unit: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={productForm.currentStock}
                  onChange={(e) => setProductForm({...productForm, currentStock: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="minStockLevel">Min Stock Level</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  value={productForm.minStockLevel}
                  onChange={(e) => setProductForm({...productForm, minStockLevel: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={productForm.supplier}
                onChange={(e) => setProductForm({...productForm, supplier: e.target.value})}
                placeholder="Supplier name"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowProductModal(false);
                setEditingProduct(null);
                resetProductForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveProduct}>
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your dealer profile information</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={contactForm.businessName}
                onChange={(e) => setContactForm({...contactForm, businessName: e.target.value})}
                placeholder="Your business name"
              />
            </div>
            
            <div>
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                value={contactForm.ownerName}
                onChange={(e) => setContactForm({...contactForm, ownerName: e.target.value})}
                placeholder="Your name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={contactForm.whatsapp}
                  onChange={(e) => setContactForm({...contactForm, whatsapp: e.target.value})}
                  placeholder="WhatsApp number"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={contactForm.address}
                onChange={(e) => setContactForm({...contactForm, address: e.target.value})}
                placeholder="Your business address"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowContactModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateContact}>
              Update Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Code Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-lg sm:max-w-xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Farmer Invite Code</DialogTitle>
            <DialogDescription>Share this code or link with farmers to connect them to your dealership</DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Invitation Code:</h3>
              <div className="relative">
                <div className="text-base sm:text-lg font-mono font-medium text-green-600 bg-green-50 p-3 rounded-lg overflow-x-auto whitespace-nowrap hide-scrollbar max-w-full">
                  {generatedInviteCode}
                </div>
                <Button 
                  size="sm"
                  variant="ghost" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedInviteCode);
                    toast({
                      title: "Copied!",
                      description: "Invite code copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-2">Shareable Link:</h3>
              <div className="relative">
                <Input
                  value={`${window.location.origin}/farmer-connect?code=${generatedInviteCode}`}
                  readOnly
                  className="pr-16 text-xs sm:text-sm font-medium truncate"
                />
                <Button 
                  size="sm"
                  variant="ghost" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/farmer-connect?code=${generatedInviteCode}`);
                    toast({
                      title: "Copied!",
                      description: "Shareable link copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Send this link directly to farmers or share it on WhatsApp or SMS
              </p>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <div className="flex gap-2 items-start">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">How to use</h4>
                  <p className="text-xs text-amber-700">
                    Share either the code or link with farmers. When they use it, they'll be connected to your dealership automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-2 border-t pt-4">
            <Button 
              onClick={() => setShowInviteModal(false)}
              variant="outline"
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/farmer-connect?code=${generatedInviteCode}`);
                toast({
                  title: "Copied & Ready",
                  description: "Shareable link copied to clipboard",
                });
                setShowInviteModal(false);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Copy Link & Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Price Update Modal */}
      <Dialog open={showPriceModal} onOpenChange={setShowPriceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Product Price</DialogTitle>
            <DialogDescription>Update pricing for your products</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="productSelect">Select Product</Label>
              <Select 
                value={priceUpdateForm.productId} 
                onValueChange={(value) => {
                  const product = dealerProducts.find(p => p.id === value);
                  if (product) {
                    setPriceUpdateForm({
                      productId: value,
                      productName: product.productName,
                      oldPrice: product.pricePerUnit.toString(),
                      newPrice: product.pricePerUnit.toString(),
                      reason: ''
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {dealerProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.productName} - ₹{product.pricePerUnit}/{product.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {priceUpdateForm.productId && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Current Price</Label>
                    <Input value={`₹${priceUpdateForm.oldPrice}`} disabled />
                  </div>
                  <div>
                    <Label htmlFor="newPrice">New Price</Label>
                    <Input
                      id="newPrice"
                      type="number"
                      value={priceUpdateForm.newPrice}
                      onChange={(e) => setPriceUpdateForm({...priceUpdateForm, newPrice: e.target.value})}
                      placeholder="New price"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="reason">Reason for Change</Label>
                  <Textarea
                    id="reason"
                    value={priceUpdateForm.reason}
                    onChange={(e) => setPriceUpdateForm({...priceUpdateForm, reason: e.target.value})}
                    placeholder="Reason for price change"
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowPriceModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePrice}
              disabled={!priceUpdateForm.productId || !priceUpdateForm.newPrice}
            >
              Update Price
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Inventory Item Modal */}
      <Dialog open={showInventoryModal} onOpenChange={setShowInventoryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Add a new item to track in your inventory</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="inv-name">Item Name</Label>
              <Input
                id="inv-name"
                value={inventoryForm.name}
                onChange={(e) => setInventoryForm({...inventoryForm, name: e.target.value})}
                placeholder="e.g., Broiler Feed"
              />
            </div>
            
            <div>
              <Label htmlFor="inv-category">Category</Label>
              <Select 
                value={inventoryForm.category} 
                onValueChange={(value) => setInventoryForm({...inventoryForm, category: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Feed">Feed</SelectItem>
                  <SelectItem value="Medicine">Medicine</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Chicks">Chicks</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="inv-stock">Current Stock</Label>
                <Input
                  id="inv-stock"
                  type="number"
                  value={inventoryForm.currentStock}
                  onChange={(e) => setInventoryForm({...inventoryForm, currentStock: e.target.value})}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="inv-unit">Unit</Label>
                <Input
                  id="inv-unit"
                  value={inventoryForm.unit}
                  onChange={(e) => setInventoryForm({...inventoryForm, unit: e.target.value})}
                  placeholder="bags"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="inv-cost">Cost Price (₹)</Label>
                <Input
                  id="inv-cost"
                  type="number"
                  step="0.01"
                  value={inventoryForm.costPrice}
                  onChange={(e) => setInventoryForm({...inventoryForm, costPrice: e.target.value})}
                  placeholder="1200"
                />
              </div>
              <div>
                <Label htmlFor="inv-selling">Selling Price (₹)</Label>
                <Input
                  id="inv-selling"
                  type="number"
                  step="0.01"
                  value={inventoryForm.sellingPrice}
                  onChange={(e) => setInventoryForm({...inventoryForm, sellingPrice: e.target.value})}
                  placeholder="1400"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="inv-supplier">Supplier (Optional)</Label>
              <Input
                id="inv-supplier"
                value={inventoryForm.supplier}
                onChange={(e) => setInventoryForm({...inventoryForm, supplier: e.target.value})}
                placeholder="Supplier name"
              />
            </div>
            
            <div>
              <Label htmlFor="inv-min">Minimum Stock Level</Label>
              <Input
                id="inv-min"
                type="number"
                value={inventoryForm.minStockLevel}
                onChange={(e) => setInventoryForm({...inventoryForm, minStockLevel: e.target.value})}
                placeholder="10"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowInventoryModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddInventoryItem}
              disabled={!inventoryForm.name || !inventoryForm.currentStock || isLoadingInventory}
            >
              {isLoadingInventory ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Update Modal */}
      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {stockForm.type === 'add' ? 'Add Stock' : 'Remove Stock'}
            </DialogTitle>
            <DialogDescription>
              {stockForm.type === 'add' ? 'Add stock for' : 'Remove stock from'} {selectedInventoryItem?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="stock-quantity">Quantity</Label>
              <Input
                id="stock-quantity"
                type="number"
                value={stockForm.quantity}
                onChange={(e) => setStockForm({...stockForm, quantity: e.target.value})}
                placeholder="Enter quantity"
              />
            </div>
            
            <div>
              <Label htmlFor="stock-notes">Notes (Optional)</Label>
              <Textarea
                id="stock-notes"
                value={stockForm.notes}
                onChange={(e) => setStockForm({...stockForm, notes: e.target.value})}
                placeholder="Add notes about this stock change..."
                rows={2}
              />
            </div>
            
            {selectedInventoryItem && (
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-600">
                  Current Stock: <span className="font-medium">{selectedInventoryItem.currentStock} {selectedInventoryItem.unit}</span>
                </div>
                {stockForm.quantity && (
                  <div className="text-sm text-gray-600 mt-1">
                    After {stockForm.type}: 
                    <span className="font-medium ml-1">
                      {stockForm.type === 'add' 
                        ? selectedInventoryItem.currentStock + parseInt(stockForm.quantity)
                        : selectedInventoryItem.currentStock - parseInt(stockForm.quantity)
                      } {selectedInventoryItem.unit}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowStockModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStockUpdate}
              disabled={!stockForm.quantity || isLoadingInventory}
              className={stockForm.type === 'remove' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isLoadingInventory ? 'Updating...' : (stockForm.type === 'add' ? 'Add Stock' : 'Remove Stock')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Response Modal */}
      <Dialog open={showOrderResponseModal} onOpenChange={setShowOrderResponseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {orderResponseForm.status === 'approved' ? 'Approve Order' : 'Reject Order'}
            </DialogTitle>
            <DialogDescription>
              Respond to order request from {selectedOrderRequest?.farmerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedOrderRequest && (
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-sm">
                  <p><strong>Item:</strong> {selectedOrderRequest.orderType}</p>
                  <p><strong>Quantity:</strong> {selectedOrderRequest.quantity} {selectedOrderRequest.unit}</p>
                  {selectedOrderRequest.notes && (
                    <p><strong>Notes:</strong> {selectedOrderRequest.notes}</p>
                  )}
                </div>
              </div>
            )}
            
            {orderResponseForm.status === 'approved' && (
              <div>
                <Label htmlFor="estimated-cost">Estimated Cost (₹)</Label>
                <Input
                  id="estimated-cost"
                  type="number"
                  step="0.01"
                  value={orderResponseForm.estimatedCost}
                  onChange={(e) => setOrderResponseForm({...orderResponseForm, estimatedCost: e.target.value})}
                  placeholder="Enter estimated cost"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="dealer-notes">Your Response/Notes</Label>
              <Textarea
                id="dealer-notes"
                value={orderResponseForm.dealerNotes}
                onChange={(e) => setOrderResponseForm({...orderResponseForm, dealerNotes: e.target.value})}
                placeholder={orderResponseForm.status === 'approved' 
                  ? "Order approved. We'll prepare it for you..." 
                  : "Sorry, this item is currently unavailable..."
                }
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowOrderResponseModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleOrderResponse}
              className={orderResponseForm.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {orderResponseForm.status === 'approved' ? 'Approve Order' : 'Reject Order'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DealerDashboard;