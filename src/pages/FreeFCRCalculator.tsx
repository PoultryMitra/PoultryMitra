import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Calculator, Bird, TrendingUp, AlertCircle, CheckCircle, Globe, BarChart3 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FreeFCRCalculator = () => {
  const [language, setLanguage] = useState("hi");
  const [formData, setFormData] = useState({
    totalFeedConsumed: "",
    totalWeightGain: "",
    mortalityRate: "",
    numberOfBirds: ""
  });
  
  const [result, setResult] = useState<{
    fcr: number;
    efficiency: string;
    suggestions: string[];
    profitAnalysis: string;
  } | null>(null);

  const content = {
    hi: {
      title: "मुफ्त FCR कैलकुलेटर",
      subtitle: "अपने पोल्ट्री फार्म की फीड कन्वर्जन रेट कैलकुलेट करें",
      form: {
        feedConsumed: "कुल दाना खपत (किग्रा)",
        weightGain: "कुल वजन बढ़ोतरी (किग्रा)", 
        mortality: "मृत्यु दर (%)",
        birds: "मुर्गियों की संख्या",
        calculate: "FCR कैलकुलेट करें",
        clear: "साफ करें"
      },
      results: {
        yourFCR: "आपका FCR",
        efficiency: "दक्षता",
        excellent: "उत्कृष्ट",
        good: "अच्छा",
        average: "औसत",
        needsImprovement: "सुधार की जरूरत",
        suggestions: "सुझाव",
        profitAnalysis: "लाभ विश्लेषण"
      },
      suggestions: {
        excellent: [
          "बहुत बढ़िया! आपका FCR उत्कृष्ट है",
          "वर्तमान फीड क्वालिटी बनाए रखें",
          "नियमित स्वास्थ्य जांच जारी रखें"
        ],
        good: [
          "अच्छा प्रदर्शन, थोड़ा सुधार संभव है",
          "फीड की गुणवत्ता पर ध्यान दें",
          "पानी की साफ-सफाई सुनिश्चित करें"
        ],
        average: [
          "फीड की गुणवत्ता सुधारें",
          "वेंटिलेशन सिस्टम चेक करें",
          "नियमित वैक्सीनेशन कराएं"
        ],
        poor: [
          "तुरंत सुधार की जरूरत",
          "फीड सप्लायर बदलने पर विचार करें",
          "पशु चिकित्सक से सलाह लें"
        ]
      },
      cta: {
        title: "और भी फीचर्स चाहिए?",
        subtitle: "रजिस्टर करें और पाएं:",
        features: [
          "विस्तृत रिपोर्ट्स",
          "खर्च ट्रैकिंग",
          "बाजार भाव अपडेट",
          "एक्सपर्ट सलाह"
        ],
        button: "मुफ्त रजिस्टर करें"
      }
    },
    en: {
      title: "Free FCR Calculator",
      subtitle: "Calculate your poultry farm's Feed Conversion Rate",
      form: {
        feedConsumed: "Total Feed Consumed (kg)",
        weightGain: "Total Weight Gain (kg)",
        mortality: "Mortality Rate (%)",
        birds: "Number of Birds",
        calculate: "Calculate FCR",
        clear: "Clear"
      },
      results: {
        yourFCR: "Your FCR",
        efficiency: "Efficiency",
        excellent: "Excellent",
        good: "Good", 
        average: "Average",
        needsImprovement: "Needs Improvement",
        suggestions: "Suggestions",
        profitAnalysis: "Profit Analysis"
      },
      suggestions: {
        excellent: [
          "Excellent! Your FCR is outstanding",
          "Maintain current feed quality",
          "Continue regular health checks"
        ],
        good: [
          "Good performance, slight improvement possible",
          "Focus on feed quality",
          "Ensure clean water supply"
        ],
        average: [
          "Improve feed quality",
          "Check ventilation system",
          "Regular vaccination needed"
        ],
        poor: [
          "Immediate improvement needed",
          "Consider changing feed supplier",
          "Consult veterinarian"
        ]
      },
      cta: {
        title: "Want More Features?",
        subtitle: "Register and get:",
        features: [
          "Detailed Reports",
          "Expense Tracking", 
          "Market Rate Updates",
          "Expert Advice"
        ],
        button: "Register Free"
      }
    }
  };

  const t = content[language as keyof typeof content];

  const calculateFCR = () => {
    const feedConsumed = parseFloat(formData.totalFeedConsumed);
    const weightGain = parseFloat(formData.totalWeightGain);
    const mortality = parseFloat(formData.mortalityRate) || 0;
    const birds = parseInt(formData.numberOfBirds);

    if (!feedConsumed || !weightGain || !birds) {
      alert(language === 'hi' ? 'कृपया सभी फील्ड भरें' : 'Please fill all fields');
      return;
    }

    // Adjust for mortality
    const liveBirds = birds - (birds * mortality / 100);
    const fcr = feedConsumed / weightGain;
    
    let efficiency = "";
    let suggestions: string[] = [];
    
    if (fcr <= 1.6) {
      efficiency = t.results.excellent;
      suggestions = t.suggestions.excellent;
    } else if (fcr <= 1.8) {
      efficiency = t.results.good;
      suggestions = t.suggestions.good;
    } else if (fcr <= 2.2) {
      efficiency = t.results.average;
      suggestions = t.suggestions.average;
    } else {
      efficiency = t.results.needsImprovement;
      suggestions = t.suggestions.poor;
    }

    const profitAnalysis = language === 'hi' 
      ? `${liveBirds} जीवित मुर्गियों के साथ, आपका FCR ${fcr.toFixed(2)} है। कम FCR = ज्यादा मुनाफा!`
      : `With ${liveBirds} live birds, your FCR is ${fcr.toFixed(2)}. Lower FCR = Higher Profit!`;

    setResult({
      fcr: parseFloat(fcr.toFixed(2)),
      efficiency,
      suggestions,
      profitAnalysis
    });
  };

  const clearForm = () => {
    setFormData({
      totalFeedConsumed: "",
      totalWeightGain: "",
      mortalityRate: "",
      numberOfBirds: ""
    });
    setResult(null);
  };

  const toggleLanguage = () => {
    setLanguage(language === "hi" ? "en" : "hi");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center gap-2">
              <Bird className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-green-600">Poultry Mitra</h1>
            </Link>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center gap-2"
              >
                <Globe size={16} />
                {language === 'hi' ? 'EN' : 'हिं'}
              </Button>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  {language === 'hi' ? 'लॉग इन' : 'Login'}
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-green-600 hover:bg-green-700" size="sm">
                  {language === 'hi' ? 'रजिस्टर करें' : 'Register'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Calculator className="w-4 h-4" />
            {language === 'hi' ? '100% मुफ्त' : '100% Free'}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Calculator className="w-6 h-6 text-green-600" />
                FCR Calculator
              </CardTitle>
              <CardDescription>
                {language === 'hi' 
                  ? 'अपने फार्म की जानकारी भरें' 
                  : 'Enter your farm details'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="birds">{t.form.birds}</Label>
                <Input
                  id="birds"
                  type="number"
                  placeholder="5000"
                  value={formData.numberOfBirds}
                  onChange={(e) => setFormData({...formData, numberOfBirds: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feed">{t.form.feedConsumed}</Label>
                <Input
                  id="feed"
                  type="number"
                  step="0.1"
                  placeholder="9000"
                  value={formData.totalFeedConsumed}
                  onChange={(e) => setFormData({...formData, totalFeedConsumed: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">{t.form.weightGain}</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="5000"
                  value={formData.totalWeightGain}
                  onChange={(e) => setFormData({...formData, totalWeightGain: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mortality">{t.form.mortality}</Label>
                <Input
                  id="mortality"
                  type="number"
                  step="0.1"
                  placeholder="3"
                  value={formData.mortalityRate}
                  onChange={(e) => setFormData({...formData, mortalityRate: e.target.value})}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={calculateFCR}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  {t.form.calculate}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearForm}
                >
                  {t.form.clear}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-blue-50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl text-green-600">
                      {t.results.yourFCR}: {result.fcr}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {t.results.efficiency}: <span className="font-semibold text-green-700">{result.efficiency}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                      <p className="text-gray-700">{result.profitAnalysis}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      {t.results.suggestions}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.suggestions.map((suggestion, index) => (
                      <Alert key={index} className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          {suggestion}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="shadow-xl border-0 bg-gray-50">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Calculator className="w-20 h-20 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {language === 'hi' ? 'FCR कैलकुलेट करने के लिए डेटा भरें' : 'Fill in the data to calculate FCR'}
                  </h3>
                  <p className="text-gray-500">
                    {language === 'hi' 
                      ? 'आपका रिजल्ट यहां दिखेगा' 
                      : 'Your results will appear here'
                    }
                  </p>
                </CardContent>
              </Card>
            )}

            {/* CTA Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-600 to-green-600 text-white">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{t.cta.title}</CardTitle>
                <CardDescription className="text-blue-100 text-lg">
                  {t.cta.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {t.cta.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-300" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link to="/register" className="block">
                  <Button className="w-full bg-white text-green-600 hover:bg-gray-100 font-semibold">
                    <Bird className="w-4 h-4 mr-2" />
                    {t.cta.button}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FCR Information */}
        <Card className="mt-12 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {language === 'hi' ? 'FCR क्या है?' : 'What is FCR?'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {language === 'hi' ? (
              <div className="space-y-4 text-gray-700">
                <p><strong>FCR (Feed Conversion Ratio)</strong> एक महत्वपूर्ण मापदंड है जो बताता है कि आपकी मुर्गियां कितने किलो दाना खाकर कितना वजन बढ़ाती हैं।</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p><strong>FCR = कुल दाना खपत ÷ कुल वजन बढ़ोतरी</strong></p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">बेहतर FCR के फायदे:</h4>
                    <ul className="space-y-1">
                      <li>• कम दाना खर्च</li>
                      <li>• ज्यादा मुनाफा</li>
                      <li>• बेहतर दक्षता</li>
                      <li>• कम लागत</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2">FCR सुधारने के तरीके:</h4>
                    <ul className="space-y-1">
                      <li>• गुणवत्तापूर्ण दाना</li>
                      <li>• साफ पानी</li>
                      <li>• बेहतर वेंटिलेशन</li>
                      <li>• नियमित स्वास्थ्य जांच</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-gray-700">
                <p><strong>FCR (Feed Conversion Ratio)</strong> is a crucial metric that shows how much feed your birds consume to gain weight.</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p><strong>FCR = Total Feed Consumed ÷ Total Weight Gain</strong></p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">Benefits of Better FCR:</h4>
                    <ul className="space-y-1">
                      <li>• Lower feed costs</li>
                      <li>• Higher profits</li>
                      <li>• Better efficiency</li>
                      <li>• Reduced expenses</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2">Ways to Improve FCR:</h4>
                    <ul className="space-y-1">
                      <li>• Quality feed</li>
                      <li>• Clean water</li>
                      <li>• Better ventilation</li>
                      <li>• Regular health checks</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreeFCRCalculator;
