import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

declare global {
  interface Window {
    Chart: any;
    fcrChart: any;
  }
}

const FCRCalculator: React.FC = () => {
  const [results, setResults] = useState<string>("");
  const [warning, setWarning] = useState<string>("");
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Load Chart.js
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const calculateFCR = () => {
    const chicks = parseFloat((document.getElementById('chickCount') as HTMLInputElement)?.value || '0');
    const chickRate = parseFloat((document.getElementById('chickRate') as HTMLInputElement)?.value || '0');
    const mortality = parseFloat((document.getElementById('mortality') as HTMLInputElement)?.value || '0');
    const sellingPrice = parseFloat((document.getElementById('sellingPrice') as HTMLInputElement)?.value || '0');
    const avgWeight = parseFloat((document.getElementById('avgWeight') as HTMLInputElement)?.value || '2');

    const preBags = parseFloat((document.getElementById('preStarterBags') as HTMLInputElement)?.value || '0');
    const prePrice = parseFloat((document.getElementById('preStarterPrice') as HTMLInputElement)?.value || '0');
    const starterBags = parseFloat((document.getElementById('starterBags') as HTMLInputElement)?.value || '0');
    const starterPrice = parseFloat((document.getElementById('starterPrice') as HTMLInputElement)?.value || '0');
    const finisherBags = parseFloat((document.getElementById('finisherBags') as HTMLInputElement)?.value || '0');
    const finisherPrice = parseFloat((document.getElementById('finisherPrice') as HTMLInputElement)?.value || '0');

    if (isNaN(chicks) || isNaN(chickRate) || isNaN(sellingPrice) || chicks <= 0 || chickRate <= 0 || sellingPrice <= 0) {
      setWarning("Please fill all required fields correctly.");
      return;
    } else {
      setWarning("");
    }

    const totalBirds = chicks * 1.02;
    const liveBirds = totalBirds - mortality;
    const totalWeight = liveBirds * avgWeight;

    const chickCost = chicks * chickRate;
    const feedCost = (preBags * prePrice) + (starterBags * starterPrice) + (finisherBags * finisherPrice);
    const totalCost = chickCost + feedCost;

    const revenue = totalWeight * sellingPrice;
    const netProfit = revenue - totalCost;
    const profitPerBird = liveBirds > 0 ? netProfit / liveBirds : 0;
    const breakevenPrice = liveBirds > 0 ? totalCost / totalWeight : 0;
    const fcr = totalWeight > 0 ? ((preBags + starterBags + finisherBags) * 50) / totalWeight : 0;

    const outputElement = document.getElementById('outputSummary');
    if (outputElement) {
      outputElement.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="bg-green-50 p-4 rounded-lg">
            <p class="font-semibold mb-2">Live Birds: <span class="text-green-600">${liveBirds.toFixed(0)}</span></p>
            <p class="font-semibold mb-2">Total Weight: <span class="text-green-600">${totalWeight.toFixed(2)} kg</span></p>
            <p class="font-semibold">FCR: <span class="text-green-600">${fcr.toFixed(2)}</span></p>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="font-semibold mb-2">Chick Cost: <span class="text-blue-600">₹${chickCost.toFixed(2)}</span></p>
            <p class="font-semibold mb-2">Feed Cost: <span class="text-blue-600">₹${feedCost.toFixed(2)}</span></p>
            <p class="font-semibold">Total Cost: <span class="text-blue-600">₹${totalCost.toFixed(2)}</span></p>
          </div>
          <div class="bg-yellow-50 p-4 rounded-lg">
            <p class="font-semibold mb-2">Revenue: <span class="text-yellow-600">₹${revenue.toFixed(2)}</span></p>
            <p class="font-semibold">Net Profit: <span class="text-yellow-600 ${netProfit >= 0 ? '' : 'text-red-600'}">₹${netProfit.toFixed(2)}</span></p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <p class="font-semibold mb-2">Profit/Bird: <span class="text-purple-600">₹${profitPerBird.toFixed(2)}</span></p>
            <p class="font-semibold">Breakeven Price: <span class="text-purple-600">₹${breakevenPrice.toFixed(2)}/kg</span></p>
          </div>
        </div>
      `;
    }

    // Create chart if Chart.js is loaded
    if (window.Chart && chartRef.current) {
      if (window.fcrChart && typeof window.fcrChart.destroy === 'function') {
        window.fcrChart.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        window.fcrChart = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Live Birds', 'Total Weight (kg)', 'FCR', 'Net Profit (₹)'],
            datasets: [{
              label: 'Farm Overview',
              data: [liveBirds, totalWeight, fcr * 100, netProfit / 100], // Scale values for better visualization
              backgroundColor: ['#4caf50', '#2196f3', '#ff9800', netProfit >= 0 ? '#e91e63' : '#f44336'],
              borderColor: ['#388e3c', '#1976d2', '#f57c00', netProfit >= 0 ? '#c2185b' : '#d32f2f'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Poultry Farm Performance Analysis'
              },
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Values (scaled for visualization)'
                }
              }
            }
          }
        });
      }
    }
  };

  const exportToPDF = () => {
    alert("PDF export feature will be implemented soon. This will allow you to download a detailed report of your FCR calculations.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            🐥 Poultry <span className="text-green-600">FCR Calculator</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Calculate Feed Conversion Ratio and analyze your poultry farm profitability with our comprehensive calculator designed by industry experts.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Batch Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                Batch Information
              </CardTitle>
              <CardDescription>Enter your basic farm and batch details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farmerName">Farmer Name</Label>
                  <Input type="text" id="farmerName" className="mt-1" placeholder="Enter farmer name" />
                </div>
                <div>
                  <Label htmlFor="chickCount">🐥 No. of Chicks (Base) *</Label>
                  <Input type="number" id="chickCount" className="mt-1" placeholder="e.g., 1000" required />
                </div>
                <div>
                  <Label htmlFor="chickRate">💵 Chick Rate (₹/Chick) *</Label>
                  <Input type="number" id="chickRate" className="mt-1" placeholder="e.g., 45" step="0.01" required />
                </div>
                <div>
                  <Label htmlFor="placementDate">Placement Date</Label>
                  <Input type="date" id="placementDate" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="mortality">Mortality Count</Label>
                  <Input type="number" id="mortality" className="mt-1" placeholder="e.g., 20" />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Selling Price (₹/Kg) *</Label>
                  <Input type="number" id="sellingPrice" className="mt-1" placeholder="e.g., 120" step="0.01" required />
                </div>
              </div>
              <p id="warningMessage" className="text-red-600 font-semibold text-sm"></p>
            </CardContent>
          </Card>

          {/* Weight Calculation */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                Weight Calculation
              </CardTitle>
              <CardDescription>Configure weight parameters for your batch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">Weight Type:</Label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="weightType" value="perBird" defaultChecked className="mr-2" />
                    <span className="text-sm">Per Bird (kg)</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="weightType" value="totalKg" className="mr-2" />
                    <span className="text-sm">Total Kg</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="weightType" value="totalQtl" className="mr-2" />
                    <span className="text-sm">Total Quintal</span>
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="avgWeight">Avg Weight Per Bird (kg)</Label>
                <Input type="number" id="avgWeight" defaultValue="2" className="mt-1" step="0.01" placeholder="e.g., 2.5" />
                <p className="text-xs text-gray-500 mt-1">Typical broiler weight at 35-42 days: 2.0-2.5 kg</p>
              </div>
            </CardContent>
          </Card>

          {/* Feed Entry */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                Feed Entry
              </CardTitle>
              <CardDescription>Enter feed consumption details by category (50kg per bag)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium flex items-center gap-2">Pre-Starter Feed</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input type="number" id="preStarterBags" placeholder="Number of bags" step="0.1" />
                  <Input type="number" id="preStarterPrice" placeholder="Price per bag (₹)" step="0.01" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Typically used for 0-10 days</p>
              </div>
              <div>
                <Label className="text-base font-medium flex items-center gap-2">Starter Feed</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input type="number" id="starterBags" placeholder="Number of bags" step="0.1" />
                  <Input type="number" id="starterPrice" placeholder="Price per bag (₹)" step="0.01" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Typically used for 11-21 days</p>
              </div>
              <div>
                <Label className="text-base font-medium flex items-center gap-2">Finisher Feed</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input type="number" id="finisherBags" placeholder="Number of bags" step="0.1" />
                  <Input type="number" id="finisherPrice" placeholder="Price per bag (₹)" step="0.01" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Typically used for 22-42 days</p>
              </div>
            </CardContent>
          </Card>

          {/* Calculate Button */}
          <div className="text-center mb-8">
            <Button 
              onClick={calculateFCR}
              size="lg" 
              className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
            >
              Calculate FCR & Profitability
            </Button>
          </div>

          {/* Output Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                Calculation Results
              </CardTitle>
              <CardDescription>Your farm performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div id="outputSummary" className="min-h-[150px] flex items-center justify-center text-gray-500 text-center">
                <div>
                  <p className="text-lg mb-2">Click "Calculate FCR & Profitability" to see detailed results</p>
                  <p className="text-sm">We'll analyze your feed efficiency, costs, and profitability</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                Performance Visualization
              </CardTitle>
              <CardDescription>Visual analysis of your farm metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <canvas ref={chartRef} id="fcrChart" className="w-full h-full"></canvas>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <Button 
                onClick={exportToPDF}
                variant="outline"
                className="bg-white text-green-600 hover:bg-gray-100 border-green-600"
              >
                Export PDF Report
              </Button>
              <Button 
                variant="outline"
                className="bg-white text-green-600 hover:bg-gray-100 border-green-600"
                onClick={() => alert("Excel export feature coming soon!")}
              >
                Export to Excel
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Professional FCR Calculator | Optimize Your Poultry Farm Performance
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FCRCalculator;