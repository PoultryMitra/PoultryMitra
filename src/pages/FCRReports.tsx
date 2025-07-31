import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Calculator, 
  TrendingUp, 
  Download, 
  Save, 
  AlertTriangle,
  BarChart3,
  Calendar,
  Bird,
  ArrowLeft,
  Plus,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";

export default function FCRReports() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [fcrCalculations, setFcrCalculations] = useState([
    {
      id: 1,
      date: "2024-01-20",
      batchName: "Batch A-2024-001",
      feedIntake: 2500,
      weightGain: 1500,
      fcr: 1.67,
      period: "Week 5",
      notes: "Good performance, optimal feeding"
    },
    {
      id: 2,
      date: "2024-01-15",
      batchName: "Batch A-2024-001", 
      feedIntake: 2000,
      weightGain: 1300,
      fcr: 1.54,
      period: "Week 4",
      notes: "Excellent conversion rate"
    },
    {
      id: 3,
      date: "2024-02-05",
      batchName: "Batch B-2024-002",
      feedIntake: 1800,
      weightGain: 1350,
      fcr: 1.33,
      period: "Week 3",
      notes: "Very good efficiency for young birds"
    }
  ]);

  const [showAddCalculation, setShowAddCalculation] = useState(false);
  const [newCalculation, setNewCalculation] = useState({
    batchName: "",
    feedIntake: "",
    weightGain: "",
    period: "",
    notes: ""
  });

  const addCalculation = () => {
    if (!newCalculation.batchName || !newCalculation.feedIntake || !newCalculation.weightGain) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const feedIntake = parseFloat(newCalculation.feedIntake);
    const weightGain = parseFloat(newCalculation.weightGain);
    const fcr = feedIntake / weightGain;

    const calculation = {
      id: fcrCalculations.length + 1,
      date: new Date().toISOString().split('T')[0],
      batchName: newCalculation.batchName,
      feedIntake,
      weightGain,
      fcr: parseFloat(fcr.toFixed(2)),
      period: newCalculation.period,
      notes: newCalculation.notes
    };

    setFcrCalculations([calculation, ...fcrCalculations]);
    setNewCalculation({ batchName: "", feedIntake: "", weightGain: "", period: "", notes: "" });
    setShowAddCalculation(false);
    
    toast({
      title: "FCR Calculated",
      description: `FCR of ${fcr.toFixed(2)} added to your records`,
    });
  };

  const getFCRStatus = (fcr: number) => {
    if (fcr < 1.6) return { text: "Excellent", color: "text-green-600", bg: "bg-green-100" };
    if (fcr < 1.8) return { text: "Good", color: "text-blue-600", bg: "bg-blue-100" };
    if (fcr < 2.0) return { text: "Average", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { text: "Needs Improvement", color: "text-red-600", bg: "bg-red-100" };
  };

  const handleSaveReport = () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to save FCR reports",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Report Saved",
      description: "FCR report has been saved to your account",
    });
  };

  const handleDownloadReport = () => {
    if (!currentUser) {
      toast({
        title: "Login Required", 
        description: "Please login to download FCR reports",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Download Started",
      description: "Your FCR report is being downloaded",
    });
  };

  const averageFCR = fcrCalculations.reduce((sum, calc) => sum + calc.fcr, 0) / fcrCalculations.length;
  const bestFCR = Math.min(...fcrCalculations.map(calc => calc.fcr));
  const latestFCR = fcrCalculations[0]?.fcr || 0;

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
                <BarChart3 className="w-8 h-8 text-green-600" />
                <h1 className="text-2xl font-bold text-green-600">FCR Reports</h1>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">FCR Reports & Analytics</h1>
            <p className="text-gray-600 mb-6">
              Track your Feed Conversion Ratio over time, analyze performance trends. 
              All calculations are free - only saving and downloading reports requires login.
            </p>
            
            <div className="flex gap-4 flex-wrap">
              <Button onClick={() => setShowAddCalculation(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add FCR Calculation
              </Button>
              <Button onClick={handleSaveReport} variant="outline" className="gap-2">
                <Save className="w-4 h-4" />
                Save Report
              </Button>
              <Button onClick={handleDownloadReport} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
              <Link to="/fcr-calculator">
                <Button variant="outline" className="gap-2">
                  <Calculator className="w-4 h-4" />
                  Quick Calculator
                </Button>
              </Link>
            </div>
          </div>

          {/* Login Prompt */}
          {!currentUser && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">Save Your Calculations</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Use all FCR tools for free! Login only required to save your calculation history and download reports.
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

          {/* Add New Calculation Form */}
          {showAddCalculation && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add FCR Calculation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batchName">Batch Name *</Label>
                    <Input
                      id="batchName"
                      placeholder="e.g., Batch A-2024-003"
                      value={newCalculation.batchName}
                      onChange={(e) => setNewCalculation({...newCalculation, batchName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="period">Period</Label>
                    <Input
                      id="period"
                      placeholder="e.g., Week 5, Day 35"
                      value={newCalculation.period}
                      onChange={(e) => setNewCalculation({...newCalculation, period: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="feedIntake">Feed Intake (kg) *</Label>
                    <Input
                      id="feedIntake"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 2500"
                      value={newCalculation.feedIntake}
                      onChange={(e) => setNewCalculation({...newCalculation, feedIntake: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weightGain">Weight Gain (kg) *</Label>
                    <Input
                      id="weightGain"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 1500"
                      value={newCalculation.weightGain}
                      onChange={(e) => setNewCalculation({...newCalculation, weightGain: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Additional observations or notes"
                    value={newCalculation.notes}
                    onChange={(e) => setNewCalculation({...newCalculation, notes: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addCalculation}>Calculate & Add</Button>
                  <Button variant="outline" onClick={() => setShowAddCalculation(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* FCR Overview Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Latest FCR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestFCR.toFixed(2)}</div>
                <p className={`text-xs font-medium ${getFCRStatus(latestFCR).color}`}>
                  {getFCRStatus(latestFCR).text}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average FCR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageFCR.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Across all calculations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Best FCR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{bestFCR.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Lowest recorded</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fcrCalculations.length}</div>
                <p className="text-xs text-muted-foreground">FCR calculations</p>
              </CardContent>
            </Card>
          </div>

          {/* FCR History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                FCR Calculation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fcrCalculations.map((calc) => (
                  <div key={calc.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{calc.batchName}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {calc.date}
                          </span>
                          {calc.period && <span>Period: {calc.period}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{calc.fcr}</div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getFCRStatus(calc.fcr).bg} ${getFCRStatus(calc.fcr).color}`}>
                          {getFCRStatus(calc.fcr).text}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Bird className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium">{calc.feedIntake} kg</p>
                          <p className="text-gray-600">Feed Intake</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-medium">{calc.weightGain} kg</p>
                          <p className="text-gray-600">Weight Gain</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="font-medium">{calc.fcr}</p>
                          <p className="text-gray-600">Conversion Ratio</p>
                        </div>
                      </div>
                    </div>
                    
                    {calc.notes && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-700">{calc.notes}</p>
                      </div>
                    )}
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
