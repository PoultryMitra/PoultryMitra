import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

const mockRates = [
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

  const groupedRates = mockRates.reduce((groups, rate) => {
    const category = rate.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(rate);
    return groups;
  }, {} as Record<string, typeof mockRates>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Market Rates</h1>
          <p className="text-muted-foreground">
            Current poultry market rates and price trends
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4" />
          Last updated: Dec 15, 2023
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedRates).map(([category, rates]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category} Rates
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
                            trend === "up" ? "text-success" : "text-destructive"
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
      </div>

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
              <h3 className="font-medium text-success flex items-center gap-2">
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
              <h3 className="font-medium text-destructive flex items-center gap-2">
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
  );
}