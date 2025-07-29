import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FCRCalculator() {
  const [feedIntake, setFeedIntake] = useState("");
  const [bodyWeight, setBodyWeight] = useState("");
  const [fcr, setFCR] = useState<number | null>(null);
  const [history, setHistory] = useState([
    { date: "2023-12-15", fcr: 1.68, feedIntake: 2.5, bodyWeight: 1.49 },
    { date: "2023-12-10", fcr: 1.72, feedIntake: 2.4, bodyWeight: 1.40 },
    { date: "2023-12-05", fcr: 1.65, feedIntake: 2.3, bodyWeight: 1.39 },
  ]);

  const calculateFCR = () => {
    const feed = parseFloat(feedIntake);
    const weight = parseFloat(bodyWeight);
    
    if (feed > 0 && weight > 0) {
      const calculatedFCR = feed / weight;
      setFCR(calculatedFCR);
    }
  };

  const saveCalculation = () => {
    if (fcr && feedIntake && bodyWeight) {
      const newEntry = {
        date: new Date().toISOString().split('T')[0],
        fcr: fcr,
        feedIntake: parseFloat(feedIntake),
        bodyWeight: parseFloat(bodyWeight),
      };
      setHistory([newEntry, ...history]);
      setFeedIntake("");
      setBodyWeight("");
      setFCR(null);
    }
  };

  const getFCRCategory = (fcrValue: number) => {
    if (fcrValue < 1.6) return { label: "Excellent", variant: "default" as const };
    if (fcrValue < 1.8) return { label: "Good", variant: "secondary" as const };
    if (fcrValue < 2.0) return { label: "Average", variant: "outline" as const };
    return { label: "Needs Improvement", variant: "destructive" as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">FCR Calculator</h1>
          <p className="text-muted-foreground">
            Calculate Feed Conversion Ratio to monitor efficiency
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator */}
        <Card>
          <CardHeader>
            <CardTitle>Calculate FCR</CardTitle>
            <CardDescription>
              Enter feed intake and body weight to calculate FCR
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedIntake">Feed Intake (kg)</Label>
                <Input
                  id="feedIntake"
                  type="number"
                  step="0.01"
                  placeholder="Enter feed intake in kg"
                  value={feedIntake}
                  onChange={(e) => setFeedIntake(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyWeight">Body Weight (kg)</Label>
                <Input
                  id="bodyWeight"
                  type="number"
                  step="0.01"
                  placeholder="Enter body weight in kg"
                  value={bodyWeight}
                  onChange={(e) => setBodyWeight(e.target.value)}
                />
              </div>

              <Button onClick={calculateFCR} className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate FCR
              </Button>
            </div>

            {fcr && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Feed Conversion Ratio</p>
                    <div className="text-4xl font-bold text-primary">
                      {fcr.toFixed(2)}
                    </div>
                  <Badge variant={getFCRCategory(fcr).variant}>
                    {getFCRCategory(fcr).label}
                  </Badge>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      FCR = Feed Intake ÷ Body Weight. Lower values indicate better efficiency.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={saveCalculation} variant="outline" className="w-full">
                    Save Calculation
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* FCR Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>FCR Guidelines</CardTitle>
            <CardDescription>
              Understanding your FCR results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                <div>
                  <p className="font-medium text-success">Excellent</p>
                  <p className="text-sm text-muted-foreground">FCR &lt; 1.6</p>
                </div>
                <Badge variant="default">Optimal</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">Good</p>
                  <p className="text-sm text-muted-foreground">FCR 1.6 - 1.8</p>
                </div>
                <Badge variant="secondary">Above Average</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Average</p>
                  <p className="text-sm text-muted-foreground">FCR 1.8 - 2.0</p>
                </div>
                <Badge variant="outline">Standard</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                <div>
                  <p className="font-medium text-destructive">Needs Improvement</p>
                  <p className="text-sm text-muted-foreground">FCR &gt; 2.0</p>
                </div>
                <Badge variant="destructive">Action Required</Badge>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Monitor FCR weekly to identify trends and optimize feed efficiency.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* FCR History */}
      <Card>
        <CardHeader>
          <CardTitle>FCR History</CardTitle>
          <CardDescription>
            Track your FCR improvements over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{entry.date}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Feed: {entry.feedIntake} kg</span>
                    <span>Weight: {entry.bodyWeight} kg</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-2xl font-bold text-primary">
                    {entry.fcr.toFixed(2)}
                  </div>
                  <Badge variant={getFCRCategory(entry.fcr).variant}>
                    {getFCRCategory(entry.fcr).label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}