import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

declare global {
  interface Window {
    Chart: any;
    fcrChart: any;
  }
}

const FCRCalculator: React.FC = () => {
  const [results, setResults] = useState<string>("");
  const [warning, setWarning] = useState<string>("");
  const [calculationData, setCalculationData] = useState<any>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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

    // Store calculation data for PDF export
    setCalculationData({
      inputs: {
        chicks,
        chickRate,
        mortality,
        sellingPrice,
        avgWeight,
        preBags,
        prePrice,
        starterBags,
        starterPrice,
        finisherBags,
        finisherPrice
      },
      outputs: {
        totalBirds,
        liveBirds,
        totalWeight,
        chickCost,
        feedCost,
        totalCost,
        revenue,
        netProfit,
        profitPerBird,
        breakevenPrice,
        fcr
      }
    });

    setResults(`
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
    `);

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
              data: [liveBirds, totalWeight, fcr * 100, netProfit / 100],
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

  const exportToPDF = async () => {
    if (!calculationData) {
      alert("Please calculate FCR first before exporting to PDF.");
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const { inputs, outputs } = calculationData;
      
      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(34, 139, 34); // Green color
      pdf.text('Poultry FCR Calculator Report', 20, 25);
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, 35);
      pdf.text(`Time: ${new Date().toLocaleTimeString('en-IN')}`, 20, 42);
      
      // Add a line separator
      pdf.line(20, 48, 190, 48);
      
      let yPos = 58;
      
      // Batch Information Section
      pdf.setFontSize(16);
      pdf.setTextColor(34, 139, 34);
      pdf.text('Batch Information', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Number of Chicks: ${inputs.chicks.toFixed(0)}`, 20, yPos);
      pdf.text(`Chick Rate: ₹${inputs.chickRate.toFixed(2)}/chick`, 100, yPos);
      yPos += 7;
      pdf.text(`Mortality: ${inputs.mortality.toFixed(0)} birds`, 20, yPos);
      pdf.text(`Selling Price: ₹${inputs.sellingPrice.toFixed(2)}/kg`, 100, yPos);
      yPos += 7;
      pdf.text(`Average Weight: ${inputs.avgWeight.toFixed(2)} kg`, 20, yPos);
      yPos += 15;
      
      // Feed Details Section
      pdf.setFontSize(16);
      pdf.setTextColor(34, 139, 34);
      pdf.text('Feed Details', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      if (inputs.preBags > 0) {
        pdf.text(`Pre-Starter Feed: ${inputs.preBags.toFixed(1)} bags × ₹${inputs.prePrice.toFixed(2)} = ₹${(inputs.preBags * inputs.prePrice).toFixed(2)}`, 20, yPos);
        yPos += 7;
      }
      
      if (inputs.starterBags > 0) {
        pdf.text(`Starter Feed: ${inputs.starterBags.toFixed(1)} bags × ₹${inputs.starterPrice.toFixed(2)} = ₹${(inputs.starterBags * inputs.starterPrice).toFixed(2)}`, 20, yPos);
        yPos += 7;
      }
      
      if (inputs.finisherBags > 0) {
        pdf.text(`Finisher Feed: ${inputs.finisherBags.toFixed(1)} bags × ₹${inputs.finisherPrice.toFixed(2)} = ₹${(inputs.finisherBags * inputs.finisherPrice).toFixed(2)}`, 20, yPos);
        yPos += 7;
      }
      
      const totalFeedBags = inputs.preBags + inputs.starterBags + inputs.finisherBags;
      pdf.text(`Total Feed: ${totalFeedBags.toFixed(1)} bags (${(totalFeedBags * 50).toFixed(1)} kg)`, 20, yPos);
      yPos += 15;
      
      // Results Section
      pdf.setFontSize(16);
      pdf.setTextColor(34, 139, 34);
      pdf.text('Calculation Results', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      
      // Performance Metrics
      pdf.text(`Live Birds: ${outputs.liveBirds.toFixed(0)}`, 20, yPos);
      pdf.text(`Total Weight: ${outputs.totalWeight.toFixed(2)} kg`, 100, yPos);
      yPos += 8;
      
      pdf.setFontSize(14);
      pdf.setTextColor(34, 139, 34);
      pdf.text(`FCR: ${outputs.fcr.toFixed(2)}`, 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      
      // Cost Breakdown
      pdf.text('Cost Breakdown:', 20, yPos);
      yPos += 8;
      pdf.text(`• Chick Cost: ₹${outputs.chickCost.toFixed(2)}`, 25, yPos);
      yPos += 6;
      pdf.text(`• Feed Cost: ₹${outputs.feedCost.toFixed(2)}`, 25, yPos);
      yPos += 6;
      pdf.text(`• Total Cost: ₹${outputs.totalCost.toFixed(2)}`, 25, yPos);
      yPos += 10;
      
      // Revenue & Profit
      pdf.text('Revenue & Profit:', 20, yPos);
      yPos += 8;
      pdf.text(`• Revenue: ₹${outputs.revenue.toFixed(2)}`, 25, yPos);
      yPos += 6;
      
      pdf.setTextColor(outputs.netProfit >= 0 ? 34 : 220, outputs.netProfit >= 0 ? 139 : 20, outputs.netProfit >= 0 ? 34 : 20);
      pdf.text(`• Net Profit: ₹${outputs.netProfit.toFixed(2)}`, 25, yPos);
      yPos += 6;
      
      pdf.setTextColor(0, 0, 0);
      pdf.text(`• Profit per Bird: ₹${outputs.profitPerBird.toFixed(2)}`, 25, yPos);
      yPos += 6;
      pdf.text(`• Breakeven Price: ₹${outputs.breakevenPrice.toFixed(2)}/kg`, 25, yPos);
      yPos += 15;
      
      // FCR Analysis
      pdf.setFontSize(16);
      pdf.setTextColor(34, 139, 34);
      pdf.text('FCR Analysis & Recommendations', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      let fcrGrade = '';
      let recommendation = '';
      
      if (outputs.fcr < 1.6) {
        fcrGrade = 'Excellent';
        recommendation = 'Outstanding performance! Continue current practices.';
      } else if (outputs.fcr <= 1.8) {
        fcrGrade = 'Good';
        recommendation = 'Good performance. Minor optimizations can improve efficiency.';
      } else if (outputs.fcr <= 2.0) {
        fcrGrade = 'Average';
        recommendation = 'Room for improvement. Focus on feed quality and management.';
      } else {
        fcrGrade = 'Needs Improvement';
        recommendation = 'Immediate attention required. Review feed strategy and bird health.';
      }
      
      pdf.text(`FCR Grade: ${fcrGrade}`, 20, yPos);
      yPos += 8;
      pdf.text('Recommendation:', 20, yPos);
      yPos += 6;
      
      // Split long recommendation text
      const splitText = pdf.splitTextToSize(recommendation, 150);
      pdf.text(splitText, 25, yPos);
      yPos += splitText.length * 5 + 10;
      
      // Best Practices
      pdf.text('Best Practices for FCR Optimization:', 20, yPos);
      yPos += 6;
      pdf.text('• Maintain feed quality and proper storage', 25, yPos);
      yPos += 5;
      pdf.text('• Ensure consistent water supply and quality', 25, yPos);
      yPos += 5;
      pdf.text('• Monitor temperature and ventilation', 25, yPos);
      yPos += 5;
      pdf.text('• Regular health checks and vaccination schedule', 25, yPos);
      yPos += 5;
      pdf.text('• Proper waste management and biosecurity', 25, yPos);
      yPos += 10;
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Generated by Poultry Mitra - Professional Poultry Management Platform', 20, 280);
      pdf.text('Visit: https://poultry-mitra-frontend.onrender.com', 20, 285);
      
      // Save the PDF
      const fileName = `FCR_Report_${new Date().toISOString().split('T')[0]}_${Date.now()}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Poultry <span className="text-green-600">FCR Calculator</span>
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
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="chickCount">Number of Chicks *</Label>
                  <Input
                    id="chickCount"
                    type="number"
                    placeholder="e.g., 1000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="chickRate">Chick Rate (₹/chick) *</Label>
                  <Input
                    id="chickRate"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 45"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mortality">Mortality Count</Label>
                  <Input
                    id="mortality"
                    type="number"
                    placeholder="e.g., 20"
                    defaultValue="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Selling Price (₹/kg) *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 180"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="avgWeight">Average Weight (kg)</Label>
                  <Input
                    id="avgWeight"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 2.2"
                    defaultValue="2"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feed Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-blue-600 flex items-center gap-2">
                Feed Details
              </CardTitle>
              <CardDescription>Enter feed consumption details for different phases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Pre-Starter Feed */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-3">Pre-Starter Feed (0-10 days)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preStarterBags">Number of Bags (50kg each)</Label>
                      <Input
                        id="preStarterBags"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 3"
                        defaultValue="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="preStarterPrice">Price per Bag (₹)</Label>
                      <Input
                        id="preStarterPrice"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 2200"
                        defaultValue="0"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Starter Feed */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-3">Starter Feed (11-21 days)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="starterBags">Number of Bags (50kg each)</Label>
                      <Input
                        id="starterBags"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 8"
                        defaultValue="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="starterPrice">Price per Bag (₹)</Label>
                      <Input
                        id="starterPrice"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 2000"
                        defaultValue="0"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Finisher Feed */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-3">Finisher Feed (22+ days)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="finisherBags">Number of Bags (50kg each)</Label>
                      <Input
                        id="finisherBags"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 25"
                        defaultValue="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="finisherPrice">Price per Bag (₹)</Label>
                      <Input
                        id="finisherPrice"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 1900"
                        defaultValue="0"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculate Button */}
          <div className="text-center mb-8">
            <Button 
              onClick={calculateFCR}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
            >
              Calculate FCR & Profitability
            </Button>
          </div>

          {/* Warning Message */}
          {warning && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">{warning}</p>
            </div>
          )}

          {/* Results */}
          {results && (
            <Card className="mb-8" ref={resultsRef}>
              <CardHeader>
                <CardTitle className="text-purple-600 flex items-center gap-2">
                  Calculation Results
                </CardTitle>
                <CardDescription>Comprehensive analysis of your poultry farm performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  dangerouslySetInnerHTML={{ __html: results }}
                  className="mb-6"
                />
                
                {/* Export Button */}
                <div className="text-center">
                  <Button 
                    onClick={exportToPDF}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    📄 Export Detailed PDF Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-orange-600 flex items-center gap-2">
                Performance Visualization
              </CardTitle>
              <CardDescription>Visual representation of your farm metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <canvas ref={chartRef} className="w-full h-full"></canvas>
              </div>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-blue-600 flex items-center gap-2">
                Expert Tips
              </CardTitle>
              <CardDescription>Industry best practices for optimal FCR</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">Target FCR Values:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Excellent: Below 1.6</li>
                    <li>• Good: 1.6 - 1.8</li>
                    <li>• Average: 1.8 - 2.0</li>
                    <li>• Needs Improvement: Above 2.0</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">Improvement Tips:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Ensure proper feed quality</li>
                    <li>• Maintain optimal temperature</li>
                    <li>• Regular health monitoring</li>
                    <li>• Proper water management</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default FCRCalculator;
