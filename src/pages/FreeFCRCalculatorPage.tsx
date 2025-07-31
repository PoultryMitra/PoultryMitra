import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calculator, TrendingUp, AlertTriangle, ArrowLeft, Bird } from "lucide-react";
import { Link } from "react-router-dom";

export default function FreeFCRCalculatorPage() {
  const { toast } = useToast();
  const [fcrResult, setFcrResult] = useState<number | null>(null);
  const [feedIntake, setFeedIntake] = useState("");
  const [bodyWeight, setBodyWeight] = useState("");

  const calculateFCR = () => {
    const intake = parseFloat(feedIntake);
    const weight = parseFloat(bodyWeight);
    
    if (intake && weight && weight > 0) {
      const fcr = intake / weight;
      setFcrResult(fcr);
      toast({
        title: "FCR Calculated",
        description: `Your Feed Conversion Ratio is ${fcr.toFixed(2)}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Please enter valid numbers for both fields",
        variant: "destructive",
      });
    }
  };

  const resetCalculator = () => {
    setFeedIntake("");
    setBodyWeight("");
    setFcrResult(null);
  };

  const getFCRFeedback = (fcr: number) => {
    if (fcr < 1.8) return { text: "Excellent efficiency!", color: "text-green-600", bg: "bg-green-50 border-green-200" };
    if (fcr < 2.0) return { text: "Good efficiency", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
    if (fcr < 2.3) return { text: "Average efficiency", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" };
    return { text: "Consider feed optimization", color: "text-red-600", bg: "bg-red-50 border-red-200" };
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
                <h1 className="text-2xl font-bold text-green-600">Poultry Mitra</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-green-600 hover:bg-green-700">Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Free FCR Calculator
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Calculate your Feed Conversion Ratio instantly. This tool is completely free and requires no registration.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                FCR Calculator - Free Tool
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Calculate your Feed Conversion Ratio to optimize poultry feed efficiency
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feedIntake">Total Feed Intake (kg)</Label>
                  <Input
                    id="feedIntake"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 2.5"
                    value={feedIntake}
                    onChange={(e) => setFeedIntake(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Total amount of feed consumed by birds
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bodyWeight">Body Weight Gain (kg)</Label>
                  <Input
                    id="bodyWeight"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 1.5"
                    value={bodyWeight}
                    onChange={(e) => setBodyWeight(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Weight gained during the period
                  </p>
                </div>
              </div>

              {fcrResult && (
                <div className={`p-4 border rounded-lg ${getFCRFeedback(fcrResult).bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <h4 className="font-semibold">FCR Result</h4>
                  </div>
                  <p className="text-3xl font-bold mb-2">{fcrResult.toFixed(2)}</p>
                  <p className={`text-sm font-medium ${getFCRFeedback(fcrResult).color}`}>
                    {getFCRFeedback(fcrResult).text}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <p>Lower FCR values indicate better feed efficiency</p>
                    <p>Industry standard: 1.6-2.0 for broilers, 2.0-2.5 for layers</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={calculateFCR} className="flex-1">
                  Calculate FCR
                </Button>
                <Button onClick={resetCalculator} variant="outline" className="flex-1">
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Features Promotion */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Batch Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 mb-4">
                  Track multiple batches, manage feeding schedules, monitor growth rates with detailed analytics.
                </p>
                <Link to="/register">
                  <Button size="sm" className="w-full">Register for Free</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Batch Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 mb-4">
                  Real-time monitoring, health records, vaccination schedules, and performance tracking.
                </p>
                <Link to="/register">
                  <Button size="sm" className="w-full">Register for Free</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-800">Farm History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700 mb-4">
                  Complete historical data, performance analytics, profit tracking, and trend analysis.
                </p>
                <Link to="/register">
                  <Button size="sm" className="w-full">Register for Free</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Ready to unlock more features?</h4>
                <p className="text-blue-700 mb-4">
                  Join thousands of farmers who are optimizing their poultry operations with our comprehensive farm management system.
                </p>
                <div className="flex gap-3">
                  <Link to="/register">
                    <Button>Create Free Account</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
