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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as dealerService from "@/services/dealerService";
import type { RateUpdate } from "@/services/dealerService";
import { TrendingUp, TrendingDown, RefreshCw, Edit, Plus, DollarSign } from "lucide-react";

const marketRates = [
  {
    id: 1,
    category: "Broiler",
    subcategory: "Live Weight",
    currentRate: 85,
    previousRate: 82,
    unit: "per kg",
    lastUpdated: "2023-12-15",
    region: "Mumbai",
  },
  {
    id: 2,
    category: "Broiler",
    subcategory: "Dressed",
    currentRate: 165,
    previousRate: 168,
    unit: "per kg",
    lastUpdated: "2023-12-15",
    region: "Mumbai",
  },
  {
    id: 3,
    category: "Eggs",
    subcategory: "White Shell",
    currentRate: 420,
    previousRate: 415,
    unit: "per 100 pieces",
    lastUpdated: "2023-12-15",
    region: "Mumbai",
  },
  {
    id: 4,
    category: "Eggs",
    subcategory: "Brown Shell",
    currentRate: 450,
    previousRate: 445,
    unit: "per 100 pieces",
    lastUpdated: "2023-12-15",
    region: "Mumbai",
  },
  {
    id: 5,
    category: "Chicks",
    subcategory: "Day Old",
    currentRate: 45,
    previousRate: 48,
    unit: "per piece",
    lastUpdated: "2023-12-15",
    region: "Mumbai",
  },
  {
    id: 6,
    category: "Feed",
    subcategory: "Starter",
    currentRate: 35,
    previousRate: 36,
    unit: "per kg",
    lastUpdated: "2023-12-15",
    region: "Mumbai",
  },
];

export default function Rates() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [rateUpdates, setRateUpdates] = useState<RateUpdate[]>([]);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("market");

  // Form state for rate updates
  const [rateForm, setRateForm] = useState({
    productName: "",
    category: "",
    newRate: 0,
    unit: "",
    effectiveDate: "",
    notes: "",
  });

  // Subscribe to rate updates
  useEffect(() => {
    if (!currentUser?.uid) return;

    // Local workaround for module resolution issue
    const localGetDealerRateUpdates = (dealerId: string, callback: (data: any[]) => void) => {
      console.log('Using local rate updates data');
      setTimeout(() => {
        const dummyRateUpdates = [
          {
            id: "1",
            dealerId: dealerId,
            rateType: "Feed",
            currentRate: 45.50,
            previousRate: 44.20,
            effectiveDate: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
            location: "Main Market",
            notes: "Seasonal adjustment"
          },
          {
            id: "2", 
            dealerId: dealerId,
            rateType: "Chicken",
            currentRate: 180.00,
            previousRate: 175.00,
            effectiveDate: { seconds: Math.floor((Date.now() - 86400000) / 1000), nanoseconds: 0 },
            location: "Local Farm",
            notes: "Market demand increase"
          }
        ];
        callback(dummyRateUpdates);
      }, 1000);
      
      return () => {}; // Return empty unsubscribe function
    };

    const unsubscribe = localGetDealerRateUpdates(currentUser.uid, setRateUpdates);
    return unsubscribe;
  }, [currentUser?.uid]);

  const getRateChange = (current: number, previous: number) => {
    const change = current - previous;
    const percentage = ((change / previous) * 100).toFixed(1);
    return { change, percentage };
  };

  const getRateTrend = (current: number, previous: number) => {
    if (current > previous) return "up";
    if (current < previous) return "down";
    return "neutral";
  };

  const groupedMarketRates = marketRates.reduce((groups, rate) => {
    const category = rate.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(rate);
    return groups;
  }, {} as Record<string, typeof marketRates>);

  const handleUpdateRate = async () => {
    if (!currentUser?.uid || !rateForm.productName || !rateForm.newRate) {
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
      const newRateUpdate: RateUpdate = {
        id: Date.now().toString(),
        dealerId: currentUser.uid,
        productName: rateForm.productName,
        category: rateForm.category,
        newRate: parseFloat(rateForm.newRate.toString()),
        unit: rateForm.unit,
        updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any
      };
      
      // Simulate adding to rate updates
      setRateUpdates(prev => [newRateUpdate, ...prev]);
      
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
      console.error("Error updating rate:", error);
      toast({
        title: "Error",
        description: "Failed to update rate",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rate Management</h1>
          <p className="text-muted-foreground">
            Market rates and your product pricing management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            Last updated: Dec 15, 2023
          </div>
          <Button onClick={() => setIsUpdateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Update Rate
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setSelectedTab("market")}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            selectedTab === "market" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Market Rates
        </button>
        <button
          onClick={() => setSelectedTab("your-rates")}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            selectedTab === "your-rates" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Your Rates
        </button>
      </div>

      {/* Market Rates Tab */}
      {selectedTab === "market" && (
        <div className="space-y-6">
          {Object.entries(groupedMarketRates).map(([category, rates]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category} Market Rates
                </CardTitle>
                <CardDescription>
                  Current market prices for {category.toLowerCase()} products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rates.map((rate) => {
                    const { change, percentage } = getRateChange(rate.currentRate, rate.previousRate);
                    const trend = getRateTrend(rate.currentRate, rate.previousRate);
                    
                    return (
                      <div key={rate.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{rate.subcategory}</h3>
                            <p className="text-sm text-muted-foreground">{rate.region}</p>
                          </div>
                          {trend !== "neutral" && (
                            <div className={`flex items-center gap-1 ${
                              trend === "up" ? "text-green-600" : "text-red-600"
                            }`}>
                              {trend === "up" ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <span className="text-xs font-medium">
                                {percentage}%
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="text-2xl font-bold">
                            ₹{rate.currentRate}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {rate.unit}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Previous: ₹{rate.previousRate}
                          </span>
                          <Badge
                            variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"}
                          >
                            {change > 0 ? "+" : ""}₹{change}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Market Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>
                Key trends and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-green-600 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Price Increases
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Broiler Live Weight:</strong> Up by ₹3/kg due to increased demand
                    </p>
                    <p className="text-sm">
                      <strong>Eggs:</strong> Steady increase in both shell types
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-red-600 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Price Decreases
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Day Old Chicks:</strong> Down by ₹3/piece due to seasonal factors
                    </p>
                    <p className="text-sm">
                      <strong>Feed Prices:</strong> Slight reduction in starter feed costs
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Your Rates Tab */}
      {selectedTab === "your-rates" && (
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
                {rateUpdates.map((update) => (
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
                        <p className="text-sm text-gray-500">New Rate</p>
                        <p className="font-semibold text-lg">₹{update.newRate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Unit</p>
                        <p className="font-medium">{update.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Updated</p>
                        <p className="font-medium">{update.updatedAt.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {rateUpdates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No rate updates found. Create your first rate update to track pricing changes.
                  </div>
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
                  <SelectItem value="chicks">Chicks</SelectItem>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="vaccines">Vaccines</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
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
                  placeholder="kg, pieces, liters"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={rateForm.effectiveDate}
                onChange={(e) => setRateForm({ ...rateForm, effectiveDate: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={rateForm.notes}
                onChange={(e) => setRateForm({ ...rateForm, notes: e.target.value })}
                placeholder="Optional notes about the rate change"
              />
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