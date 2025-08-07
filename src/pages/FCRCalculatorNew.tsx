import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useEnhancedTranslation } from "@/contexts/EnhancedTranslationContext";
import { LanguageToggle, TranslationStatus } from "@/components/TranslationComponents";

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

  // Translation setup
  const { t, language } = useEnhancedTranslation();

  // Enhanced translation helper that prioritizes Google Translate
  const bt = (key: string): string => {
    // First try Enhanced Translation Context (Google Translate)
    const dynamicTranslation = t(key);
    if (dynamicTranslation && dynamicTranslation !== key) {
      console.log(`🌍 Google Translate used for FCRCalculatorNew: ${key} -> ${dynamicTranslation}`);
      return dynamicTranslation;
    }

    // Fallback to local content - fix the nested structure lookup
    const localContent = content[key as keyof typeof content];
    if (localContent && typeof localContent === 'object') {
      const translatedValue = localContent[language as keyof typeof localContent];
      if (translatedValue) {
        console.log(`📚 Static content used for FCRCalculatorNew: ${key} -> ${translatedValue}`);
        return translatedValue as string;
      }
    }
    
    const result = key;
    console.log(`⚠️ No translation found for FCRCalculatorNew: ${key}`);
    return result;
  };

  // Content object for translations
  const content = {
    // Page title and hero section
    title: { en: "Poultry FCR Calculator", hi: "पोल्ट्री एफसीआर कैलकुलेटर" },
    subtitle: { en: "Calculate Feed Conversion Ratio and analyze your poultry farm profitability with our comprehensive calculator designed by industry experts.", hi: "उद्योग विशेषज्ञों द्वारा डिज़ाइन किए गए हमारे व्यापक कैलकुलेटर के साथ फीड कन्वर्जन अनुपात की गणना करें और अपने पोल्ट्री फार्म की लाभप्रदता का विश्लेषण करें।" },
    
    // Batch information section
    batchInfoTitle: { en: "Batch Information", hi: "बैच जानकारी" },
    batchInfoDesc: { en: "Enter your basic farm and batch details", hi: "अपने बुनियादी फार्म और बैच विवरण दर्ज करें" },
    farmerName: { en: "Farmer Name", hi: "किसान का नाम" },
    farmerNamePlaceholder: { en: "Enter farmer name", hi: "किसान का नाम दर्ज करें" },
    chickCount: { en: "Number of Chicks", hi: "चूजों की संख्या" },
    chickCountPlaceholder: { en: "e.g., 1000", hi: "जैसे, 1000" },
    chickRate: { en: "Chick Rate (₹/Chick)", hi: "चूजा दर (₹/चूजा)" },
    chickRatePlaceholder: { en: "e.g., 45", hi: "जैसे, 45" },
    placementDate: { en: "Placement Date", hi: "प्लेसमेंट दिनांक" },
    mortality: { en: "Mortality Count", hi: "मृत्यु दर संख्या" },
    mortalityPlaceholder: { en: "e.g., 20", hi: "जैसे, 20" },
    sellingPrice: { en: "Selling Price (₹/Kg)", hi: "विक्रय मूल्य (₹/किग्रा)" },
    sellingPricePlaceholder: { en: "e.g., 180", hi: "जैसे, 180" },
    
    // Weight calculation section
    avgWeight: { en: "Average Weight/Bird", hi: "औसत वजन/चूजा" },
    avgWeightKg: { en: "Average Weight (kg)", hi: "औसत वजन (किग्रा)" },
    
    // Feed information section  
    feedDetailsTitle: { en: "Feed Details", hi: "आहार विवरण" },
    feedDetailsDesc: { en: "Enter feed consumption details for different phases", hi: "विभिन्न चरणों के लिए आहार खपत विवरण दर्ज करें" },
    preStarterFeed: { en: "Pre-Starter Feed (0-10 days)", hi: "प्री-स्टार्टर आहार (0-10 दिन)" },
    starterFeed: { en: "Starter Feed (11-21 days)", hi: "स्टार्टर आहार (11-21 दिन)" },
    finisherFeed: { en: "Finisher Feed (22+ days)", hi: "फिनिशर आहार (22+ दिन)" },
    numberOfBags: { en: "Number of Bags (50kg each)", hi: "बैगों की संख्या (प्रत्येक 50 किग्रा)" },
    pricePerBag: { en: "Price per Bag (₹)", hi: "प्रति बैग मूल्य (₹)" },
    
    // Calculate button and results
    calculateButton: { en: "Calculate FCR & Profitability", hi: "एफसीआर और लाभप्रदता की गणना करें" },
    
    // Performance visualization
    performanceTitle: { en: "Performance Visualization", hi: "प्रदर्शन विज़ुअलाइज़ेशन" },
    performanceDesc: { en: "Visual representation of your farm metrics", hi: "आपके फार्म मेट्रिक्स का दृश्य प्रतिनिधित्व" },
    chartTitle: { en: "Poultry Farm Performance Analysis", hi: "पोल्ट्री फार्म प्रदर्शन विश्लेषण" },
    
    // Expert tips section
    expertTips: { en: "Expert Tips", hi: "विशेषज्ञ सुझाव" },
    expertTipsDesc: { en: "Industry best practices for optimal FCR", hi: "इष्टतम एफसीआर के लिए उद्योग की सर्वोत्तम प्रथाएं" },
    targetFCRValues: { en: "Target FCR Values:", hi: "लक्षित एफसीआर मान:" },
    excellent: { en: "Excellent: Below 1.6", hi: "उत्कृष्ट: 1.6 से नीचे" },
    good: { en: "Good: 1.6 - 1.8", hi: "अच्छा: 1.6 - 1.8" },
    average: { en: "Average: 1.8 - 2.0", hi: "औसत: 1.8 - 2.0" },
    needsImprovement: { en: "Needs Improvement: Above 2.0", hi: "सुधार की आवश्यकता: 2.0 से ऊपर" },
    improvementTips: { en: "Improvement Tips:", hi: "सुधार के सुझाव:" },
    tip1: { en: "Ensure proper feed quality", hi: "उचित आहार गुणवत्ता सुनिश्चित करें" },
    tip2: { en: "Maintain optimal temperature", hi: "इष्टतम तापमान बनाए रखें" },
    tip3: { en: "Regular health monitoring", hi: "नियमित स्वास्थ्य निगरानी" },
    
    // Warnings and messages
    fillAllFields: { en: "Please fill all required fields correctly.", hi: "कृपया सभी आवश्यक फ़ील्ड सही तरीके से भरें।" },
    calculateFirstPDF: { en: "Please calculate FCR first before exporting to PDF.", hi: "कृपया PDF निर्यात करने से पहले FCR की गणना करें।" },
    pdfError: { en: "Error generating PDF. Please try again.", hi: "PDF जनरेट करने में त्रुटि। कृपया पुन: प्रयास करें।" },
    exportButton: { en: "📄 Export Detailed PDF Report", hi: "📄 विस्तृत PDF रिपोर्ट निर्यात करें" },
    
    // Result labels
    liveBirds: { en: "Live Birds", hi: "जीवित चूजे" },
    totalWeight: { en: "Total Weight", hi: "कुल वजन" },
    fcrLabel: { en: "FCR", hi: "एफसीआर" },
    chickCost: { en: "Chick Cost", hi: "चूजा लागत" },
    feedCost: { en: "Feed Cost", hi: "आहार लागत" },
    totalCost: { en: "Total Cost", hi: "कुल लागत" },
    revenue: { en: "Revenue", hi: "आय" },
    netProfit: { en: "Net Profit", hi: "शुद्ध लाभ" },
    profitPerBird: { en: "Profit/Bird", hi: "लाभ/चूजा" },
    breakevenPrice: { en: "Breakeven Price", hi: "ब्रेकईवन मूल्य" }
  };

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
      setWarning(bt('fillAllFields'));
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
          <p class="font-semibold mb-2">${bt('liveBirds')}: <span class="text-green-600">${liveBirds.toFixed(0)}</span></p>
          <p class="font-semibold mb-2">${bt('totalWeight')}: <span class="text-green-600">${totalWeight.toFixed(2)} kg</span></p>
          <p class="font-semibold">${bt('fcrLabel')}: <span class="text-green-600">${fcr.toFixed(2)}</span></p>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg">
          <p class="font-semibold mb-2">${bt('chickCost')}: <span class="text-blue-600">₹${chickCost.toFixed(2)}</span></p>
          <p class="font-semibold mb-2">${bt('feedCost')}: <span class="text-blue-600">₹${feedCost.toFixed(2)}</span></p>
          <p class="font-semibold">${bt('totalCost')}: <span class="text-blue-600">₹${totalCost.toFixed(2)}</span></p>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg">
          <p class="font-semibold mb-2">${bt('revenue')}: <span class="text-yellow-600">₹${revenue.toFixed(2)}</span></p>
          <p class="font-semibold">${bt('netProfit')}: <span class="text-yellow-600 ${netProfit >= 0 ? '' : 'text-red-600'}">₹${netProfit.toFixed(2)}</span></p>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <p class="font-semibold mb-2">${bt('profitPerBird')}: <span class="text-purple-600">₹${profitPerBird.toFixed(2)}</span></p>
          <p class="font-semibold">${bt('breakevenPrice')}: <span class="text-purple-600">₹${breakevenPrice.toFixed(2)}/kg</span></p>
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
            labels: [bt('liveBirds'), bt('totalWeight') + ' (kg)', bt('fcrLabel'), bt('netProfit') + ' (₹)'],
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
                text: bt('chartTitle')
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
      alert(bt('calculateFirstPDF'));
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
      alert(bt('pdfError'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {bt('title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {bt('subtitle')}
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
                {bt('batchInfoTitle')}
              </CardTitle>
              <CardDescription>{bt('batchInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="chickCount">{bt('chickCount')} *</Label>
                  <Input
                    id="chickCount"
                    type="number"
                    placeholder={bt('chickCountPlaceholder')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="chickRate">{bt('chickRate')} *</Label>
                  <Input
                    id="chickRate"
                    type="number"
                    step="0.01"
                    placeholder={bt('chickRatePlaceholder')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mortality">{bt('mortality')}</Label>
                  <Input
                    id="mortality"
                    type="number"
                    placeholder={bt('mortalityPlaceholder')}
                    defaultValue="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">{bt('sellingPrice')} *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    placeholder={bt('sellingPricePlaceholder')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="avgWeight">{bt('avgWeightKg')} *</Label>
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
                {bt('feedDetailsTitle')}
              </CardTitle>
              <CardDescription>{bt('feedDetailsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Pre-Starter Feed */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-3">{bt('preStarterFeed')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preStarterBags">{bt('numberOfBags')}</Label>
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
                      <Label htmlFor="preStarterPrice">{bt('pricePerBag')}</Label>
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
                  <h4 className="font-semibold text-gray-700 mb-3">{bt('starterFeed')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="starterBags">{bt('numberOfBags')}</Label>
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
                      <Label htmlFor="starterPrice">{bt('pricePerBag')}</Label>
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
                  <h4 className="font-semibold text-gray-700 mb-3">{bt('finisherFeed')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="finisherBags">{bt('numberOfBags')}</Label>
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
                      <Label htmlFor="finisherPrice">{bt('pricePerBag')}</Label>
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
              {bt('calculateButton')}
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
                    {bt('exportButton')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-orange-600 flex items-center gap-2">
                {bt('performanceTitle')}
              </CardTitle>
              <CardDescription>{bt('performanceDesc')}</CardDescription>
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
                {bt('expertTips')}
              </CardTitle>
              <CardDescription>{bt('expertTipsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">{bt('targetFCRValues')}</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {bt('excellent')}</li>
                    <li>• {bt('good')}</li>
                    <li>• {bt('average')}</li>
                    <li>• {bt('needsImprovement')}</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">{bt('improvementTips')}</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {bt('tip1')}</li>
                    <li>• {bt('tip2')}</li>
                    <li>• {bt('tip3')}</li>
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
