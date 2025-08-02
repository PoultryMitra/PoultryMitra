import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Home, Thermometer, CheckSquare, AlertTriangle, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ShedManagement = () => {
  const { t } = useLanguage();
  // Shed Design Calculator State
  const [shedDesign, setShedDesign] = useState({
    length: '',
    width: '',
    orientation: 'East-West',
    result: ''
  });

  // Environment Manager State
  const [environment, setEnvironment] = useState({
    birdAge: '',
    temperature: '',
    humidity: '',
    result: '',
    alertLevel: 'info'
  });

  // Daily Checklist State
  const [checklist, setChecklist] = useState({
    age: '',
    items: []
  });

  // Shed Design Calculator
  const calculateShed = () => {
    const length = parseFloat(shedDesign.length);
    const width = parseFloat(shedDesign.width);
    const area = length * width;
    const capacity = Math.floor(area / 1); // 1 sqft per bird
    const orientation = shedDesign.orientation;

    setShedDesign(prev => ({
      ...prev,
      result: `
        Total Area: ${area} square feet
        Estimated Bird Capacity: ${capacity} chicks
        Shed Orientation: ${orientation}
        Recommendation: Ensure cross ventilation and sun protection in the shed.
      `
    }));
  };

  // Environment Analyzer
  const analyzeEnvironment = () => {
    const age = parseInt(environment.birdAge);
    const temp = parseFloat(environment.temperature);
    const humidity = parseFloat(environment.humidity);

    let msg = "";
    let alertLevel = "info";

    // Age-based temperature recommendations
    if (age <= 7) {
      msg += "Brooding period. Temperature should be 32–34°C.\n";
      if (temp < 32 || temp > 34) {
        alertLevel = "warning";
      }
    } else if (age <= 21) {
      msg += "Medium age chicks. Temperature 28–30°C is suitable.\n";
      if (temp < 28 || temp > 30) {
        alertLevel = "warning";
      }
    } else {
      msg += "Finishing stage. Temperature 24–27°C is suitable.\n";
      if (temp < 24 || temp > 27) {
        alertLevel = "warning";
      }
    }

    // Temperature analysis
    if (temp < 24) {
      msg += "❄ Temperature is too low. Heating is necessary.\n";
      alertLevel = "error";
    } else if (temp > 34) {
      msg += "🔥 Temperature is too high. Increase ventilation.\n";
      alertLevel = "error";
    } else {
      msg += "✅ Temperature is acceptable.\n";
    }

    // Humidity analysis
    if (humidity < 40 || humidity > 70) {
      msg += "💧 Humidity level is not optimal. Check air circulation.\n";
      if (alertLevel === "info") alertLevel = "warning";
    } else {
      msg += "✅ Humidity level is acceptable.";
    }

    setEnvironment(prev => ({
      ...prev,
      result: msg,
      alertLevel
    }));
  };

  // Generate Daily Checklist
  const generateChecklist = () => {
    const age = parseInt(checklist.age);
    let items = [];

    if (age <= 7) {
      items = [
        'Monitor brooder temperature',
        'Keep water containers clean',
        'Observe chick activity',
        'Check for proper feeding',
        'Ensure adequate lighting',
        'Monitor for any sick birds'
      ];
    } else if (age <= 21) {
      items = [
        'Maintain proper ventilation',
        'Clean litter regularly',
        'Check feed quantity',
        'Monitor water consumption',
        'Observe bird behavior',
        'Check for respiratory issues'
      ];
    } else {
      items = [
        'Apply final feed schedule',
        'Check bird health status',
        'Prepare for marketing',
        'Monitor weight gain',
        'Ensure proper spacing',
        'Plan harvest schedule'
      ];
    }

    setChecklist(prev => ({
      ...prev,
      items
    }));
  };

  const getAlertIcon = (level) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBg = (level) => {
    switch (level) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getAlertText = (level) => {
    switch (level) {
      case 'error': return 'text-red-800';
      case 'warning': return 'text-yellow-800';
      default: return 'text-blue-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-orange-800 mb-2">{t('shed.title')}</h1>
        <p className="text-gray-600">{t('shed.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shed Design Calculator */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-orange-600" />
              {t('shed.design.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>{t('shed.design.length')}</Label>
                <Input
                  type="number"
                  value={shedDesign.length}
                  onChange={(e) => setShedDesign(prev => ({ ...prev, length: e.target.value }))}
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <Label>{t('shed.design.width')}</Label>
                <Input
                  type="number"
                  value={shedDesign.width}
                  onChange={(e) => setShedDesign(prev => ({ ...prev, width: e.target.value }))}
                  placeholder="e.g., 30"
                />
              </div>
              <div>
                <Label>{t('shed.design.orientation')}</Label>
                <Select
                  value={shedDesign.orientation}
                  onValueChange={(value) => setShedDesign(prev => ({ ...prev, orientation: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="East-West">{t('shed.design.eastWest')}</SelectItem>
                    <SelectItem value="North-South">{t('shed.design.northSouth')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={calculateShed} className="w-full">
              Calculate Capacity
            </Button>
            {shedDesign.result && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                <pre className="font-medium text-orange-800 whitespace-pre-line">
                  {shedDesign.result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment Manager */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-blue-600" />
              {t('shed.environment.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('shed.environment.chickAge')}</Label>
              <Input
                type="number"
                value={environment.birdAge}
                onChange={(e) => setEnvironment(prev => ({ ...prev, birdAge: e.target.value }))}
                placeholder="e.g., 21"
              />
            </div>
            <div>
              <Label>{t('shed.environment.currentTemp')}</Label>
              <Input
                type="number"
                value={environment.temperature}
                onChange={(e) => setEnvironment(prev => ({ ...prev, temperature: e.target.value }))}
                placeholder="e.g., 29"
              />
            </div>
            <div>
              <Label>{t('shed.environment.humidity')}</Label>
              <Input
                type="number"
                value={environment.humidity}
                onChange={(e) => setEnvironment(prev => ({ ...prev, humidity: e.target.value }))}
                placeholder="e.g., 60"
              />
            </div>
            <Button onClick={analyzeEnvironment} className="w-full">
              Get Recommendations
            </Button>
            {environment.result && (
              <div className={`p-4 border rounded ${getAlertBg(environment.alertLevel)}`}>
                <div className="flex items-start gap-2">
                  {getAlertIcon(environment.alertLevel)}
                  <pre className={`font-medium whitespace-pre-line ${getAlertText(environment.alertLevel)}`}>
                    {environment.result}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-green-600" />
              {t('shed.checklist.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('shed.checklist.birdAge')}</Label>
              <Input
                type="number"
                value={checklist.age}
                onChange={(e) => setChecklist(prev => ({ ...prev, age: e.target.value }))}
                placeholder="e.g., 7"
              />
            </div>
            <Button onClick={generateChecklist} className="w-full">
              {t('shed.checklist.generate')}
            </Button>
            {checklist.items.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <h4 className="font-semibold text-green-800 mb-3">
                  Daily Tasks (Age: {checklist.age} days)
                </h4>
                <div className="space-y-2">
                  {checklist.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('shed.tempGuidelines')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><Badge variant="outline">Week 1:</Badge> 32-34°C</div>
              <div><Badge variant="outline">Week 2-3:</Badge> 28-30°C</div>
              <div><Badge variant="outline">Week 4+:</Badge> 24-27°C</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('shed.humidityStandards')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><Badge variant="outline">Optimal:</Badge> 50-65%</div>
              <div><Badge variant="outline">Minimum:</Badge> 40%</div>
              <div><Badge variant="outline">Maximum:</Badge> 70%</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('shed.spaceRequirements')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><Badge variant="outline">Broiler:</Badge> 1 sq ft/bird</div>
              <div><Badge variant="outline">Layer:</Badge> 1.5 sq ft/bird</div>
              <div><Badge variant="outline">Breeder:</Badge> 2 sq ft/bird</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShedManagement;
