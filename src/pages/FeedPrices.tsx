import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getDealerProfile, type DealerProfile } from "@/services/dealerService";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Package, 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Building2,
  ChevronDown,
  ChevronRight,
  Factory,
  Grid3X3,
  Globe
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Company {
  id: string;
  name: string;
  categoryId: string;
}

interface Product {
  id: string;
  name: string;
  categoryId: string;
  companyId: string;
  pricePerBag: number;
  bagWeight: number;
  stock: number;
  isAvailable: boolean;
  lastUpdated: Date;
}

interface DealerContact {
  name: string;
  phone: string;
  email: string;
  address: string;
  businessName: string;
}

function FeedPrices() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [language, setLanguage] = useState("hi");
  
  const content = {
    hi: {
      title: "फीड की कीमतें",
      subtitle: "अपने डीलर से फीड की वर्तमान कीमतें देखें",
      contactInformation: "संपर्क जानकारी",
      businessName: "व्यापारिक नाम",
      ownerName: "मालिक का नाम",
      email: "ईमेल",
      phone: "फोन",
      address: "पता",
      feedCatalog: "फीड कैटालॉग",
      categories: "श्रेणियां",
      companies: "कंपनियां",
      products: "उत्पाद",
      pricePerBag: "प्रति बोरी कीमत",
      bagWeight: "बोरी का वजन",
      stock: "स्टॉक",
      available: "उपलब्ध",
      outOfStock: "स्टॉक खत्म",
      kg: "किग्रा",
      bags: "बोरे",
      loading: "लोड हो रहा है...",
      noDataAvailable: "कोई डेटा उपलब्ध नहीं",
      contactDealer: "डीलर से संपर्क करें",
      callNow: "अभी कॉल करें",
      sendEmail: "ईमेल भेजें",
      viewLocation: "स्थान देखें",
      noCategoriesFound: "कोई श्रेणी नहीं मिली",
      noCompaniesFound: "कोई कंपनी नहीं मिली",
      noProductsFound: "कोई उत्पाद नहीं मिले",
      dealerProfile: "डीलर प्रोफाइल",
      businessDetails: "व्यापारिक विवरण"
    },
    en: {
      title: "Feed Prices",
      subtitle: "View current feed prices from your dealer",
      contactInformation: "Contact Information",
      businessName: "Business Name",
      ownerName: "Owner Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      feedCatalog: "Feed Catalog",
      categories: "Categories",
      companies: "Companies",
      products: "Products",
      pricePerBag: "Price per Bag",
      bagWeight: "Bag Weight",
      stock: "Stock",
      available: "Available",
      outOfStock: "Out of Stock",
      kg: "kg",
      bags: "bags",
      loading: "Loading...",
      noDataAvailable: "No data available",
      contactDealer: "Contact Dealer",
      callNow: "Call Now",
      sendEmail: "Send Email",
      viewLocation: "View Location",
      noCategoriesFound: "No categories found",
      noCompaniesFound: "No companies found",
      noProductsFound: "No products found",
      dealerProfile: "Dealer Profile",
      businessDetails: "Business Details"
    }
  };

  const t = content[language];
  
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  
  // Modal states
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState<string | null>(null); // categoryId
  const [showAddProduct, setShowAddProduct] = useState<{categoryId: string, companyId: string} | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form states
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newCompany, setNewCompany] = useState({ name: '' });
  const [newProduct, setNewProduct] = useState({
    name: '',
    pricePerBag: 0,
    stock: 0,
    bagWeight: 50
  });

  const [dealerContact, setDealerContact] = useState<DealerContact>({
    name: 'Loading...',
    phone: 'Loading...',
    email: 'Loading...',
    address: 'Loading...',
    businessName: 'Loading...'
  });
  
  const [dealerProfile, setDealerProfile] = useState<DealerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Load dealer profile from Firebase
  const loadDealerProfile = async () => {
    if (!currentUser?.uid) return;
    
    setLoadingProfile(true);
    try {
      console.log('Loading dealer profile for:', currentUser.uid);
      const profile = await getDealerProfile(currentUser.uid);
      
      if (profile) {
        console.log('Dealer profile loaded:', profile);
        setDealerProfile(profile);
        setDealerContact({
          name: profile.ownerName || currentUser.displayName || 'Dealer Name',
          phone: profile.phone || 'Phone not set',
          email: profile.email || currentUser.email || 'Email not set',
          address: profile.address || 'Address not set',
          businessName: profile.businessName || 'Business name not set'
        });
      } else {
        console.log('No dealer profile found, using default values');
        // Fallback to user info if no dealer profile exists
        setDealerContact({
          name: currentUser.displayName || 'Dealer Name',
          phone: 'Phone not set - Please update profile',
          email: currentUser.email || 'Email not set',
          address: 'Address not set - Please update profile',
          businessName: 'Business name not set - Please update profile'
        });
      }
    } catch (error) {
      console.error('Error loading dealer profile:', error);
      toast({
        title: "Error",
        description: "Failed to load dealer profile information.",
        variant: "destructive",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  // Initialize with sample data
  useEffect(() => {
    if (!currentUser?.uid) return;

    // Load dealer profile first
    loadDealerProfile();

    // Sample categories
    const sampleCategories: Category[] = [
      {
        id: 'feed',
        name: 'Feed',
        description: 'Poultry feed products'
      },
      {
        id: 'medicine',
        name: 'Medicine',
        description: 'Veterinary medicines and supplements'
      },
      {
        id: 'equipment',
        name: 'Equipment',
        description: 'Poultry farming equipment'
      }
    ];

    // Sample companies
    const sampleCompanies: Company[] = [
      { id: 'noveltech', name: 'Noveltech', categoryId: 'feed' },
      { id: 'godrej', name: 'Godrej Agrovet', categoryId: 'feed' },
      { id: 'venkys', name: 'Venky\'s India', categoryId: 'feed' },
      { id: 'suguna', name: 'Suguna Foods', categoryId: 'feed' },
      { id: 'vetoquinol', name: 'Vetoquinol India', categoryId: 'medicine' },
      { id: 'hester', name: 'Hester Biosciences', categoryId: 'medicine' }
    ];

    // Sample products
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Pre Starter',
        categoryId: 'feed',
        companyId: 'noveltech',
        pricePerBag: 1250,
        bagWeight: 50,
        stock: 100,
        isAvailable: true,
        lastUpdated: new Date()
      },
      {
        id: '2',
        name: 'Starter',
        categoryId: 'feed',
        companyId: 'noveltech',
        pricePerBag: 1200,
        bagWeight: 50,
        stock: 85,
        isAvailable: true,
        lastUpdated: new Date()
      },
      {
        id: '3',
        name: 'Finisher',
        categoryId: 'feed',
        companyId: 'noveltech',
        pricePerBag: 1150,
        bagWeight: 50,
        stock: 120,
        isAvailable: true,
        lastUpdated: new Date()
      },
      {
        id: '4',
        name: 'Pre Starter',
        categoryId: 'feed',
        companyId: 'godrej',
        pricePerBag: 1200,
        bagWeight: 50,
        stock: 150,
        isAvailable: true,
        lastUpdated: new Date()
      },
      {
        id: '5',
        name: 'Starter',
        categoryId: 'feed',
        companyId: 'venkys',
        pricePerBag: 1150,
        bagWeight: 50,
        stock: 90,
        isAvailable: true,
        lastUpdated: new Date()
      }
    ];

    setCategories(sampleCategories);
    setCompanies(sampleCompanies);
    setProducts(sampleProducts);
    
    // Expand feed category by default
    setExpandedCategories(new Set(['feed']));
    setExpandedCompanies(new Set(['noveltech']));
  }, [currentUser?.uid]);

  // Helper functions
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleCompany = (companyId: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  const getCompaniesByCategory = (categoryId: string) => {
    return companies.filter(company => company.categoryId === categoryId);
  };

  const getProductsByCompany = (companyId: string) => {
    return products.filter(product => product.companyId === companyId);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || '';
  };

  const getCompanyName = (companyId: string) => {
    return companies.find(comp => comp.id === companyId)?.name || '';
  };

  // CRUD operations
  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      description: newCategory.description
    };

    setCategories([...categories, category]);
    setNewCategory({ name: '', description: '' });
    setShowAddCategory(false);
    
    toast({
      title: "Category Added",
      description: `${category.name} category has been created`
    });
  };

  const handleAddCompany = (categoryId: string) => {
    if (!newCompany.name.trim()) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive"
      });
      return;
    }

    const company: Company = {
      id: Date.now().toString(),
      name: newCompany.name,
      categoryId: categoryId
    };

    setCompanies([...companies, company]);
    setNewCompany({ name: '' });
    setShowAddCompany(null);
    
    toast({
      title: "Company Added",
      description: `${company.name} has been added`
    });
  };

  const handleAddProduct = (categoryId: string, companyId: string) => {
    if (!newProduct.name.trim() || !newProduct.pricePerBag) {
      toast({
        title: "Error",
        description: "Product name and price are required",
        variant: "destructive"
      });
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      categoryId: categoryId,
      companyId: companyId,
      pricePerBag: newProduct.pricePerBag,
      bagWeight: newProduct.bagWeight,
      stock: newProduct.stock,
      isAvailable: true,
      lastUpdated: new Date()
    };

    setProducts([...products, product]);
    setNewProduct({ name: '', pricePerBag: 0, stock: 0, bagWeight: 50 });
    setShowAddProduct(null);
    
    toast({
      title: "Product Added",
      description: `${product.name} has been added`
    });
  };

  const handleUpdateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, ...updates, lastUpdated: new Date() }
          : product
      )
    );
    setEditingProduct(null);
    toast({
      title: "Product Updated",
      description: "Product has been updated successfully"
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
    toast({
      title: "Product Deleted",
      description: "Product has been removed"
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            {language === 'hi' ? 'EN' : 'हिं'}
          </Button>
        </div>
      </div>

      {/* Dealer Contact Information */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Building2 className="h-5 w-5" />
            {t.contactInformation}
            {loadingProfile && (
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            )}
          </CardTitle>
          <p className="text-sm text-blue-700">
            {t.subtitle}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className={`font-medium ${loadingProfile ? 'animate-pulse bg-gray-200 h-4 rounded' : ''}`}>
                  {loadingProfile ? '' : dealerContact.businessName}
                </p>
                <p className={`text-sm text-gray-600 ${loadingProfile ? 'animate-pulse bg-gray-200 h-3 rounded mt-1' : ''}`}>
                  {loadingProfile ? '' : dealerContact.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Phone className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className={`font-medium ${loadingProfile ? 'animate-pulse bg-gray-200 h-4 rounded' : ''}`}>
                  {loadingProfile ? '' : dealerContact.phone}
                </p>
                <p className="text-sm text-gray-600">{t.callNow}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Mail className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className={`font-medium text-sm ${loadingProfile ? 'animate-pulse bg-gray-200 h-4 rounded' : ''}`}>
                  {loadingProfile ? '' : dealerContact.email}
                </p>
                <p className="text-sm text-gray-600">{t.sendEmail}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <MapPin className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">{t.viewLocation}</p>
                <p className={`text-xs text-gray-600 ${loadingProfile ? 'animate-pulse bg-gray-200 h-3 rounded' : ''}`}>
                  {loadingProfile ? '' : dealerContact.address}
                </p>
              </div>
            </div>
          </div>
          
          {!loadingProfile && dealerProfile && (
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <p className="text-sm text-gray-600">
                <strong>Last Updated:</strong> {dealerProfile.lastUpdated ? 
                  new Date(dealerProfile.lastUpdated.toDate()).toLocaleString() : 
                  'Never'
                }
              </p>
            </div>
          )}
          
          {!loadingProfile && !dealerProfile && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Complete your dealer profile to show accurate contact information to farmers.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Catalog */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Product Catalog
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Organized by Category → Company → Product
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg">
              {/* Category Header */}
              <div 
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedCategories.has(category.id) ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {getCompaniesByCategory(category.id).length} companies
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddCompany(category.id);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Company
                  </Button>
                </div>
              </div>

              {/* Companies in Category */}
              {expandedCategories.has(category.id) && (
                <div className="p-4 space-y-3">
                  {getCompaniesByCategory(category.id).map((company) => (
                    <div key={company.id} className="border rounded-lg bg-white">
                      {/* Company Header */}
                      <div 
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleCompany(company.id)}
                      >
                        <div className="flex items-center gap-3">
                          {expandedCompanies.has(company.id) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                          <Factory className="h-4 w-4 text-green-600" />
                          <h4 className="font-medium">{company.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {getProductsByCompany(company.id).length} products
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddProduct({categoryId: category.id, companyId: company.id});
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Product
                          </Button>
                        </div>
                      </div>

                      {/* Products in Company */}
                      {expandedCompanies.has(company.id) && (
                        <div className="px-3 pb-3">
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {getProductsByCompany(company.id).map((product) => (
                              <div key={product.id} className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium">{product.name}</h5>
                                  <div className="flex gap-1">
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => setEditingProduct(product)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => handleDeleteProduct(product.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Price per bag ({product.bagWeight}kg):</span>
                                    <span className="font-semibold text-green-600">₹{product.pricePerBag}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Per kg rate:</span>
                                    <span>₹{(product.pricePerBag / product.bagWeight).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Stock:</span>
                                    <span>{product.stock} bags</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Status:</span>
                                    <Badge variant={product.isAvailable ? "default" : "secondary"}>
                                      {product.isAvailable ? "Available" : "Out of Stock"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {getCompaniesByCategory(category.id).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Factory className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No companies added yet</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => setShowAddCompany(category.id)}
                      >
                        Add First Company
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {categories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No categories created yet</p>
              <Button onClick={() => setShowAddCategory(true)}>
                Create First Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Category Name</Label>
                <Input 
                  id="categoryName"
                  placeholder="e.g., Feed, Medicine, Equipment"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="categoryDescription">Description</Label>
                <Input 
                  id="categoryDescription"
                  placeholder="Brief description of this category"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddCategory} className="flex-1">
                  Add Category
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Company</CardTitle>
              <p className="text-sm text-muted-foreground">
                Adding to: {getCategoryName(showAddCompany)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName"
                  placeholder="e.g., Noveltech, Godrej Agrovet"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handleAddCompany(showAddCompany)} 
                  className="flex-1"
                >
                  Add Company
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowAddCompany(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <p className="text-sm text-muted-foreground">
                Adding to: {getCategoryName(showAddProduct.categoryId)} → {getCompanyName(showAddProduct.companyId)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input 
                  id="productName"
                  placeholder="e.g., Pre Starter, Starter, Finisher"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="price">Price per Bag - ₹</Label>
                <Input 
                  id="price"
                  type="number"
                  placeholder="1200"
                  value={newProduct.pricePerBag || ''}
                  onChange={(e) => setNewProduct({...newProduct, pricePerBag: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="bagWeight">Bag Weight (kg)</Label>
                <Input 
                  id="bagWeight"
                  type="number"
                  placeholder="50"
                  value={newProduct.bagWeight}
                  onChange={(e) => setNewProduct({...newProduct, bagWeight: parseInt(e.target.value) || 50})}
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock (Number of bags)</Label>
                <Input 
                  id="stock"
                  type="number"
                  placeholder="100"
                  value={newProduct.stock || ''}
                  onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handleAddProduct(showAddProduct.categoryId, showAddProduct.companyId)}
                  className="flex-1"
                >
                  Add Product
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowAddProduct(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="editProductName">Product Name</Label>
                <Input 
                  id="editProductName"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editPrice">Price per Bag - ₹</Label>
                <Input 
                  id="editPrice"
                  type="number"
                  value={editingProduct.pricePerBag}
                  onChange={(e) => setEditingProduct({...editingProduct, pricePerBag: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="editBagWeight">Bag Weight (kg)</Label>
                <Input 
                  id="editBagWeight"
                  type="number"
                  value={editingProduct.bagWeight}
                  onChange={(e) => setEditingProduct({...editingProduct, bagWeight: parseInt(e.target.value) || 50})}
                />
              </div>
              <div>
                <Label htmlFor="editStock">Stock (Number of bags)</Label>
                <Input 
                  id="editStock"
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handleUpdateProduct(editingProduct.id, editingProduct)}
                  className="flex-1"
                >
                  Update Product
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default FeedPrices;
