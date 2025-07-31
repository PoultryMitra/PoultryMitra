import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calculator, TrendingUp, AlertTriangle } from "lucide-react";

export default function FreeFCRCalculator() {
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
    <Card className="w-full max-w-2xl mx-auto">
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Want More Features?</h4>
              <p className="text-sm text-blue-700 mb-3">
                Login to access advanced features like batch management, tracking history, and detailed analytics.
              </p>
              <Button size="sm" variant="outline">
                Login for Advanced Features
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
