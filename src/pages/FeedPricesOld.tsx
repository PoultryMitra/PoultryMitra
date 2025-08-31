import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
  Grid3X3
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
    name: currentUser?.displayName || 'Dealer Name',
    phone: '+91 98765 43210',
    email: currentUser?.email || 'dealer@example.com',
    address: 'Shop Address, City, State - 123456',
    businessName: 'Poultry Feed & Supplies'
  });

  // Initialize with sample data
  useEffect(() => {
    if (!currentUser?.uid) return;

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
  }, [currentUser?.uid]);

    const sampleFeeds: FeedProduct[] = [
      {
        id: '4',
        dealerId: currentUser.uid,
        feedType: 'pre-starter',
        supplierCompany: 'ITC Limited',
        pricePerBag: 1250,
        bagWeight: 50,
        stock: 75,
        lastUpdated: new Date(),
        isAvailable: true
      },
      {
        id: '5',
        dealerId: currentUser.uid,
        feedType: 'starter',
        supplierCompany: 'Cargill India',
        pricePerBag: 1180,
        bagWeight: 50,
        stock: 90,
        lastUpdated: new Date(),
        isAvailable: true
      }
    ];

    setFeedProducts(sampleFeeds);
  }, [currentUser?.uid]);

  const handleAddProduct = () => {
    if (!newProduct.supplierCompany || !newProduct.pricePerBag) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const product: FeedProduct = {
      id: Date.now().toString(),
      dealerId: currentUser?.uid || '',
      feedType: newProduct.feedType,
      supplierCompany: newProduct.supplierCompany,
      pricePerBag: newProduct.pricePerBag,
      bagWeight: 50,
      stock: newProduct.stock,
      lastUpdated: new Date(),
      isAvailable: true
    };

    setFeedProducts([...feedProducts, product]);
    setNewProduct({
      feedType: 'pre-starter',
      supplierCompany: '',
      pricePerBag: 0,
      stock: 0
    });
    
    toast({
      title: "Product Added",
      description: "Feed product has been added to your catalog"
    });
  };

  const handleUpdateProduct = (productId: string, updates: Partial<FeedProduct>) => {
    setFeedProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, ...updates, lastUpdated: new Date() }
          : product
      )
    );
    setEditingProduct(null);
    toast({
      title: "Product Updated",
      description: "Feed product has been updated successfully"
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setFeedProducts(prev => prev.filter(product => product.id !== productId));
    toast({
      title: "Product Deleted",
      description: "Feed product has been removed from your catalog"
    });
  };

  const getFeedTypeDisplay = (type: string) => {
    switch(type) {
      case 'pre-starter': return 'Pre-Starter Feed';
      case 'starter': return 'Starter Feed';
      case 'finisher': return 'Finisher Feed';
      default: return type;
    }
  };

  const getFeedTypeColor = (type: string) => {
    switch(type) {
      case 'pre-starter': return 'bg-blue-100 text-blue-800';
      case 'starter': return 'bg-green-100 text-green-800';
      case 'finisher': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedProducts = feedProducts.reduce((acc, product) => {
    if (!acc[product.feedType]) {
      acc[product.feedType] = [];
    }
    acc[product.feedType].push(product);
    return acc;
  }, {} as Record<string, FeedProduct[]>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Poultry Feed Prices</h1>
          <p className="text-muted-foreground">
            Manage your feed catalog and pricing for farmers
          </p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Feed
        </Button>
      </div>

      {/* Dealer Contact Information */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Building2 className="h-5 w-5" />
            Dealer Contact Information
          </CardTitle>
          <p className="text-sm text-blue-700">
            Farmers will see this information to contact you directly
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">{dealerContact.businessName}</p>
                <p className="text-sm text-gray-600">{dealerContact.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Phone className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">{dealerContact.phone}</p>
                <p className="text-sm text-gray-600">Call for orders</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">{dealerContact.email}</p>
                <p className="text-sm text-gray-600">Email inquiries</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <MapPin className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium">Visit Store</p>
                <p className="text-sm text-gray-600">{dealerContact.address}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed Categories */}
      <div className="grid gap-6">
        {(['pre-starter', 'starter', 'finisher'] as const).map((feedType) => (
          <Card key={feedType}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5" />
                  {getFeedTypeDisplay(feedType)}
                  <Badge className={getFeedTypeColor(feedType)}>
                    {groupedProducts[feedType]?.length || 0} suppliers
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  50kg bags available
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groupedProducts[feedType]?.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groupedProducts[feedType].map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{product.supplierCompany}</h4>
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
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Price per bag (50kg):</span>
                          <span className="text-lg font-bold text-green-600">₹{product.pricePerBag}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Stock available:</span>
                          <span className="font-medium">{product.stock} bags</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Per kg rate:</span>
                          <span className="text-sm font-medium">₹{(product.pricePerBag / 50).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge variant={product.isAvailable ? "default" : "secondary"}>
                          {product.isAvailable ? "Available" : "Out of Stock"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Updated: {product.lastUpdated.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No {getFeedTypeDisplay(feedType).toLowerCase()} products added</p>
                  <p className="text-sm">Add products to display pricing to farmers</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Product Modal */}
      {(isEditing || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingProduct ? 'Edit Feed Product' : 'Add New Feed Product'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="feedType">Feed Type</Label>
                <select 
                  id="feedType"
                  className="w-full p-2 border rounded"
                  value={editingProduct?.feedType || newProduct.feedType}
                  onChange={(e) => {
                    if (editingProduct) {
                      setEditingProduct({...editingProduct, feedType: e.target.value as any});
                    } else {
                      setNewProduct({...newProduct, feedType: e.target.value as any});
                    }
                  }}
                >
                  <option value="pre-starter">Pre-Starter Feed</option>
                  <option value="starter">Starter Feed</option>
                  <option value="finisher">Finisher Feed</option>
                </select>
              </div>

              <div>
                <Label htmlFor="supplier">Supplier/Manufacturer</Label>
                <select 
                  id="supplier"
                  className="w-full p-2 border rounded"
                  value={editingProduct?.supplierCompany || newProduct.supplierCompany}
                  onChange={(e) => {
                    if (editingProduct) {
                      setEditingProduct({...editingProduct, supplierCompany: e.target.value});
                    } else {
                      setNewProduct({...newProduct, supplierCompany: e.target.value});
                    }
                  }}
                >
                  <option value="">Select Manufacturer</option>
                  {feedManufacturers.map(manufacturer => (
                    <option key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </option>
                  ))}
                </select>
                {(editingProduct?.supplierCompany === 'Custom Manufacturer' || newProduct.supplierCompany === 'Custom Manufacturer') && (
                  <Input 
                    placeholder="Enter custom manufacturer name"
                    className="mt-2"
                    onChange={(e) => {
                      if (editingProduct) {
                        setEditingProduct({...editingProduct, supplierCompany: e.target.value});
                      } else {
                        setNewProduct({...newProduct, supplierCompany: e.target.value});
                      }
                    }}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="price">Price per Bag (50kg) - ₹</Label>
                <Input 
                  id="price"
                  type="number"
                  placeholder="1200"
                  value={editingProduct?.pricePerBag || newProduct.pricePerBag || ''}
                  onChange={(e) => {
                    const price = parseInt(e.target.value) || 0;
                    if (editingProduct) {
                      setEditingProduct({...editingProduct, pricePerBag: price});
                    } else {
                      setNewProduct({...newProduct, pricePerBag: price});
                    }
                  }}
                />
              </div>

              <div>
                <Label htmlFor="stock">Stock (Number of bags)</Label>
                <Input 
                  id="stock"
                  type="number"
                  placeholder="100"
                  value={editingProduct?.stock || newProduct.stock || ''}
                  onChange={(e) => {
                    const stock = parseInt(e.target.value) || 0;
                    if (editingProduct) {
                      setEditingProduct({...editingProduct, stock});
                    } else {
                      setNewProduct({...newProduct, stock});
                    }
                  }}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => {
                    if (editingProduct) {
                      handleUpdateProduct(editingProduct.id, editingProduct);
                    } else {
                      handleAddProduct();
                    }
                  }}
                  className="flex-1"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingProduct(null);
                  }}
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
