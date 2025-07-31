import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getFarmerDealers, type FarmerDealerData } from "@/services/connectionService";
import { Link } from "react-router-dom";
import {
  Calculator,
  Phone,
  DollarSign,
  Users,
  Cloud,
  Sun,
  CloudRain,
  Thermometer,
  Wind,
  Activity
} from "lucide-react";

export default function FarmerDashboard() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // FCR Calculator State
  const [fcrResult, setFcrResult] = useState<number | null>(null);
  const [feedIntake, setFeedIntake] = useState("");
  const [bodyWeight, setBodyWeight] = useState("");
  
  // Connected dealers state
  const [connectedDealers, setConnectedDealers] = useState<FarmerDealerData[]>([]);
  const [loading, setLoading] = useState(true);

  // Weather state (mock data)
  const [weather, setWeather] = useState({
    temperature: 28,
    condition: 'sunny',
    humidity: 65,
    windSpeed: 12,
    description: 'Clear sky, good for poultry'
  });

  // Subscribe to connected dealers
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = getFarmerDealers(currentUser.uid, (farmerDealers) => {
      console.log('Connected dealers:', farmerDealers);
      setConnectedDealers(farmerDealers);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser?.uid]);

  // FCR Calculator
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

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'sunny': return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-8 w-8 text-blue-500" />;
      default: return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
        <p className="text-muted-foreground">
          View feed prices, calculate FCR, and check weather conditions
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Dealers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedDealers.length}</div>
            <p className="text-xs text-muted-foreground">
              Dealers available for feed prices
            </p>
            <p className="text-xs text-green-600 mt-1">
              Call directly to place orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Weather</CardTitle>
            {getWeatherIcon()}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weather.temperature}°C</div>
            <p className="text-xs text-muted-foreground">
              {weather.description}
            </p>
            <div className="flex gap-3 mt-1 text-xs">
              <span className="text-blue-600">Humidity: {weather.humidity}%</span>
              <span className="text-gray-600">Wind: {weather.windSpeed} km/h</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FCR Calculator</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fcrResult ? fcrResult.toFixed(2) : "---"}
            </div>
            <p className="text-xs text-muted-foreground">
              Feed Conversion Ratio
            </p>
            <p className="text-xs text-orange-600 mt-1">
              Calculate feed efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* FCR Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              FCR Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Calculate your Feed Conversion Ratio
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedIntake">Total Feed Intake (kg)</Label>
              <Input
                id="feedIntake"
                type="number"
                placeholder="e.g., 2.5"
                value={feedIntake}
                onChange={(e) => setFeedIntake(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bodyWeight">Body Weight Gain (kg)</Label>
              <Input
                id="bodyWeight"
                type="number"
                placeholder="e.g., 1.5"
                value={bodyWeight}
                onChange={(e) => setBodyWeight(e.target.value)}
              />
            </div>

            {fcrResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800">FCR Result</h4>
                <p className="text-2xl font-bold text-green-600">{fcrResult.toFixed(2)}</p>
                <p className="text-sm text-green-700">
                  {fcrResult < 1.8 ? "Excellent efficiency!" : 
                   fcrResult < 2.0 ? "Good efficiency" : 
                   "Consider feed optimization"}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={calculateFCR} className="flex-1">
                Calculate FCR
              </Button>
              <Button onClick={resetCalculator} variant="outline" className="flex-1">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weather Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getWeatherIcon()}
              Weather Information
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Current weather conditions for poultry care
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Thermometer className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">{weather.temperature}°C</p>
                  <p className="text-sm text-gray-600">Temperature</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{weather.humidity}%</p>
                  <p className="text-sm text-gray-600">Humidity</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Wind className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">{weather.windSpeed} km/h</p>
                  <p className="text-sm text-gray-600">Wind Speed</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Sun className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Good</p>
                  <p className="text-sm text-gray-600">Poultry Conditions</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">Weather Advice</h4>
              <p className="text-sm text-blue-700">
                {weather.temperature > 30 ? 
                  "High temperature - ensure adequate ventilation and water supply" :
                  weather.temperature < 20 ?
                  "Cool weather - check heating and provide extra bedding" :
                  "Ideal temperature for poultry. Maintain regular feeding schedule."
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Connected Dealers */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Connected Dealers
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your trusted feed suppliers
            </p>
          </CardHeader>
          <CardContent>
            {connectedDealers.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {connectedDealers.map((dealer) => (
                  <div key={dealer.id || dealer.dealerId} className="border rounded-lg p-4 space-y-3">
                    <div>
                      <h4 className="font-semibold">{dealer.dealerName}</h4>
                      <p className="text-sm text-gray-600">{dealer.dealerEmail}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 gap-2">
                        <Phone className="h-3 w-3" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-2">
                        <DollarSign className="h-3 w-3" />
                        View Prices
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Connected Dealers</h3>
                <p className="text-gray-600 mb-4">
                  Connect with dealers to view feed prices and place orders
                </p>
                <Button>Find Dealers</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="gap-2 h-auto p-4 flex-col">
              <DollarSign className="h-6 w-6" />
              <span>View Feed Prices</span>
              <span className="text-xs opacity-70">Compare dealer rates</span>
            </Button>
            <Link to="/fcr-calculator">
              <Button variant="outline" className="gap-2 h-auto p-4 flex-col w-full">
                <Calculator className="h-6 w-6" />
                <span>FCR Calculator</span>
                <span className="text-xs opacity-70">Free tool - Calculate efficiency</span>
              </Button>
            </Link>
            <Button variant="outline" className="gap-2 h-auto p-4 flex-col">
              <Phone className="h-6 w-6" />
              <span>Call Dealers</span>
              <span className="text-xs opacity-70">Place orders</span>
            </Button>
            <Button variant="outline" className="gap-2 h-auto p-4 flex-col">
              <Cloud className="h-6 w-6" />
              <span>Weather Info</span>
              <span className="text-xs opacity-70">Current conditions</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Free Tools Section */}
      <Card>
        <CardHeader>
          <CardTitle>Free Farm Management Tools</CardTitle>
          <p className="text-sm text-muted-foreground">
            All tools are completely free to use! Login only required to save and download reports.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/batch-management">
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Batch Management</h4>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Track multiple batches, manage feeding schedules, monitor growth rates
                </p>
                <p className="text-xs text-blue-600 font-medium">Free to use • Login to save reports</p>
              </div>
            </Link>

            <Link to="/fcr-reports">
              <div className="p-4 border rounded-lg bg-green-50 border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">FCR Reports</h4>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  Detailed FCR tracking, performance analytics, conversion trends
                </p>
                <p className="text-xs text-green-600 font-medium">Free to use • Login to save reports</p>
              </div>
            </Link>

            <Link to="/fcr-calculator">
              <div className="p-4 border rounded-lg bg-orange-50 border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-800">FCR Calculator</h4>
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  Quick FCR calculations with instant results and efficiency tips
                </p>
                <p className="text-xs text-orange-600 font-medium">Completely free • No login required</p>
              </div>
            </Link>
          </div>

          {!currentUser && (
            <div className="mt-6 text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground mb-4">
                Want to save your calculations and download reports?
              </p>
              <div className="flex gap-4 justify-center">
                <Button>Create Account</Button>
                <Button variant="outline">Login</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
