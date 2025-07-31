import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Plus, 
  Calendar, 
  Bird, 
  TrendingUp, 
  Download, 
  Save, 
  AlertTriangle,
  Users,
  Weight,
  Activity,
  DollarSign,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";

export default function BatchManagement() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [batches, setBatches] = useState([
    {
      id: 1,
      name: "Batch A-2024-001",
      startDate: "2024-01-15",
      birds: 1000,
      currentAge: 35,
      mortality: 25,
      feedConsumed: 1200,
      currentWeight: 1.8,
      fcr: 1.67,
      status: "Active"
    },
    {
      id: 2,
      name: "Batch B-2024-002", 
      startDate: "2024-02-01",
      birds: 1500,
      currentAge: 21,
      mortality: 15,
      feedConsumed: 800,
      currentWeight: 1.2,
      fcr: 1.33,
      status: "Active"
    }
  ]);

  const [showAddBatch, setShowAddBatch] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: "",
    startDate: "",
    birds: "",
    notes: ""
  });

  const addBatch = () => {
    if (!newBatch.name || !newBatch.startDate || !newBatch.birds) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const batch = {
      id: batches.length + 1,
      name: newBatch.name,
      startDate: newBatch.startDate,
      birds: parseInt(newBatch.birds),
      currentAge: 0,
      mortality: 0,
      feedConsumed: 0,
      currentWeight: 0,
      fcr: 0,
      status: "Active"
    };

    setBatches([...batches, batch]);
    setNewBatch({ name: "", startDate: "", birds: "", notes: "" });
    setShowAddBatch(false);
    
    toast({
      title: "Batch Added",
      description: "New batch has been created successfully",
    });
  };

  const handleSaveReport = () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to save batch reports",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Report Saved",
      description: "Batch report has been saved to your account",
    });
  };

  const handleDownloadReport = () => {
    if (!currentUser) {
      toast({
        title: "Login Required", 
        description: "Please login to download batch reports",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Download Started",
      description: "Your batch report is being downloaded",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-green-600 hover:text-green-700">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              <div className="flex items-center gap-2">
                <Bird className="w-8 h-8 text-green-600" />
                <h1 className="text-2xl font-bold text-green-600">Batch Management</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!currentUser ? (
                <>
                  <Link to="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-green-600 hover:bg-green-700">Register</Button>
                  </Link>
                </>
              ) : (
                <span className="text-sm text-gray-600">Welcome, {currentUser.email}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Batch Management</h1>
            <p className="text-gray-600 mb-6">
              Manage your poultry batches, track performance, and monitor growth. 
              All tools are free - only saving and downloading reports requires login.
            </p>
            
            <div className="flex gap-4 flex-wrap">
              <Button onClick={() => setShowAddBatch(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add New Batch
              </Button>
              <Button onClick={handleSaveReport} variant="outline" className="gap-2">
                <Save className="w-4 h-4" />
                Save Report
              </Button>
              <Button onClick={handleDownloadReport} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </div>
          </div>

          {/* Login Prompt */}
          {!currentUser && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">Save Your Work</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      You can use all batch management tools for free! Login only required to save reports and download data.
                    </p>
                    <div className="flex gap-2">
                      <Link to="/login">
                        <Button size="sm">Login</Button>
                      </Link>
                      <Link to="/register">
                        <Button size="sm" variant="outline">Create Account</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add New Batch Form */}
          {showAddBatch && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Batch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batchName">Batch Name *</Label>
                    <Input
                      id="batchName"
                      placeholder="e.g., Batch A-2024-003"
                      value={newBatch.name}
                      onChange={(e) => setNewBatch({...newBatch, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newBatch.startDate}
                      onChange={(e) => setNewBatch({...newBatch, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="birds">Number of Birds *</Label>
                    <Input
                      id="birds"
                      type="number" 
                      placeholder="e.g., 1000"
                      value={newBatch.birds}
                      onChange={(e) => setNewBatch({...newBatch, birds: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about this batch"
                      value={newBatch.notes}
                      onChange={(e) => setNewBatch({...newBatch, notes: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addBatch}>Add Batch</Button>
                  <Button variant="outline" onClick={() => setShowAddBatch(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Batch Overview Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batches.length}</div>
                <p className="text-xs text-muted-foreground">Active: {batches.filter(b => b.status === 'Active').length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Birds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batches.reduce((sum, b) => sum + b.birds, 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all batches</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average FCR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(batches.reduce((sum, b) => sum + b.fcr, 0) / batches.length).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Feed conversion ratio</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Mortality Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((batches.reduce((sum, b) => sum + b.mortality, 0) / batches.reduce((sum, b) => sum + b.birds, 0)) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Overall mortality</p>
              </CardContent>
            </Card>
          </div>

          {/* Batch List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {batches.map((batch) => (
                  <div key={batch.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{batch.name}</h4>
                        <p className="text-sm text-gray-600">Started: {batch.startDate}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          batch.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {batch.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Age: {batch.currentAge} days</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-6 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium">{batch.birds}</p>
                          <p className="text-gray-600">Birds</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Weight className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-medium">{batch.currentWeight} kg</p>
                          <p className="text-gray-600">Avg Weight</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="font-medium">{batch.mortality}</p>
                          <p className="text-gray-600">Mortality</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="font-medium">{batch.feedConsumed} kg</p>
                          <p className="text-gray-600">Feed Used</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="font-medium">{batch.fcr}</p>
                          <p className="text-gray-600">FCR</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="font-medium">{42 - batch.currentAge}</p>
                          <p className="text-gray-600">Days Left</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
