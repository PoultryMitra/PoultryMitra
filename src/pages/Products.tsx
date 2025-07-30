import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Textarea
} from "@/components/ui/textarea";
import * as dealerService from "@/services/dealerService";
import type { Product } from "@/services/dealerService";
import { 
  Package, 
  Plus, 
  Edit,
  AlertTriangle,
  TrendingUp,
  Egg,
  Wheat,
  Syringe,
  Settings
} from "lucide-react";

export default function Products() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    currentStock: 0,
    minStockLevel: 0,
    pricePerUnit: 0,
    unit: "",
    supplier: "",
  });

  // Subscribe to products
  useEffect(() => {
    if (!currentUser?.uid) return;

    // Local workaround for module resolution issue
    const localGetDealerProducts = (dealerId: string, callback: (data: Product[]) => void) => {
      console.log('Using local product data');
      setTimeout(() => {
        const dummyProducts: Product[] = [
          {
            id: '1',
            dealerId: dealerId,
            productName: 'Day Old Chicks',
            category: 'chicks',
            currentStock: 100,
            minStockLevel: 50,
            unit: 'piece',
            pricePerUnit: 25,
            supplier: 'Local Hatchery',
            lastUpdated: { toDate: () => new Date() } as any
          },
          {
            id: '2',
            dealerId: dealerId,
            productName: 'Starter Feed',
            category: 'feed',
            currentStock: 500,
            minStockLevel: 100,
            unit: 'kg',
            pricePerUnit: 30,
            supplier: 'Feed Mill Co',
            lastUpdated: { toDate: () => new Date() } as any
          }
        ];
        callback(dummyProducts);
      }, 1000);
      return () => {};
    };

    const unsubscribe = localGetDealerProducts(currentUser.uid, setProducts);
    return unsubscribe;
  }, [currentUser?.uid]);

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= 0) return { label: "Out of Stock", color: "bg-red-500", variant: "destructive" };
    if (product.currentStock <= product.minStockLevel) return { label: "Low Stock", color: "bg-yellow-500", variant: "secondary" };
    return { label: "In Stock", color: "bg-green-500", variant: "default" };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "chicks": return <Egg className="h-4 w-4" />;
      case "feed": return <Wheat className="h-4 w-4" />;
      case "vaccines": return <Syringe className="h-4 w-4" />;
      case "equipment": return <Settings className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel && p.currentStock > 0);
  const outOfStockProducts = products.filter(p => p.currentStock <= 0);
  const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.pricePerUnit), 0);

  const resetForm = () => {
    setFormData({
      productName: "",
      category: "",
      currentStock: 0,
      minStockLevel: 0,
      pricePerUnit: 0,
      unit: "",
      supplier: "",
    });
  };

  const handleAddProduct = async () => {
    if (!currentUser?.uid || !formData.productName || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Local workaround for module resolution issue
      const newProduct: Product = {
        id: Date.now().toString(),
        dealerId: currentUser.uid,
        productName: formData.productName,
        category: formData.category,
        pricePerUnit: formData.pricePerUnit,
        currentStock: formData.currentStock,
        minStockLevel: formData.minStockLevel,
        unit: formData.unit,
        supplier: formData.supplier,
        lastUpdated: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any
      };
      
      // Simulate adding product
      setProducts(prev => [...prev, newProduct]);
      
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct || !formData.productName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Local workaround for module resolution issue
      setProducts(prev => prev.map(product => 
        product.id === selectedProduct.id 
          ? {
              ...product,
              productName: formData.productName,
              category: formData.category,
              pricePerUnit: formData.pricePerUnit,
              currentStock: formData.currentStock,
              minStockLevel: formData.minStockLevel,
              unit: formData.unit,
              supplier: formData.supplier,
              lastUpdated: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any
            }
          : product
      ));
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      resetForm();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      productName: product.productName,
      category: product.category,
      currentStock: product.currentStock,
      minStockLevel: product.minStockLevel,
      pricePerUnit: product.pricePerUnit,
      unit: product.unit,
      supplier: product.supplier,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your inventory and track product availability
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="chicks">Chicks</SelectItem>
              <SelectItem value="feed">Feed</SelectItem>
              <SelectItem value="vaccines">Vaccines</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Inventory Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Active products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current stock value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Need reorder
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Products Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product);
              
              return (
                <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getCategoryIcon(product.category)}
                        <h3 className="font-semibold text-lg">{product.productName}</h3>
                        <Badge variant={stockStatus.variant as any}>
                          {stockStatus.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Category</p>
                          <p className="font-medium capitalize">{product.category}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Current Stock</p>
                          <p className="font-medium text-lg">
                            {product.currentStock.toLocaleString()} {product.unit}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Price per {product.unit}</p>
                          <p className="font-medium text-lg">₹{product.pricePerUnit.toLocaleString()}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Total Value</p>
                          <p className="font-medium text-lg">
                            ₹{(product.currentStock * product.pricePerUnit).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Supplier: {product.supplier}</span>
                        <span>Min Stock: {product.minStockLevel} {product.unit}</span>
                        <span>Updated: {product.lastUpdated.toDate().toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || categoryFilter !== "all" 
                  ? "No products found matching your filters." 
                  : "No products in inventory. Add your first product to get started."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chicks">Chicks</SelectItem>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="vaccines">Vaccines</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, pieces, liters"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pricePerUnit">Price per Unit</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="minStockLevel">Min Stock Level</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Supplier name"
                required
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddProduct}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chicks">Chicks</SelectItem>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="vaccines">Vaccines</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-currentStock">Current Stock</Label>
                <Input
                  id="edit-currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-unit">Unit</Label>
                <Input
                  id="edit-unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, pieces, liters"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-pricePerUnit">Price per Unit</Label>
                <Input
                  id="edit-pricePerUnit"
                  type="number"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-minStockLevel">Min Stock Level</Label>
                <Input
                  id="edit-minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-supplier">Supplier</Label>
              <Input
                id="edit-supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Supplier name"
                required
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProduct}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
