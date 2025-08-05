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
  Syringe
} from 'lucide-react';

const DiseaseRiskCalculator = () => {
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

  const handleChange = (name, value) => {
    setInputs({ ...inputs, [name]: value });
  };

  const getRecommendations = (score, inputs) => {
    const recs = [];
    
    if (inputs.vaccinationDone === 'no') {
      recs.push("Immediate vaccination required - consult veterinarian");
    }
    if (inputs.litterCondition === 'wet') {
      recs.push("Change litter immediately - wet conditions promote disease");
    }
    if (inputs.feedQuality === 'poor') {
      recs.push("Improve feed quality - use certified poultry feed");
    }
    if (inputs.waterSanitation === 'dirty') {
      recs.push("Clean water sources immediately - change water daily");
    }
    if (inputs.biosecurityLevel === 'low') {
      recs.push("Enhance biosecurity - restrict visitor access, disinfect equipment");
    }
    if (inputs.crowdingLevel === 'high') {
      recs.push("Reduce bird density - overcrowding increases stress and disease risk");
    }
    if (parseInt(inputs.birdAge) <= 2) {
      recs.push("Extra care for chicks - monitor closely, maintain temperature");
    }
    
    // General recommendations based on risk level
    if (score > 5) {
      recs.push("Emergency action required - contact veterinarian immediately");
      recs.push("Increase monitoring frequency - check birds twice daily");
    } else if (score > 2) {
      recs.push("Implement preventive measures immediately");
      recs.push("Monitor birds daily for symptoms");
    } else {
      recs.push("Continue current good practices");
      recs.push("Regular health checkups recommended");
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
      level = 'Low';
      color = 'text-green-600 bg-green-50 border-green-200';
      icon = <CheckCircle className="w-5 h-5" />;
    } else if (score <= 6) {
      level = 'Medium';
      color = 'text-yellow-600 bg-yellow-50 border-yellow-200';
      icon = <AlertTriangle className="w-5 h-5" />;
    } else {
      level = 'High';
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full mr-3">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Disease Risk Calculator</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Assess the disease risk for your poultry flock based on key management factors and get personalized recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Risk Assessment Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bird Age */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Bird Age (in weeks)
                </Label>
                <Input
                  type="number"
                  value={inputs.birdAge}
                  onChange={(e) => handleChange('birdAge', e.target.value)}
                  placeholder="Enter age in weeks (0-52)"
                  min="0"
                  max="52"
                />
              </div>

              {/* Vaccination Status */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Syringe className="w-4 h-4 mr-2" />
                  Vaccination Status
                </Label>
                <Select value={inputs.vaccinationDone} onValueChange={(value) => handleChange('vaccinationDone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Vaccination Completed</SelectItem>
                    <SelectItem value="partial">Partial Vaccination</SelectItem>
                    <SelectItem value="no">Not Vaccinated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Litter Condition */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Litter Condition
                </Label>
                <Select value={inputs.litterCondition} onValueChange={(value) => handleChange('litterCondition', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dry">Dry & Clean</SelectItem>
                    <SelectItem value="damp">Slightly Damp</SelectItem>
                    <SelectItem value="wet">Wet & Dirty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Feed Quality */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Wheat className="w-4 h-4 mr-2" />
                  Feed Quality
                </Label>
                <Select value={inputs.feedQuality} onValueChange={(value) => handleChange('feedQuality', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Premium Quality</SelectItem>
                    <SelectItem value="good">Good Quality</SelectItem>
                    <SelectItem value="average">Average Quality</SelectItem>
                    <SelectItem value="poor">Poor Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Water Sanitation */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Droplets className="w-4 h-4 mr-2" />
                  Water Sanitation
                </Label>
                <Select value={inputs.waterSanitation} onValueChange={(value) => handleChange('waterSanitation', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clean">Clean & Fresh</SelectItem>
                    <SelectItem value="average">Moderately Clean</SelectItem>
                    <SelectItem value="dirty">Dirty/Contaminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Biosecurity Level */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Biosecurity Level
                </Label>
                <Select value={inputs.biosecurityLevel} onValueChange={(value) => handleChange('biosecurityLevel', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Security</SelectItem>
                    <SelectItem value="medium">Medium Security</SelectItem>
                    <SelectItem value="low">Low Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button onClick={calculateRisk} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Activity className="w-4 h-4 mr-2" />
                  Calculate Risk
                </Button>
                <Button onClick={resetCalculator} variant="outline" className="flex-1">
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {riskLevel && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Risk Assessment Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center justify-center p-6 rounded-lg border-2 ${riskLevel.color} mb-4`}>
                    {riskLevel.icon}
                    <div className="ml-3">
                      <div className="text-2xl font-bold">
                        {riskLevel.level} Risk
                      </div>
                      <div className="text-sm opacity-75">
                        Risk Score: {riskScore}/12
                      </div>
                    </div>
                  </div>

                  {/* Risk Level Explanation */}
                  <div className="text-sm text-gray-600 mb-4">
                    {riskLevel.level === 'Low' && "Your flock management practices are excellent. Continue current protocols."}
                    {riskLevel.level === 'Medium' && "Some risk factors need attention. Implement recommended improvements."}
                    {riskLevel.level === 'High' && "Immediate action required to prevent disease outbreak."}
                  </div>
                </CardContent>
              </Card>
            )}

            {recommendations.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                    Recommendations
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
                <CardTitle className="text-blue-800">How it Works</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700 space-y-2">
                <p>• Each risk factor is assigned a weight based on its impact on poultry health</p>
                <p>• Younger birds (0-6 weeks) have higher base risk scores</p>
                <p>• Vaccination, sanitation, and biosecurity are critical factors</p>
                <p>• Recommendations are tailored to your specific risk profile</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Educational Section */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Disease Prevention Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <Syringe className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Vaccination Schedule</h3>
                <p className="text-sm text-gray-600">Follow proper vaccination timeline for Newcastle, IBD, and other diseases</p>
              </div>
              <div className="p-4">
                <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Biosecurity</h3>
                <p className="text-sm text-gray-600">Control farm access, disinfect equipment, and maintain hygiene protocols</p>
              </div>
              <div className="p-4">
                <div className="bg-yellow-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <Activity className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">Daily Monitoring</h3>
                <p className="text-sm text-gray-600">Observe birds daily for symptoms, appetite changes, and behavioral issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiseaseRiskCalculator;
