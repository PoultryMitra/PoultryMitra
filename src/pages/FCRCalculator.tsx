import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEnhancedTranslation } from "@/contexts/EnhancedTranslationContext";
import { TranslationStatus } from "@/components/TranslationComponents";

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
  
  // Translation setup
  const { t, language } = useEnhancedTranslation();

  // Enhanced translation helper that prioritizes Google Translate
  const bt = (key: string): string => {
    // First try Enhanced Translation Context (Google Translate)
    const dynamicTranslation = t(key);
    if (dynamicTranslation && dynamicTranslation !== key) {
      console.log(`🌍 Google Translate used for FCRCalculator: ${key} -> ${dynamicTranslation}`);
      return dynamicTranslation;
    }

    // Fallback to local content - fix the nested structure lookup
    const localContent = content[key as keyof typeof content];
    if (localContent && typeof localContent === 'object') {
      const translatedValue = localContent[language as keyof typeof localContent];
      if (translatedValue) {
        console.log(`📚 Static content used for FCRCalculator: ${key} -> ${translatedValue}`);
        return translatedValue as string;
      }
    }
    
    const result = key;
    console.log(`⚠️ No translation found for FCRCalculator: ${key}`);
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
    chickCount: { en: "No. of Chicks (Base)", hi: "चूजों की संख्या (आधार)" },
    chickCountPlaceholder: { en: "e.g., 1000", hi: "जैसे, 1000" },
    chickRate: { en: "Chick Rate (₹/Chick)", hi: "चूजा दर (₹/चूजा)" },
    chickRatePlaceholder: { en: "e.g., 45", hi: "जैसे, 45" },
    placementDate: { en: "Placement Date", hi: "प्लेसमेंट दिनांक" },
    mortality: { en: "Mortality Count", hi: "मृत्यु दर संख्या" },
    mortalityPlaceholder: { en: "e.g., 20", hi: "जैसे, 20" },
    sellingPrice: { en: "Selling Price (₹/Kg)", hi: "विक्रय मूल्य (₹/किग्रा)" },
    sellingPricePlaceholder: { en: "e.g., 120", hi: "जैसे, 120" },
    
    // Weight calculation section
    weightCalcTitle: { en: "Weight Calculation", hi: "वजन गणना" },
    weightCalcDesc: { en: "Configure weight parameters for your batch", hi: "अपने बैच के लिए वजन पैरामीटर कॉन्फ़िगर करें" },
    weightType: { en: "Weight Type:", hi: "वजन प्रकार:" },
    perBird: { en: "Per Bird (kg)", hi: "प्रति चूजा (किग्रा)" },
    totalKg: { en: "Total Kg", hi: "कुल किग्रा" },
    avgWeight: { en: "Average Weight/Bird", hi: "औसत वजन/चूजा" },
    totalWeight: { en: "Total Weight (kg)", hi: "कुल वजन (किग्रा)" },
    
    // Feed information section  
    feedInfoTitle: { en: "Feed Information", hi: "आहार जानकारी" },
    feedInfoDesc: { en: "Enter feed consumption and pricing details", hi: "आहार खपत और मूल्य विवरण दर्ज करें" },
    preStarterBags: { en: "Pre-Starter Bags (50kg each)", hi: "प्री-स्टार्टर बैग (प्रत्येक 50 किग्रा)" },
    preStarterPrice: { en: "Pre-Starter Price (₹/Bag)", hi: "प्री-स्टार्टर मूल्य (₹/बैग)" },
    starterBags: { en: "Starter Bags (50kg each)", hi: "स्टार्टर बैग (प्रत्येक 50 किग्रा)" },
    starterPrice: { en: "Starter Price (₹/Bag)", hi: "स्टार्टर मूल्य (₹/बैग)" },
    finisherBags: { en: "Finisher Bags (50kg each)", hi: "फिनिशर बैग (प्रत्येक 50 किग्रा)" },
    finisherPrice: { en: "Finisher Price (₹/Bag)", hi: "फिनिशर मूल्य (₹/बैग)" },
    
    // Calculate button and results
    calculateButton: { en: "Calculate FCR & Profitability", hi: "एफसीआर और लाभप्रदता की गणना करें" },
    resultsTitle: { en: "Calculation Results", hi: "गणना परिणाम" },
    resultsDesc: { en: "Detailed analysis of your poultry farm performance", hi: "आपके पोल्ट्री फार्म के प्रदर्शन का विस्तृत विश्लेषण" },
    clickToCalculate: { en: "Click \"Calculate FCR & Profitability\" to see detailed results", hi: "विस्तृत परिणाम देखने के लिए \"एफसीआर और लाभप्रदता की गणना करें\" पर क्लिक करें" },
    analyzeText: { en: "We'll analyze your feed efficiency, costs, and profitability", hi: "हम आपकी फीड दक्षता, लागत और लाभप्रदता का विश्लेषण करेंगे" },
    
    // Performance visualization
    performanceTitle: { en: "Performance Visualization", hi: "प्रदर्शन विज़ुअलाइज़ेशन" },
    performanceDesc: { en: "Visual analysis of your farm metrics", hi: "आपके फार्म मेट्रिक्स का दृश्य विश्लेषण" },
    
    // Export buttons
    exportPDF: { en: "Export PDF Report", hi: "पीडीएफ रिपोर्ट निर्यात करें" },
    exportExcel: { en: "Export to Excel", hi: "एक्सेल में निर्यात करें" },
    footerText: { en: "Professional FCR Calculator | Optimize Your Poultry Farm Performance", hi: "पेशेवर एफसीआर कैलकुलेटर | अपने पोल्ट्री फार्म के प्रदर्शन को अनुकूलित करें" },
    
    // Warnings and messages
    fillAllFields: { en: "Please fill all required fields correctly.", hi: "कृपया सभी आवश्यक फ़ील्ड सही तरीके से भरें।" },
    pdfExportSoon: { en: "PDF export feature will be implemented soon. This will allow you to download a detailed report of your FCR calculations.", hi: "पीडीएफ निर्यात सुविधा जल्द ही लागू की जाएगी। यह आपको अपने एफसीआर गणनाओं की विस्तृत रिपोर्ट डाउनलोड करने की अनुमति देगा।" },
    excelExportSoon: { en: "Excel export feature coming soon!", hi: "एक्सेल निर्यात सुविधा जल्द आ रही है!" },
    
    // Result labels for dynamic content
    liveBirds: { en: "Live Birds", hi: "जीवित चूजे" },
    totalWeightLabel: { en: "Total Weight", hi: "कुल वजन" },
    fcrLabel: { en: "FCR", hi: "एफसीआर" },
    chickCost: { en: "Chick Cost", hi: "चूजा लागत" },
    feedCost: { en: "Feed Cost", hi: "आहार लागत" },
    totalCost: { en: "Total Cost", hi: "कुल लागत" },
    revenue: { en: "Revenue", hi: "आय" },
    netProfit: { en: "Net Profit", hi: "शुद्ध लाभ" },
    profitPerBird: { en: "Profit/Bird", hi: "लाभ/चूजा" },
    breakevenPrice: { en: "Breakeven Price", hi: "ब्रेकईवन मूल्य" },
    
    // Chart labels
    farmOverview: { en: "Farm Overview", hi: "फार्म अवलोकन" },
    chartTitle: { en: "Poultry Farm Performance Analysis", hi: "पोल्ट्री फार्म प्रदर्शन विश्लेषण" },
    valuesScaled: { en: "Values (scaled for visualization)", hi: "मान (विज़ुअलाइज़ेशन के लिए स्केल किए गए)" }
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

    const outputElement = document.getElementById('outputSummary');
    if (outputElement) {
      outputElement.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="bg-green-50 p-4 rounded-lg">
            <p class="font-semibold mb-2">${bt('liveBirds')}: <span class="text-green-600">${liveBirds.toFixed(0)}</span></p>
            <p class="font-semibold mb-2">${bt('totalWeightLabel')}: <span class="text-green-600">${totalWeight.toFixed(2)} kg</span></p>
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
            labels: [bt('liveBirds'), `${bt('totalWeightLabel')} (kg)`, bt('fcrLabel'), `${bt('netProfit')} (₹)`],
            datasets: [{
              label: bt('farmOverview'),
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
                  text: bt('valuesScaled')
                }
              }
            }
          }
        });
      }
    }
  };

  const exportToPDF = () => {
    alert(bt('pdfExportSoon'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Translation Status */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <TranslationStatus />
      </div>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            🐥 {bt('title')}
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farmerName">{bt('farmerName')}</Label>
                  <Input type="text" id="farmerName" className="mt-1" placeholder={bt('farmerNamePlaceholder')} />
                </div>
                <div>
                  <Label htmlFor="chickCount">🐥 {bt('chickCount')} *</Label>
                  <Input type="number" id="chickCount" className="mt-1" placeholder={bt('chickCountPlaceholder')} required />
                </div>
                <div>
                  <Label htmlFor="chickRate">💵 {bt('chickRate')} *</Label>
                  <Input type="number" id="chickRate" className="mt-1" placeholder={bt('chickRatePlaceholder')} step="0.01" required />
                </div>
                <div>
                  <Label htmlFor="placementDate">{bt('placementDate')}</Label>
                  <Input type="date" id="placementDate" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="mortality">{bt('mortality')}</Label>
                  <Input type="number" id="mortality" className="mt-1" placeholder={bt('mortalityPlaceholder')} />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">{bt('sellingPrice')} *</Label>
                  <Input type="number" id="sellingPrice" className="mt-1" placeholder={bt('sellingPricePlaceholder')} step="0.01" required />
                </div>
              </div>
              <p id="warningMessage" className="text-red-600 font-semibold text-sm">{warning}</p>
            </CardContent>
          </Card>

          {/* Weight Calculation */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                {bt('weightCalcTitle')}
              </CardTitle>
              <CardDescription>{bt('weightCalcDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">{bt('weightType')}</Label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="weightType" value="perBird" defaultChecked className="mr-2" />
                    <span className="text-sm">{bt('perBird')}</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="weightType" value="totalKg" className="mr-2" />
                    <span className="text-sm">{bt('totalKg')}</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="weightType" value="totalQtl" className="mr-2" />
                    <span className="text-sm">Total Quintal</span>
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="avgWeight">{bt('avgWeight')} (kg)</Label>
                <Input type="number" id="avgWeight" defaultValue="2" className="mt-1" step="0.01" placeholder="e.g., 2.5" />
                <p className="text-xs text-gray-500 mt-1">Typical broiler weight at 35-42 days: 2.0-2.5 kg</p>
              </div>
            </CardContent>
          </Card>

          {/* Feed Entry */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                {bt('feedInfoTitle')}
              </CardTitle>
              <CardDescription>{bt('feedInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium flex items-center gap-2">{bt('preStarterBags')}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input type="number" id="preStarterBags" placeholder={bt('preStarterBags')} step="0.1" />
                  <Input type="number" id="preStarterPrice" placeholder={bt('preStarterPrice')} step="0.01" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Typically used for 0-10 days</p>
              </div>
              <div>
                <Label className="text-base font-medium flex items-center gap-2">{bt('starterBags')}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input type="number" id="starterBags" placeholder={bt('starterBags')} step="0.1" />
                  <Input type="number" id="starterPrice" placeholder={bt('starterPrice')} step="0.01" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Typically used for 11-21 days</p>
              </div>
              <div>
                <Label className="text-base font-medium flex items-center gap-2">{bt('finisherBags')}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input type="number" id="finisherBags" placeholder={bt('finisherBags')} step="0.1" />
                  <Input type="number" id="finisherPrice" placeholder={bt('finisherPrice')} step="0.01" />
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
              {bt('calculateButton')}
            </Button>
          </div>

          {/* Output Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                {bt('resultsTitle')}
              </CardTitle>
              <CardDescription>{bt('resultsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div id="outputSummary" className="min-h-[150px] flex items-center justify-center text-gray-500 text-center">
                <div>
                  <p className="text-lg mb-2">{bt('clickToCalculate')}</p>
                  <p className="text-sm">{bt('analyzeText')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                {bt('performanceTitle')}
              </CardTitle>
              <CardDescription>{bt('performanceDesc')}</CardDescription>
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
                {bt('exportPDF')}
              </Button>
              <Button 
                variant="outline"
                className="bg-white text-green-600 hover:bg-gray-100 border-green-600"
                onClick={() => alert(bt('excelExportSoon'))}
              >
                {bt('exportExcel')}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              {bt('footerText')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FCRCalculator;