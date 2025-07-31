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
          <h1 className="text-3xl font-bold">Product Catalog Management</h1>
          <p className="text-muted-foreground">
            Manage your product catalog organized by categories and companies
          </p>
        </div>
        <Button onClick={() => setShowAddCategory(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
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
