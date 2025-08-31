import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, TrendingUp, TrendingDown, Eye } from "lucide-react";

const BroilerRate = () => {
  const [rates, setRates] = useState<any[]>([]);

  const [newRate, setNewRate] = useState({
    category: "",
    subcategory: "",
    rate: "",
    region: "",
  });

  // Subscribe to market rates from Firestore
  useEffect(() => {
    let unsub: (() => void) | null = null;
    import('@/services/adminService').then(({ AdminService }) => {
      unsub = AdminService.getMarketRates((fetched) => {
        setRates(fetched.map(r => ({
          id: r.id,
          category: r.category,
          subcategory: r.subcategory,
          rate: r.rate,
          previousRate: r.previousRate ?? r.rate,
          region: r.region,
          lastUpdated: r.updatedAt?.toDate?.() ? r.updatedAt.toDate().toISOString().split('T')[0] : '',
          status: r.status || 'active'
        })));
      });
    }).catch(e => console.error(e));

    return () => { if (unsub) unsub(); };
  }, []);

  const handleAddRate = () => {
    if (newRate.category && newRate.subcategory && newRate.rate && newRate.region) {
      const rate = {
        id: rates.length + 1,
        category: newRate.category,
        subcategory: newRate.subcategory,
        rate: parseFloat(newRate.rate),
        previousRate: parseFloat(newRate.rate) - 1,
        region: newRate.region,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: "active"
      };
      setRates([...rates, rate]);
      setNewRate({ category: "", subcategory: "", rate: "", region: "" });
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <TrendingUp className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return "text-green-600";
    if (current < previous) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rate Management</h1>
            <p className="text-gray-600">Manage broiler, egg, and feed rates across different regions.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Rate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Rate</DialogTitle>
                <DialogDescription>Add a new rate for a specific category and region.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newRate.category} onValueChange={(value) => setNewRate({...newRate, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Broiler">Broiler</SelectItem>
                      <SelectItem value="Eggs">Eggs</SelectItem>
                      <SelectItem value="Feed">Feed</SelectItem>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={newRate.subcategory}
                    onChange={(e) => setNewRate({...newRate, subcategory: e.target.value})}
                    placeholder="e.g., Live Weight, Dressed, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="rate">Rate (₹)</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={newRate.rate}
                    onChange={(e) => setNewRate({...newRate, rate: e.target.value})}
                    placeholder="Enter rate"
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select value={newRate.region} onValueChange={(value) => setNewRate({...newRate, region: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                          <SelectItem value="Mumbai">Mumbai</SelectItem>
                          <SelectItem value="Delhi">Delhi</SelectItem>
                          <SelectItem value="Bangalore">Bangalore</SelectItem>
                          <SelectItem value="Chennai">Chennai</SelectItem>
                          <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                          <SelectItem value="Bihar">Bihar</SelectItem>
                          <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                          <SelectItem value="West Bengal">West Bengal</SelectItem>
                          <SelectItem value="Kolkata">Kolkata</SelectItem>
                        </SelectContent>
                  </Select>
                </div>
                    <Button onClick={async () => {
                      // persist to Firestore via AdminService
                      try {
                        const svc = await import('@/services/adminService');
                        await svc.AdminService.addMarketRate({
                          category: newRate.category,
                          subcategory: newRate.subcategory,
                          rate: parseFloat(newRate.rate || '0'),
                          previousRate: undefined,
                          region: newRate.region,
                          status: 'active'
                        });
                        setNewRate({ category: '', subcategory: '', rate: '', region: '' });
                      } catch (e) {
                        console.error('Error saving market rate', e);
                        alert('Failed to save market rate');
                      }
                    }} className="w-full">Add Rate</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rates.length}</div>
            <p className="text-sm text-gray-600">Active rate entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Regions Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{new Set(rates.map(r => r.region)).size}</div>
            <p className="text-sm text-gray-600">Different regions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{new Set(rates.map(r => r.category)).size}</div>
            <p className="text-sm text-gray-600">Product categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Rates</CardTitle>
          <CardDescription>All active rates across different categories and regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Subcategory</th>
                  <th className="text-left py-3 px-4 font-medium">Current Rate</th>
                  <th className="text-left py-3 px-4 font-medium">Previous Rate</th>
                  <th className="text-left py-3 px-4 font-medium">Trend</th>
                  <th className="text-left py-3 px-4 font-medium">Region</th>
                  <th className="text-left py-3 px-4 font-medium">Last Updated</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{rate.category}</td>
                    <td className="py-3 px-4">{rate.subcategory}</td>
            <td className="py-3 px-4 font-semibold">₹{rate.rate}</td>
          <td className="py-3 px-4 text-gray-600">₹{rate.previousRate}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(rate.rate, rate.previousRate)}
                        <span className={`text-sm ${getTrendColor(rate.rate, rate.previousRate)}`}>
                          {((rate.rate - rate.previousRate) / rate.previousRate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{rate.region}</td>
                    <td className="py-3 px-4">{rate.lastUpdated}</td>
                    <td className="py-3 px-4">
                      <Badge variant={rate.status === 'active' ? 'default' : 'secondary'}>
                        {rate.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BroilerRate;
