import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Droplets,
  Wheat,
  Home,
  Syringe,
  Globe
} from 'lucide-react';

const DiseaseRiskCalculator = () => {
  const [language, setLanguage] = useState("hi");
  const [inputs, setInputs] = useState({
    birdAge: '',
    vaccinationDone: 'yes',
    litterCondition: 'dry',
    feedQuality: 'good',
    waterSanitation: 'clean',
    biosecurityLevel: 'high',
    crowdingLevel: 'normal',
    weatherCondition: 'normal'
  });

  const [riskLevel, setRiskLevel] = useState(null);
  const [riskScore, setRiskScore] = useState(0);
  const [recommendations, setRecommendations] = useState([]);

  const content = {
    hi: {
      title: "रोग जोखिम कैलकुलेटर",
      subtitle: "मुख्य प्रबंधन कारकों के आधार पर अपने पोल्ट्री झुंड के लिए रोग जोखिम का आकलन करें और व्यक्तिगत सिफारिशें प्राप्त करें।",
      riskFactors: "जोखिम मूल्यांकन कारक",
      birdAge: "पक्षी की आयु (सप्ताह में)",
      agePlaceholder: "सप्ताह में आयु दर्ज करें (0-52)",
      vaccination: "टीकाकरण स्थिति",
      vaccinationOptions: {
        yes: "टीकाकरण पूर्ण",
        partial: "आंशिक टीकाकरण",
        no: "टीकाकरण नहीं"
      },
      litter: "बिछावन की स्थिति",
      litterOptions: {
        dry: "सूखा और साफ",
        damp: "थोड़ा नम",
        wet: "गीला और गंदा"
      },
      feed: "चारे की गुणवत्ता",
      feedOptions: {
        excellent: "प्रीमियम गुणवत्ता",
        good: "अच्छी गुणवत्ता",
        average: "औसत गुणवत्ता",
        poor: "खराब गुणवत्ता"
      },
      water: "पानी की स्वच्छता",
      waterOptions: {
        clean: "साफ और ताजा",
        average: "मध्यम साफ",
        dirty: "गंदा/दूषित"
      },
      biosecurity: "जैव सुरक्षा स्तर",
      biosecurityOptions: {
        high: "उच्च सुरक्षा",
        medium: "मध्यम सुरक्षा",
        low: "कम सुरक्षा"
      },
      calculate: "जोखिम की गणना करें",
      reset: "रीसेट करें",
      results: "जोखिम मूल्यांकन परिणाम",
      riskScore: "जोखिम स्कोर",
      lowRisk: "कम जोखिम",
      mediumRisk: "मध्यम जोखिम",
      highRisk: "उच्च जोखिम",
      riskExplanations: {
        low: "आपकी झुंड प्रबंधन प्रथाएं उत्कृष्ट हैं। वर्तमान प्रोटोकॉल जारी रखें।",
        medium: "कुछ जोखिम कारकों पर ध्यान देने की आवश्यकता है। सुझावित सुधारों को लागू करें।",
        high: "रोग के प्रकोप को रोकने के लिए तत्काल कार्रवाई आवश्यक है।"
      },
      recommendations: "सिफारिशें",
      howItWorks: "यह कैसे काम करता है",
      workingPoints: [
        "• प्रत्येक जोखिम कारक को पोल्ट्री स्वास्थ्य पर इसके प्रभाव के आधार पर भार दिया जाता है",
        "• छोटे पक्षी (0-6 सप्ताह) में उच्च आधार जोखिम स्कोर होते हैं",
        "• टीकाकरण, स्वच्छता और जैव सुरक्षा महत्वपूर्ण कारक हैं",
        "• सिफारिशें आपकी विशिष्ट जोखिम प्रोफ़ाइल के अनुसार तैयार की जाती हैं"
      ],
      preventionTips: "रोग रोकथाम सुझाव",
      preventionCategories: {
        vaccination: {
          title: "टीकाकरण अनुसूची",
          desc: "न्यूकैसल, आईबीडी और अन्य बीमारियों के लिए उचित टीकाकरण समयसीमा का पालन करें"
        },
        biosecurity: {
          title: "जैव सुरक्षा",
          desc: "फार्म पहुंच नियंत्रित करें, उपकरण कीटाणुरहित करें और स्वच्छता प्रोटोकॉल बनाए रखें"
        },
        monitoring: {
          title: "दैनिक निगरानी",
          desc: "लक्षण, भूख में बदलाव और व्यवहार संबंधी समस्याओं के लिए दैनिक पक्षियों का निरीक्षण करें"
        }
      },
      recommendationTexts: {
        vaccineNeeded: "तत्काल टीकाकरण आवश्यक - पशु चिकित्सक से सलाह लें",
        changeLitter: "तुरंत बिछावन बदलें - गीली स्थितियां रोग को बढ़ावा देती हैं",
        improveFeed: "चारे की गुणवत्ता में सुधार करें - प्रमाणित पोल्ट्री फीड का उपयोग करें",
        cleanWater: "पानी के स्रोतों को तुरंत साफ करें - दैनिक पानी बदलें",
        enhanceBiosecurity: "जैव सुरक्षा बढ़ाएं - आगंतुक पहुंच सीमित करें, उपकरण कीटाणुरहित करें",
        reduceDensity: "पक्षी घनत्व कम करें - भीड़भाड़ तनाव और रोग जोखिम बढ़ाती है",
        extraCareChicks: "चूजों की अतिरिक्त देखभाल - बारीकी से निगरानी करें, तापमान बनाए रखें",
        emergencyAction: "आपातकालीन कार्रवाई आवश्यक - तुरंत पशु चिकित्सक से संपर्क करें",
        increaseMonitoring: "निगरानी की आवृत्ति बढ़ाएं - दिन में दो बार पक्षियों की जांच करें",
        preventiveMeasures: "तुरंत निवारक उपाय लागू करें",
        dailyMonitoring: "लक्षणों के लिए दैनिक पक्षियों की निगरानी करें",
        continuePractices: "वर्तमान अच्छी प्रथाएं जारी रखें",
        regularCheckups: "नियमित स्वास्थ्य जांच की सिफारिश की जाती है"
      }
    },
    en: {
      title: "Disease Risk Calculator",
      subtitle: "Assess the disease risk for your poultry flock based on key management factors and get personalized recommendations.",
      riskFactors: "Risk Assessment Factors",
      birdAge: "Bird Age (in weeks)",
      agePlaceholder: "Enter age in weeks (0-52)",
      vaccination: "Vaccination Status",
      vaccinationOptions: {
        yes: "Vaccination Completed",
        partial: "Partial Vaccination",
        no: "Not Vaccinated"
      },
      litter: "Litter Condition",
      litterOptions: {
        dry: "Dry & Clean",
        damp: "Slightly Damp",
        wet: "Wet & Dirty"
      },
      feed: "Feed Quality",
      feedOptions: {
        excellent: "Premium Quality",
        good: "Good Quality",
        average: "Average Quality",
        poor: "Poor Quality"
      },
      water: "Water Sanitation",
      waterOptions: {
        clean: "Clean & Fresh",
        average: "Moderately Clean",
        dirty: "Dirty/Contaminated"
      },
      biosecurity: "Biosecurity Level",
      biosecurityOptions: {
        high: "High Security",
        medium: "Medium Security",
        low: "Low Security"
      },
      calculate: "Calculate Risk",
      reset: "Reset",
      results: "Risk Assessment Results",
      riskScore: "Risk Score",
      lowRisk: "Low Risk",
      mediumRisk: "Medium Risk",
      highRisk: "High Risk",
      riskExplanations: {
        low: "Your flock management practices are excellent. Continue current protocols.",
        medium: "Some risk factors need attention. Implement recommended improvements.",
        high: "Immediate action required to prevent disease outbreak."
      },
      recommendations: "Recommendations",
      howItWorks: "How it Works",
      workingPoints: [
        "• Each risk factor is assigned a weight based on its impact on poultry health",
        "• Younger birds (0-6 weeks) have higher base risk scores",
        "• Vaccination, sanitation, and biosecurity are critical factors",
        "• Recommendations are tailored to your specific risk profile"
      ],
      preventionTips: "Disease Prevention Tips",
      preventionCategories: {
        vaccination: {
          title: "Vaccination Schedule",
          desc: "Follow proper vaccination timeline for Newcastle, IBD, and other diseases"
        },
        biosecurity: {
          title: "Biosecurity",
          desc: "Control farm access, disinfect equipment, and maintain hygiene protocols"
        },
        monitoring: {
          title: "Daily Monitoring",
          desc: "Observe birds daily for symptoms, appetite changes, and behavioral issues"
        }
      },
      recommendationTexts: {
        vaccineNeeded: "Immediate vaccination required - consult veterinarian",
        changeLitter: "Change litter immediately - wet conditions promote disease",
        improveFeed: "Improve feed quality - use certified poultry feed",
        cleanWater: "Clean water sources immediately - change water daily",
        enhanceBiosecurity: "Enhance biosecurity - restrict visitor access, disinfect equipment",
        reduceDensity: "Reduce bird density - overcrowding increases stress and disease risk",
        extraCareChicks: "Extra care for chicks - monitor closely, maintain temperature",
        emergencyAction: "Emergency action required - contact veterinarian immediately",
        increaseMonitoring: "Increase monitoring frequency - check birds twice daily",
        preventiveMeasures: "Implement preventive measures immediately",
        dailyMonitoring: "Monitor birds daily for symptoms",
        continuePractices: "Continue current good practices",
        regularCheckups: "Regular health checkups recommended"
      }
    }
  };

  const t = content[language];

  const handleChange = (name, value) => {
    setInputs({ ...inputs, [name]: value });
  };

  const getRecommendations = (score, inputs) => {
    const recs = [];
    
    if (inputs.vaccinationDone === 'no') {
      recs.push(t.recommendationTexts.vaccineNeeded);
    }
    if (inputs.litterCondition === 'wet') {
      recs.push(t.recommendationTexts.changeLitter);
    }
    if (inputs.feedQuality === 'poor') {
      recs.push(t.recommendationTexts.improveFeed);
    }
    if (inputs.waterSanitation === 'dirty') {
      recs.push(t.recommendationTexts.cleanWater);
    }
    if (inputs.biosecurityLevel === 'low') {
      recs.push(t.recommendationTexts.enhanceBiosecurity);
    }
    if (inputs.crowdingLevel === 'high') {
      recs.push(t.recommendationTexts.reduceDensity);
    }
    if (parseInt(inputs.birdAge) <= 2) {
      recs.push(t.recommendationTexts.extraCareChicks);
    }
    
    // General recommendations based on risk level
    if (score > 5) {
      recs.push(t.recommendationTexts.emergencyAction);
      recs.push(t.recommendationTexts.increaseMonitoring);
    } else if (score > 2) {
      recs.push(t.recommendationTexts.preventiveMeasures);
      recs.push(t.recommendationTexts.dailyMonitoring);
    } else {
      recs.push(t.recommendationTexts.continuePractices);
      recs.push(t.recommendationTexts.regularCheckups);
    }
    
    return recs;
  };

  const calculateRisk = () => {
    let score = 0;

    // Age-based risk (chicks are more vulnerable)
    const age = parseInt(inputs.birdAge);
    if (age <= 2) score += 2;
    else if (age <= 6) score += 1;

    // Health management factors
    if (inputs.vaccinationDone === 'no') score += 3;
    if (inputs.litterCondition === 'wet') score += 2;
    if (inputs.feedQuality === 'poor') score += 2;
    if (inputs.waterSanitation === 'dirty') score += 3;
    if (inputs.biosecurityLevel === 'low') score += 2;
    if (inputs.crowdingLevel === 'high') score += 2;
    if (inputs.weatherCondition === 'extreme') score += 1;

    setRiskScore(score);

    // Determine risk level
    let level, color, icon;
    if (score <= 2) {
      level = t.lowRisk;
      color = 'text-green-600 bg-green-50 border-green-200';
      icon = <CheckCircle className="w-5 h-5" />;
    } else if (score <= 6) {
      level = t.mediumRisk;
      color = 'text-yellow-600 bg-yellow-50 border-yellow-200';
      icon = <AlertTriangle className="w-5 h-5" />;
    } else {
      level = t.highRisk;
      color = 'text-red-600 bg-red-50 border-red-200';
      icon = <AlertTriangle className="w-5 h-5" />;
    }

    setRiskLevel({ level, color, icon });
    setRecommendations(getRecommendations(score, inputs));
  };

  const resetCalculator = () => {
    setInputs({
      birdAge: '',
      vaccinationDone: 'yes',
      litterCondition: 'dry',
      feedQuality: 'good',
      waterSanitation: 'clean',
      biosecurityLevel: 'high',
      crowdingLevel: 'normal',
      weatherCondition: 'normal'
    });
    setRiskLevel(null);
    setRiskScore(0);
    setRecommendations([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
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

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full mr-3">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">{t.title}</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                {t.riskFactors}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bird Age */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {t.birdAge}
                </Label>
                <Input
                  type="number"
                  value={inputs.birdAge}
                  onChange={(e) => handleChange('birdAge', e.target.value)}
                  placeholder={t.agePlaceholder}
                  min="0"
                  max="52"
                />
              </div>

              {/* Vaccination Status */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Syringe className="w-4 h-4 mr-2" />
                  {t.vaccination}
                </Label>
                <Select value={inputs.vaccinationDone} onValueChange={(value) => handleChange('vaccinationDone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">{t.vaccinationOptions.yes}</SelectItem>
                    <SelectItem value="partial">{t.vaccinationOptions.partial}</SelectItem>
                    <SelectItem value="no">{t.vaccinationOptions.no}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Litter Condition */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  {t.litter}
                </Label>
                <Select value={inputs.litterCondition} onValueChange={(value) => handleChange('litterCondition', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dry">{t.litterOptions.dry}</SelectItem>
                    <SelectItem value="damp">{t.litterOptions.damp}</SelectItem>
                    <SelectItem value="wet">{t.litterOptions.wet}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Feed Quality */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Wheat className="w-4 h-4 mr-2" />
                  {t.feed}
                </Label>
                <Select value={inputs.feedQuality} onValueChange={(value) => handleChange('feedQuality', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">{t.feedOptions.excellent}</SelectItem>
                    <SelectItem value="good">{t.feedOptions.good}</SelectItem>
                    <SelectItem value="average">{t.feedOptions.average}</SelectItem>
                    <SelectItem value="poor">{t.feedOptions.poor}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Water Sanitation */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Droplets className="w-4 h-4 mr-2" />
                  {t.water}
                </Label>
                <Select value={inputs.waterSanitation} onValueChange={(value) => handleChange('waterSanitation', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clean">{t.waterOptions.clean}</SelectItem>
                    <SelectItem value="average">{t.waterOptions.average}</SelectItem>
                    <SelectItem value="dirty">{t.waterOptions.dirty}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Biosecurity Level */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  {t.biosecurity}
                </Label>
                <Select value={inputs.biosecurityLevel} onValueChange={(value) => handleChange('biosecurityLevel', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">{t.biosecurityOptions.high}</SelectItem>
                    <SelectItem value="medium">{t.biosecurityOptions.medium}</SelectItem>
                    <SelectItem value="low">{t.biosecurityOptions.low}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button onClick={calculateRisk} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Activity className="w-4 h-4 mr-2" />
                  {t.calculate}
                </Button>
                <Button onClick={resetCalculator} variant="outline" className="flex-1">
                  {t.reset}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {riskLevel && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>{t.results}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center justify-center p-6 rounded-lg border-2 ${riskLevel.color} mb-4`}>
                    {riskLevel.icon}
                    <div className="ml-3">
                      <div className="text-2xl font-bold">
                        {riskLevel.level}
                      </div>
                      <div className="text-sm opacity-75">
                        {t.riskScore}: {riskScore}/12
                      </div>
                    </div>
                  </div>

                  {/* Risk Level Explanation */}
                  <div className="text-sm text-gray-600 mb-4">
                    {riskLevel.level === t.lowRisk && t.riskExplanations.low}
                    {riskLevel.level === t.mediumRisk && t.riskExplanations.medium}
                    {riskLevel.level === t.highRisk && t.riskExplanations.high}
                  </div>
                </CardContent>
              </Card>
            )}

            {recommendations.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                    {t.recommendations}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <Alert key={index} className="border-l-4 border-l-blue-500">
                        <AlertDescription className="text-sm">
                          {rec}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card className="shadow-lg bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">{t.howItWorks}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700 space-y-2">
                {t.workingPoints.map((point, index) => (
                  <p key={index}>{point}</p>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Educational Section */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">{t.preventionTips}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <Syringe className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">{t.preventionCategories.vaccination.title}</h3>
                <p className="text-sm text-gray-600">{t.preventionCategories.vaccination.desc}</p>
              </div>
              <div className="p-4">
                <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">{t.preventionCategories.biosecurity.title}</h3>
                <p className="text-sm text-gray-600">{t.preventionCategories.biosecurity.desc}</p>
              </div>
              <div className="p-4">
                <div className="bg-yellow-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <Activity className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">{t.preventionCategories.monitoring.title}</h3>
                <p className="text-sm text-gray-600">{t.preventionCategories.monitoring.desc}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiseaseRiskCalculator;
