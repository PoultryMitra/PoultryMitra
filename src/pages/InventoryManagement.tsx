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
import { useEnhancedTranslation } from '@/contexts/EnhancedTranslationContext';
import { 
  getDealerProducts,
  addProduct,
  updateProduct,
  type Product
} from '@/services/dealerService';
import { 
  inventoryService,
  type InventoryItem
} from '@/services/inventoryService';
import { 
  Package, 
  Plus,
  Edit2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Archive,
  Minus,
  History,
  Eye,
  BarChart3
} from 'lucide-react';

export default function InventoryManagement() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { language, t } = useEnhancedTranslation();

  // Enhanced translation helper that prioritizes Google Translate
  const bt = (key: string): string => {
    // First try Enhanced Translation Context (Google Translate)
    const dynamicTranslation = t(key);
    if (dynamicTranslation && dynamicTranslation !== key) {
      console.log(`🌍 Google Translate used for InventoryManagement: ${key} -> ${dynamicTranslation}`);
      return dynamicTranslation;
    }

    // Fallback to local content
    const localContent = content[key as keyof typeof content];
    if (localContent && typeof localContent === 'object') {
      const translatedValue = localContent[language as keyof typeof localContent];
      if (translatedValue) {
        console.log(`📚 Static content used for InventoryManagement: ${key} -> ${translatedValue}`);
        return translatedValue as string;
      }
    }
    
    const result = key;
    console.log(`⚠️ No translation found for InventoryManagement: ${key}`);
    return result;
  };

  // Content object for translations
  const content = {
    // Page headers
    inventoryManagement: { en: "Inventory Management", hi: "इन्वेंट्री प्रबंधन" },
    manageYourStock: { en: "Manage your product stock and inventory", hi: "अपने उत्पाद स्टॉक और इन्वेंट्री का प्रबंधन करें" },
    
    // Tabs
    products: { en: "Products", hi: "उत्पाद" },
    inventory: { en: "Inventory", hi: "इन्वेंट्री" },
    
    // Actions
    addProduct: { en: "Add Product", hi: "उत्पाद जोड़ें" },
    addInventoryItem: { en: "Add Inventory Item", hi: "इन्वेंट्री आइटम जोड़ें" },
    
    // Search and filters
    searchProducts: { en: "Search products...", hi: "उत्पाद खोजें..." },
    allCategories: { en: "All Categories", hi: "सभी श्रेणियां" },
    allStock: { en: "All Stock", hi: "सभी स्टॉक" },
    lowStock: { en: "Low Stock", hi: "कम स्टॉक" },
    outOfStock: { en: "Out of Stock", hi: "स्टॉक समाप्त" },
    
    // Product details
    price: { en: "Price", hi: "मूल्य" },
    stock: { en: "Stock", hi: "स्टॉक" },
    minLevel: { en: "Min Level", hi: "न्यूनतम स्तर" },
    
    // Empty states
    noProductsFound: { en: "No products found", hi: "कोई उत्पाद नहीं मिला" },
    addFirstProduct: { en: "Add your first product to get started", hi: "आरंभ करने के लिए अपना पहला उत्पाद जोड़ें" }
  };

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Product | InventoryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [productForm, setProductForm] = useState({
    productName: '',
    category: 'Feed' as 'Feed' | 'Medicine' | 'Chicks' | 'Equipment' | 'Other',
    currentStock: '',
    minStockLevel: '',
    unit: 'bags',
    pricePerUnit: '',
    supplier: ''
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
    reason: '',
    notes: ''
  });

  // Load data
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeProducts = getDealerProducts(currentUser.uid, (products) => {
      setProducts(products);
    });

    const unsubscribeInventory = inventoryService.getDealerInventory(currentUser.uid, (inventory) => {
      setInventoryItems(inventory);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeInventory();
    };
  }, [currentUser]);

  // Filter functions
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || 
      (stockFilter === 'low' && product.currentStock <= product.minStockLevel) ||
      (stockFilter === 'out' && product.currentStock === 0) ||
      (stockFilter === 'available' && product.currentStock > product.minStockLevel);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const filteredInventory = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || 
      (stockFilter === 'low' && item.currentStock <= item.minStockLevel) ||
      (stockFilter === 'out' && item.currentStock === 0) ||
      (stockFilter === 'available' && item.currentStock > item.minStockLevel);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Handle product operations
  const handleAddProduct = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      await addProduct(currentUser.uid, {
        ...productForm,
        currentStock: parseInt(productForm.currentStock),
        minStockLevel: parseInt(productForm.minStockLevel),
        pricePerUnit: parseFloat(productForm.pricePerUnit)
      });
      
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      
      setShowProductModal(false);
      resetProductForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!currentUser || !selectedItem) return;
    
    try {
      setLoading(true);
      await updateProduct(selectedItem.id, {
        ...productForm,
        currentStock: parseInt(productForm.currentStock),
        minStockLevel: parseInt(productForm.minStockLevel),
        pricePerUnit: parseFloat(productForm.pricePerUnit)
      });
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      
      setShowProductModal(false);
      setIsEditing(false);
      resetProductForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle inventory operations
  const handleAddInventoryItem = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      await inventoryService.addInventoryItem(currentUser.uid, {
        ...inventoryForm,
        currentStock: parseInt(inventoryForm.currentStock),
        minStockLevel: parseInt(inventoryForm.minStockLevel),
        costPrice: parseFloat(inventoryForm.costPrice),
        sellingPrice: parseFloat(inventoryForm.sellingPrice)
      });
      
      toast({
        title: "Success",
        description: "Inventory item added successfully",
      });
      
      setShowInventoryModal(false);
      resetInventoryForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle stock adjustment
  const handleStockAdjustment = async () => {
    if (!currentUser || !selectedItem) return;
    
    try {
      setLoading(true);
      const quantity = parseInt(stockForm.quantity);
      const adjustmentQuantity = stockForm.type === 'add' ? quantity : -quantity;
      
      await inventoryService.updateStock(
        selectedItem.id,
        currentUser.uid,
        adjustmentQuantity,
        stockForm.reason || `Stock ${stockForm.type}`,
        stockForm.type
      );
      
      toast({
        title: "Success",
        description: `Stock ${stockForm.type === 'add' ? 'added' : 'removed'} successfully`,
      });
      
      setShowStockModal(false);
      resetStockForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form functions
  const resetProductForm = () => {
    setProductForm({
      productName: '',
      category: 'Feed',
      currentStock: '',
      minStockLevel: '',
      unit: 'bags',
      pricePerUnit: '',
      supplier: ''
    });
  };

  const resetInventoryForm = () => {
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
  };

  const resetStockForm = () => {
    setStockForm({
      quantity: '',
      type: 'add',
      reason: '',
      notes: ''
    });
  };

  // Get stock status color
  const getStockStatusColor = (currentStock: number, minStock: number) => {
    if (currentStock === 0) return 'text-red-600';
    if (currentStock <= minStock) return 'text-orange-600';
    return 'text-green-600';
  };

  const getStockStatusBadge = (currentStock: number, minStock: number) => {
    if (currentStock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (currentStock <= minStock) return <Badge variant="secondary">Low Stock</Badge>;
    return <Badge variant="outline">In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{bt('inventoryManagement')}</h1>
          <p className="mt-2 text-gray-600">{bt('manageYourStock')}</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">{bt('searchProducts')}</Label>
              <Input
                id="search"
                placeholder={bt('searchProducts')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="category">{bt('category')}</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={bt('allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Feed">Feed</SelectItem>
                  <SelectItem value="Medicine">Medicine</SelectItem>
                  <SelectItem value="Chicks">Chicks</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stock-filter">Stock Status</Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="inventory">Inventory ({inventoryItems.length})</TabsTrigger>
        </TabsList>
        
        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Product Catalog</h2>
            <Button 
              onClick={() => {
                setIsEditing(false);
                resetProductForm();
                setShowProductModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Add your first product to get started</p>
                <Button 
                  onClick={() => {
                    setIsEditing(false);
                    resetProductForm();
                    setShowProductModal(true);
                  }}
                >
                  Add Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{product.productName}</h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          {product.category}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(product);
                            setProductForm({
                              productName: product.productName,
                              category: product.category as 'Feed' | 'Medicine' | 'Chicks' | 'Equipment' | 'Other',
                              currentStock: product.currentStock.toString(),
                              minStockLevel: product.minStockLevel.toString(),
                              unit: product.unit,
                              pricePerUnit: product.pricePerUnit.toString(),
                              supplier: product.supplier || ''
                            });
                            setIsEditing(true);
                            setShowProductModal(true);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(product);
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
                            setSelectedItem(product);
                            setStockForm({ ...stockForm, type: 'remove' });
                            setShowStockModal(true);
                          }}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Stock:</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getStockStatusColor(product.currentStock, product.minStockLevel)}`}>
                            {product.currentStock} {product.unit}
                          </span>
                          {getStockStatusBadge(product.currentStock, product.minStockLevel)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">₹{product.pricePerUnit}/{product.unit}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Level:</span>
                        <span>{product.minStockLevel} {product.unit}</span>
                      </div>
                      
                      {product.supplier && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supplier:</span>
                          <span className="text-xs truncate max-w-[120px]">{product.supplier}</span>
                        </div>
                      )}
                      
                      {product.currentStock <= product.minStockLevel && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {product.currentStock === 0 ? 'Out of stock!' : 'Low stock warning!'}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Inventory Items</h2>
            <Button 
              onClick={() => {
                resetInventoryForm();
                setShowInventoryModal(true);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Inventory Item
            </Button>
          </div>

          {filteredInventory.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
                <p className="text-gray-600 mb-4">Add your first inventory item to get started</p>
                <Button 
                  onClick={() => {
                    resetInventoryForm();
                    setShowInventoryModal(true);
                  }}
                >
                  Add Inventory Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInventory.map((item) => (
                <Card key={item.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(item);
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
                            setSelectedItem(item);
                            setStockForm({ ...stockForm, type: 'remove' });
                            setShowStockModal(true);
                          }}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Stock:</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getStockStatusColor(item.currentStock, item.minStockLevel)}`}>
                            {item.currentStock} {item.unit}
                          </span>
                          {getStockStatusBadge(item.currentStock, item.minStockLevel)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost Price:</span>
                        <span>₹{item.costPrice}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Selling Price:</span>
                        <span className="font-medium">₹{item.sellingPrice}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Value:</span>
                        <span className="font-medium">₹{(item.currentStock * item.costPrice).toLocaleString()}</span>
                      </div>
                      
                      {item.supplier && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supplier:</span>
                          <span className="text-xs truncate max-w-[120px]">{item.supplier}</span>
                        </div>
                      )}
                      
                      {item.currentStock <= item.minStockLevel && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {item.currentStock === 0 ? 'Out of stock!' : 'Low stock warning!'}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update product information' : 'Add a new product to your catalog'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={productForm.productName}
                onChange={(e) => setProductForm({...productForm, productName: e.target.value})}
                placeholder="Enter product name"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={productForm.category} onValueChange={(value: any) => setProductForm({...productForm, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Feed">Feed</SelectItem>
                  <SelectItem value="Medicine">Medicine</SelectItem>
                  <SelectItem value="Chicks">Chicks</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={productForm.unit} onValueChange={(value) => setProductForm({...productForm, unit: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pricePerUnit">Price per Unit</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  step="0.01"
                  value={productForm.pricePerUnit}
                  onChange={(e) => setProductForm({...productForm, pricePerUnit: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="supplier">Supplier (Optional)</Label>
              <Input
                id="supplier"
                value={productForm.supplier}
                onChange={(e) => setProductForm({...productForm, supplier: e.target.value})}
                placeholder="Enter supplier name"
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowProductModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={isEditing ? handleUpdateProduct : handleAddProduct}
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update' : 'Add')} Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Inventory Item Modal */}
      <Dialog open={showInventoryModal} onOpenChange={setShowInventoryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Add a new item to your inventory management system</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={inventoryForm.name}
                onChange={(e) => setInventoryForm({...inventoryForm, name: e.target.value})}
                placeholder="Enter item name"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={inventoryForm.category} onValueChange={(value: any) => setInventoryForm({...inventoryForm, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Feed">Feed</SelectItem>
                  <SelectItem value="Medicine">Medicine</SelectItem>
                  <SelectItem value="Chicks">Chicks</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={inventoryForm.currentStock}
                  onChange={(e) => setInventoryForm({...inventoryForm, currentStock: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={inventoryForm.unit} onValueChange={(value) => setInventoryForm({...inventoryForm, unit: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={inventoryForm.costPrice}
                  onChange={(e) => setInventoryForm({...inventoryForm, costPrice: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={inventoryForm.sellingPrice}
                  onChange={(e) => setInventoryForm({...inventoryForm, sellingPrice: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
              <Input
                id="minStockLevel"
                type="number"
                value={inventoryForm.minStockLevel}
                onChange={(e) => setInventoryForm({...inventoryForm, minStockLevel: e.target.value})}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label htmlFor="supplier">Supplier (Optional)</Label>
              <Input
                id="supplier"
                value={inventoryForm.supplier}
                onChange={(e) => setInventoryForm({...inventoryForm, supplier: e.target.value})}
                placeholder="Enter supplier name"
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowInventoryModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddInventoryItem} disabled={loading}>
              {loading ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Modal */}
      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {stockForm.type === 'add' ? 'Add Stock' : 'Remove Stock'}
            </DialogTitle>
            <DialogDescription>
              {stockForm.type === 'add' ? 'Increase' : 'Decrease'} stock for {
                selectedItem && 'productName' in selectedItem 
                  ? selectedItem.productName 
                  : selectedItem && 'name' in selectedItem
                  ? selectedItem.name
                  : 'Unknown Item'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={stockForm.quantity}
                onChange={(e) => setStockForm({...stockForm, quantity: e.target.value})}
                placeholder="Enter quantity"
              />
            </div>
            
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Select value={stockForm.reason} onValueChange={(value) => setStockForm({...stockForm, reason: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {stockForm.type === 'add' ? (
                    <>
                      <SelectItem value="purchase">New Purchase</SelectItem>
                      <SelectItem value="return">Customer Return</SelectItem>
                      <SelectItem value="correction">Stock Correction</SelectItem>
                      <SelectItem value="transfer">Transfer In</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="damage">Damaged</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="given_to_farmer">Given to Farmer</SelectItem>
                      <SelectItem value="transfer">Transfer Out</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={stockForm.notes}
                onChange={(e) => setStockForm({...stockForm, notes: e.target.value})}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowStockModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockAdjustment} disabled={loading}>
              {loading ? 'Processing...' : (stockForm.type === 'add' ? 'Add Stock' : 'Remove Stock')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
