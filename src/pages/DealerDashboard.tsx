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
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Edit,
  UserPlus,
  AlertCircle,
  Settings
} from 'lucide-react';

const DealerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // State management
  const [dealerProfile, setDealerProfile] = useState<DealerProfile | null>(null);
  const [dealerProducts, setDealerProducts] = useState<Product[]>([]);
  const [connectedFarmers, setConnectedFarmers] = useState<DealerFarmerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
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

  // Firebase listeners setup
  useEffect(() => {
    if (!currentUser?.uid) return;

    const dealerId = currentUser.uid;
    
    // Load dealer profile
    loadDealerProfile();
    
    // Set up real-time listeners
    const unsubscribeFarmers = getDealerFarmers(dealerId, (farmers) => {
      setConnectedFarmers(farmers);
      updateStats(farmers, dealerProducts);
    });

    const unsubscribeProducts = getDealerProducts(dealerId, (products) => {
      setDealerProducts(products);
      updateStats(connectedFarmers, products);
    });

    setIsLoading(false);

    return () => {
      unsubscribeFarmers();
      unsubscribeProducts();
    };
  }, [currentUser?.uid]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
          <p className="mt-4 text-lg text-gray-600">Loading dealer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dealer Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {dealerProfile?.businessName || 'Dealer'}!
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleGenerateInviteCode} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Generate Invite Code
          </Button>
          
          <Button variant="outline" onClick={() => setShowContactModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From all farmers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Given</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{companyAmounts.totalGivenToFarmers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">To farmers</p>
          </CardContent>
        </Card>
      </div>

      {/* Company Amounts Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Company Amounts Given to Farmers</CardTitle>
          <CardDescription>Track amounts from different companies provided to farmers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Package className="h-8 w-8 text-yellow-600" />
              <div>
                <h4 className="font-semibold text-yellow-800">Feed Companies</h4>
                <p className="text-2xl font-bold text-yellow-600">₹{companyAmounts.feedCompanyAmounts.toLocaleString()}</p>
                <p className="text-sm text-yellow-700">Amount given to farmers</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Package className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-semibold text-purple-800">Medicine Companies</h4>
                <p className="text-2xl font-bold text-purple-600">₹{companyAmounts.medicineCompanyAmounts.toLocaleString()}</p>
                <p className="text-sm text-purple-700">Amount given to farmers</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Package className="h-8 w-8 text-orange-600" />
              <div>
                <h4 className="font-semibold text-orange-800">Chick Companies</h4>
                <p className="text-2xl font-bold text-orange-600">₹{companyAmounts.chickCompanyAmounts.toLocaleString()}</p>
                <p className="text-sm text-orange-700">Amount given to farmers</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-green-800">Total Given</h4>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">₹{companyAmounts.totalGivenToFarmers.toLocaleString()}</p>
              <p className="text-sm text-green-700">All companies combined</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-red-800">Pending Recovery</h4>
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600">₹{companyAmounts.pendingRecovery.toLocaleString()}</p>
              <p className="text-sm text-red-700">Amount to recover</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your dealer operations efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => setShowProductModal(true)}
              className="h-20 flex flex-col gap-2"
            >
              <Plus className="w-6 h-6" />
              Add Product
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowPriceModal(true)}
              className="h-20 flex flex-col gap-2"
              disabled={dealerProducts.length === 0}
            >
              <Edit className="w-6 h-6" />
              Update Prices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Products</TabsTrigger>
          <TabsTrigger value="farmers">Farmers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Products Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Products ({dealerProducts.length})</CardTitle>
                  <CardDescription>Manage your product inventory and pricing</CardDescription>
                </div>
                <Button 
                  onClick={() => setShowProductModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dealerProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Products Yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add your first product to start selling to farmers.
                  </p>
                  <Button 
                    onClick={() => setShowProductModal(true)}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Product
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
                            <span className="text-sm text-gray-600">Price:</span>
                            <span className="font-medium">₹{product.pricePerUnit}/{product.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Stock:</span>
                            <span className={`font-medium ${product.currentStock <= product.minStockLevel ? 'text-red-600' : ''}`}>
                              {product.currentStock} {product.unit}
                            </span>
                          </div>
                          {product.supplier && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Supplier:</span>
                              <span className="text-sm">{product.supplier}</span>
                            </div>
                          )}
                          {product.currentStock <= product.minStockLevel && (
                            <Alert className="mt-2">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                Low stock! Only {product.currentStock} {product.unit} remaining.
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
        
        <TabsContent value="farmers" className="space-y-6">
          {/* Farmers Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Connected Farmers</CardTitle>
                  <CardDescription>Farmers connected to your dealership</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleGenerateInviteCode} className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Generate Invite Code
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {connectedFarmers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Connected Farmers</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Generate an invite code to connect with farmers or create demo data
                  </p>
                  <div className="flex justify-center gap-3 mt-4">
                    <Button onClick={handleGenerateInviteCode}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Generate Invite Code
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
      </Tabs>

      {/* Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product information' : 'Add a new product to your inventory'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={productForm.productName}
                onChange={(e) => setProductForm({...productForm, productName: e.target.value})}
                placeholder="e.g., Starter Feed"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={productForm.category} 
                onValueChange={(value) => setProductForm({...productForm, category: value as any})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pricePerUnit">Price *</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  value={productForm.pricePerUnit}
                  onChange={(e) => setProductForm({...productForm, pricePerUnit: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
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
    </div>
  );
};

export default DealerDashboard;