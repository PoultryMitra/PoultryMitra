import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Cloud, 
  Package, 
  DollarSign, 
  Phone,
  Globe,
  CheckCircle,
  Bird,
  Sun,
  CloudRain
} from "lucide-react";

export default function QuickFarmerDashboard() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [language, setLanguage] = useState("hi");
  
  const content = {
    hi: {
      title: "किसान डैशबोर्ड",
      subtitle: "फीड की कीमतें देखें और अपने फार्म का प्रबंधन करें",
      allSystemsOperational: "सभी सिस्टम चालू हैं",
      connectedDealers: "जुड़े हुए डीलर",
      dealersAvailable: "डीलर उपलब्ध हैं",
      callDirectly: "सीधे कॉल करें",
      todaysWeather: "आज का मौसम",
      temperature: "तापमान",
      humidity: "नमी",
      good: "अच्छा",
      activeBatches: "सक्रिय बैच",
      totalActiveBatches: "कुल सक्रिय बैच",
      birdsTotal: "कुल पक्षी",
      batchManagement: "बैच प्रबंधन",
      manageBatches: "अपने बैच का प्रबंधन करें",
      viewFeedPrices: "फीड की कीमतें देखें",
      callDealers: "डीलरों को कॉल करें",
      quickActions: "त्वरित कार्य",
      noConnectedDealers: "कोई जुड़े हुए डीलर नहीं",
      connectDealers: "डीलरों से जुड़ें",
      findDealers: "डीलर खोजें",
      phoneNotAvailable: "फोन नंबर उपलब्ध नहीं"
    },
    en: {
      title: "Farmer Dashboard",
      subtitle: "View feed prices and manage your farm",
      allSystemsOperational: "All Systems Operational",
      connectedDealers: "Connected Dealers",
      dealersAvailable: "Dealers available",
      callDirectly: "Call directly",
      todaysWeather: "Today's Weather",
      temperature: "Temperature",
      humidity: "Humidity",
      good: "Good",
      activeBatches: "Active Batches",
      totalActiveBatches: "Total Active Batches",
      birdsTotal: "birds total",
      batchManagement: "Batch Management",
      manageBatches: "Manage your batches",
      viewFeedPrices: "View Feed Prices",
      callDealers: "Call Dealers",
      quickActions: "Quick Actions",
      noConnectedDealers: "No Connected Dealers",
      connectDealers: "Connect with dealers",
      findDealers: "Find Dealers",
      phoneNotAvailable: "Phone not available"
    }
  };

  const t = content[language];

  // Simple mock data - no complex API calls
  const [connectedDealers] = useState([
    {
      id: 1,
      dealerName: "Raja Feed Store",
      dealerPhone: "+91 9876543210",
      dealerEmail: "raja@feedstore.com"
    }
  ]);

  const [weather] = useState({
    temperature: "28°C",
    condition: "sunny",
    humidity: "65%"
  });

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'sunny': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'rain': return <CloudRain className="h-6 w-6 text-blue-500" />;
      default: return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen">
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t.allSystemsOperational}
            </Badge>
          </div>
        </div>
        
        {/* Language Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
          className="flex items-center gap-2"
        >
          <Globe className="w-4 h-4" />
          {language === 'hi' ? 'EN' : 'हिं'}
        </Button>
      </div>

      {/* Key Metrics - Simple Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.connectedDealers}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedDealers.length}</div>
            <p className="text-xs text-muted-foreground">
              {t.dealersAvailable}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {t.callDirectly}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.todaysWeather}</CardTitle>
            {getWeatherIcon()}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weather.temperature}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t.humidity}: {weather.humidity}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.activeBatches}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              {t.totalActiveBatches}
            </p>
            <p className="text-xs text-green-600 mt-1">
              2,500 {t.birdsTotal}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Connected Dealers - Simple List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t.connectedDealers}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectedDealers.length > 0 ? (
            <div className="space-y-3">
              {connectedDealers.map((dealer) => (
                <div key={dealer.id} className="border rounded-lg p-4 space-y-2">
                  <div>
                    <h4 className="font-semibold">{dealer.dealerName}</h4>
                    <p className="text-sm text-gray-600">{dealer.dealerEmail}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        if (dealer.dealerPhone) {
                          window.open(`tel:${dealer.dealerPhone}`, '_self');
                        } else {
                          toast({
                            title: t.phoneNotAvailable,
                            description: `${dealer.dealerName} ${t.phoneNotAvailable}`,
                            variant: "default"
                          });
                        }
                      }}
                      className="gap-2"
                    >
                      <Phone className="w-3 h-3" />
                      {t.callDealers}
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Feature Coming Soon",
                          description: "Price viewing feature will be available soon",
                          variant: "default"
                        });
                      }}
                    >
                      {t.viewFeedPrices}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <h3 className="font-semibold mb-2">{t.noConnectedDealers}</h3>
              <p className="text-gray-600 mb-4">{t.connectDealers}</p>
              <Button onClick={() => {
                toast({
                  title: "Feature Coming Soon",
                  description: "Dealer directory feature coming soon",
                  variant: "default"
                });
              }}>
                {t.findDealers}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - Simple Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>{t.quickActions}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="gap-2 h-auto p-4 flex-col">
              <DollarSign className="h-5 w-5" />
              <span>{t.viewFeedPrices}</span>
            </Button>
            <Button variant="outline" className="gap-2 h-auto p-4 flex-col">
              <Package className="h-5 w-5" />
              <span>{t.batchManagement}</span>
            </Button>
            <Button variant="outline" className="gap-2 h-auto p-4 flex-col">
              <Phone className="h-5 w-5" />
              <span>{t.callDealers}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
