import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as dealerService from "@/services/dealerService";
import type { Product, RateUpdate } from "@/services/dealerService";
import { getFarmerDealers } from "@/services/connectionService";
import { RefreshCw, Edit, Plus, DollarSign } from "lucide-react";

export default function Rates() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [rateUpdates, setRateUpdates] = useState<RateUpdate[]>([]);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("products");
  const [userRole, setUserRole] = useState<'dealer' | 'farmer' | null>(null);

  // Form state for rate updates
  const [rateForm, setRateForm] = useState({
    productName: "",
    category: "",
    newRate: 0,
    unit: "",
    effectiveDate: "",
    notes: "",
  });

  // Determine user role and load appropriate data
  useEffect(() => {
    if (!currentUser?.uid) return;

    let cleanup: (() => void) | null = null;

    // Check if user is connected as a farmer or is a dealer
    const checkUserRole = async () => {
      try {
        // Try to get farmer dealers first
        const unsubscribeFarmerCheck = getFarmerDealers(currentUser.uid, (dealers) => {
          if (dealers.length > 0) {
            console.log('User is a farmer with connected dealers:', dealers.length);
            setUserRole('farmer');
            
            // Subscribe to products from connected dealers
            if (cleanup) cleanup();
            cleanup = dealerService.subscribeToConnectedDealerProducts(currentUser.uid, (dealerProducts) => {
              console.log('Received products from connected dealers:', dealerProducts.length);
              setProducts(dealerProducts);
            });
          } else {
            console.log('User is likely a dealer - checking for dealer products');
            setUserRole('dealer');
            
            // Subscribe to dealer's own products
            if (cleanup) cleanup();
            cleanup = dealerService.getDealerProducts(currentUser.uid, (dealerProducts) => {
              console.log('Received dealer products:', dealerProducts.length);
              setProducts(dealerProducts);
            });
          }
        });
        
        return unsubscribeFarmerCheck;
      } catch (error) {
        console.error('Error checking user role:', error);
        return () => {};
      }
    };

    const unsubscribeUserRole = checkUserRole();
    
    return () => {
      if (cleanup) cleanup();
      unsubscribeUserRole.then(fn => fn && fn());
    };
  }, [currentUser?.uid]);

  const groupedProducts = products.reduce((groups, product) => {
    const category = product.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {} as Record<string, Product[]>);

  const handleUpdateRate = async () => {
    if (!currentUser?.uid || !rateForm.productName || !rateForm.newRate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (userRole !== 'dealer') {
      toast({
        title: "Error",
        description: "Only dealers can update rates",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await dealerService.addRateUpdate(currentUser.uid, {
        productName: rateForm.productName,
        category: rateForm.category,
        newRate: parseFloat(rateForm.newRate.toString()),
        unit: rateForm.unit,
      });
      
      toast({
        title: "Success",
        description: "Rate updated successfully",
      });
      
      setIsUpdateDialogOpen(false);
      setRateForm({
        productName: "",
        category: "",
        newRate: 0,
        unit: "",
        effectiveDate: "",
        notes: "",
      });
    } catch (error) {
      console.error('Error updating rate:', error);
      toast({
        title: "Error",
        description: "Failed to update rate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feed Prices & Rates</h1>
          <p className="text-muted-foreground">
            {userRole === 'dealer' ? 'Manage your product pricing' : 'View current product prices from connected dealers'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            Real-time updates
          </div>
          {userRole === 'dealer' && (
            <Button onClick={() => setIsUpdateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Update Rate
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setSelectedTab("products")}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            selectedTab === "products" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {userRole === 'dealer' ? 'Your Products' : 'Available Products'}
        </button>
        {userRole === 'dealer' && (
          <button
            onClick={() => setSelectedTab("rate-updates")}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === "rate-updates" 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Rate Updates
          </button>
        )}
      </div>

      {/* Products Tab */}
      {selectedTab === "products" && (
        <div className="space-y-6">
          {products.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <DollarSign className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {userRole === 'dealer' ? 'No Products Added' : 'No Products Available'}
                </h3>
                <p className="text-gray-500">
                  {userRole === 'dealer' 
                    ? 'Add products from your dealer dashboard to see pricing information here.'
                    : 'Connect with dealers to see their products and current prices.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category} Products
                  </CardTitle>
                  <CardDescription>
                    {userRole === 'dealer' 
                      ? `Your ${category.toLowerCase()} products and pricing`
                      : `Available ${category.toLowerCase()} products from connected dealers`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryProducts.map((product) => (
                      <div key={product.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{product.productName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {product.supplier || 'No supplier specified'}
                            </p>
                          </div>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                        
                        <div>
                          <div className="text-2xl font-bold">
                            ₹{product.pricePerUnit.toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            per {product.unit}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Stock: {product.currentStock} {product.unit}
                          </span>
                          <Badge
                            variant={product.currentStock <= product.minStockLevel ? "destructive" : "default"}
                          >
                            {product.currentStock <= product.minStockLevel ? "Low Stock" : "In Stock"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Rate Updates Tab (Dealers Only) */}
      {selectedTab === "rate-updates" && userRole === 'dealer' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Your Rate Updates
              </CardTitle>
              <CardDescription>
                Recent rate changes you've made for your products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rateUpdates.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <Edit className="h-8 w-8 mx-auto" />
                    </div>
                    <p className="text-gray-500">No rate updates yet</p>
                  </div>
                ) : (
                  rateUpdates.map((update) => (
                    <div key={update.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{update.productName}</h3>
                          <p className="text-sm text-gray-500 capitalize">{update.category}</p>
                        </div>
                        <Badge variant="outline">
                          {update.updatedAt.toDate().toLocaleDateString()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">New Rate</p>
                          <p className="text-lg font-semibold">₹{update.newRate.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Unit</p>
                          <p className="text-sm">{update.unit}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Update Rate Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Product Rate</DialogTitle>
            <DialogDescription>
              Update the rate for your products
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={rateForm.productName}
                onChange={(e) => setRateForm({ ...rateForm, productName: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={rateForm.category} 
                onValueChange={(value) => setRateForm({ ...rateForm, category: value })}
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
                <Label htmlFor="newRate">New Rate *</Label>
                <Input
                  id="newRate"
                  type="number"
                  value={rateForm.newRate}
                  onChange={(e) => setRateForm({ ...rateForm, newRate: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={rateForm.unit}
                  onChange={(e) => setRateForm({ ...rateForm, unit: e.target.value })}
                  placeholder="bags, kg, pieces"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsUpdateDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRate}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Updating..." : "Update Rate"}
            </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
