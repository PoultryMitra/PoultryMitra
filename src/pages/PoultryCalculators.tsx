import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, Egg, DollarSign, Activity, Droplets, Truck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PoultryCalculators = () => {
  const { t } = useLanguage();

  // Weight Gain Calculator State
  const [weightGain, setWeightGain] = useState({
    initialWeight: '',
    currentWeight: '',
    days: '',
    result: ''
  });

  // Egg Production Calculator State
  const [eggProduction, setEggProduction] = useState({
    hens: '',
    productivity: '',
    result: ''
  });

  // Cost and Profit Calculator State
  const [costProfit, setCostProfit] = useState({
    feedCost: '',
    medicineCost: '',
    laborCost: '',
    otherCost: '',
    income: '',
    result: ''
  });

  // Feed Mix Calculator State
  const [feedMix, setFeedMix] = useState({
    maize: '',
    soy: '',
    bran: '',
    result: ''
  });

  // Disease Risk Calculator State
  const [diseaseRisk, setDiseaseRisk] = useState({
    birdAge: '',
    temperature: '',
    result: ''
  });

  // Water Requirement Calculator State
  const [waterReq, setWaterReq] = useState({
    birds: '',
    age: '',
    temperature: '',
    result: ''
  });

  // Transport Cost Calculator State
  const [transportCost, setTransportCost] = useState({
    distance: '',
    weight: '',
    fuelPrice: '',
    result: ''
  });

  // Weight Gain Calculator
  const calculateWeightGain = () => {
    const initial = parseFloat(weightGain.initialWeight);
    const current = parseFloat(weightGain.currentWeight);
    const days = parseInt(weightGain.days);
    const totalGain = current - initial;
    const dailyGain = totalGain / days;
    const projectedWeight = current + (dailyGain * 7); // Next week projection

    setWeightGain(prev => ({
      ...prev,
      result: `Daily Weight Gain: ${dailyGain.toFixed(2)}g/day
               Total Gain: ${totalGain}g
               Projected Weight (Next Week): ${projectedWeight.toFixed(2)}g`
    }));
  };

  // Egg Production Calculator
  const calculateEggProduction = () => {
    const hens = parseInt(eggProduction.hens);
    const productivity = parseFloat(eggProduction.productivity);
    const dailyEggs = (hens * productivity) / 100;
    const weeklyEggs = dailyEggs * 7;
    const monthlyEggs = dailyEggs * 30;

    setEggProduction(prev => ({
      ...prev,
      result: `Daily Production: ${dailyEggs.toFixed(0)} eggs
               Weekly Production: ${weeklyEggs.toFixed(0)} eggs
               Monthly Production: ${monthlyEggs.toFixed(0)} eggs`
    }));
  };

  // Cost and Profit Calculator
  const calculateCostProfit = () => {
    const feed = parseFloat(costProfit.feedCost) || 0;
    const medicine = parseFloat(costProfit.medicineCost) || 0;
    const labor = parseFloat(costProfit.laborCost) || 0;
    const other = parseFloat(costProfit.otherCost) || 0;
    const income = parseFloat(costProfit.income) || 0;
    
    const totalCost = feed + medicine + labor + other;
    const profit = income - totalCost;
    const profitMargin = ((profit / income) * 100);

    setCostProfit(prev => ({
      ...prev,
      result: `Total Cost: ₹${totalCost.toFixed(2)}
               Total Income: ₹${income.toFixed(2)}
               Profit: ₹${profit.toFixed(2)}
               Profit Margin: ${profitMargin.toFixed(1)}%`
    }));
  };

  // Feed Mix Calculator
  const calculateFeedMix = () => {
    const maize = parseFloat(feedMix.maize) || 0;
    const soy = parseFloat(feedMix.soy) || 0;
    const bran = parseFloat(feedMix.bran) || 0;
    const total = maize + soy + bran;
    
    const maizePercent = (maize / total) * 100;
    const soyPercent = (soy / total) * 100;
    const branPercent = (bran / total) * 100;

    setFeedMix(prev => ({
      ...prev,
      result: `Total Mix: ${total}kg
               Maize: ${maizePercent.toFixed(1)}%
               Soybean: ${soyPercent.toFixed(1)}%
               Bran: ${branPercent.toFixed(1)}%`
    }));
  };

  // Disease Risk Calculator
  const calculateDiseaseRisk = () => {
    const age = parseInt(diseaseRisk.birdAge);
    const temp = parseFloat(diseaseRisk.temperature);
    let risk = "Low";
    let recommendations = "";

    if (age <= 7) {
      risk = temp < 32 || temp > 34 ? "High" : "Medium";
      recommendations = "Critical brooding period. Monitor closely.";
    } else if (age <= 21) {
      risk = temp < 28 || temp > 30 ? "Medium" : "Low";
      recommendations = "Growth period. Maintain proper ventilation.";
    } else {
      risk = temp < 24 || temp > 27 ? "Medium" : "Low";
      recommendations = "Finishing period. Focus on feed conversion.";
    }

    setDiseaseRisk(prev => ({
      ...prev,
      result: `Risk Level: ${risk}
               Recommendations: ${recommendations}
               Optimal Temperature Range: ${age <= 7 ? '32-34°C' : age <= 21 ? '28-30°C' : '24-27°C'}`
    }));
  };

  // Water Requirement Calculator
  const calculateWaterReq = () => {
    const birds = parseInt(waterReq.birds);
    const age = parseInt(waterReq.age);
    const temp = parseFloat(waterReq.temperature) || 25;
    
    let baseReq = 0;
    if (age <= 7) baseReq = 30; // ml per bird
    else if (age <= 21) baseReq = 50;
    else baseReq = 200;
    
    // Temperature adjustment
    const tempFactor = temp > 30 ? 1.5 : temp > 25 ? 1.2 : 1.0;
    const dailyReq = (birds * baseReq * tempFactor) / 1000; // Convert to liters

    setWaterReq(prev => ({
      ...prev,
      result: `Daily Water Requirement: ${dailyReq.toFixed(1)} liters
               Per Bird: ${(baseReq * tempFactor).toFixed(0)} ml/bird
               Weekly Requirement: ${(dailyReq * 7).toFixed(1)} liters`
    }));
  };

  // Transport Cost Calculator
  const calculateTransportCost = () => {
    const distance = parseFloat(transportCost.distance);
    const weight = parseFloat(transportCost.weight);
    const fuelPrice = parseFloat(transportCost.fuelPrice);
    
    const fuelConsumption = 6; // km per liter (typical truck)
    const fuelNeeded = (distance * 2) / fuelConsumption; // Round trip
    const fuelCost = fuelNeeded * fuelPrice;
    const laborCost = distance * 2; // ₹2 per km
    const total = fuelCost + laborCost;

    setTransportCost(prev => ({
      ...prev,
      result: `Fuel Cost: ₹${fuelCost.toFixed(2)}
               Labor Cost: ₹${laborCost.toFixed(2)}
               Total Cost: ₹${total.toFixed(2)}
               Cost per kg: ₹${(total / weight).toFixed(2)}`
    }));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-2">{t('calculators.title')}</h1>
        <p className="text-gray-600">{t('calculators.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight Gain Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              {t('calculators.weightGain.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('calculators.weightGain.initialWeight')}</Label>
              <Input
                type="number"
                value={weightGain.initialWeight}
                onChange={(e) => setWeightGain(prev => ({ ...prev, initialWeight: e.target.value }))}
                placeholder="50"
              />
            </div>
            <div>
              <Label>{t('calculators.weightGain.currentWeight')}</Label>
              <Input
                type="number"
                value={weightGain.currentWeight}
                onChange={(e) => setWeightGain(prev => ({ ...prev, currentWeight: e.target.value }))}
                placeholder="2500"
              />
            </div>
            <div>
              <Label>{t('calculators.weightGain.days')}</Label>
              <Input
                type="number"
                value={weightGain.days}
                onChange={(e) => setWeightGain(prev => ({ ...prev, days: e.target.value }))}
                placeholder="42"
              />
            </div>
            <Button onClick={calculateWeightGain} className="w-full">
              {t('calculators.weightGain.calculate')}
            </Button>
            {weightGain.result && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <pre className="font-medium text-green-800 whitespace-pre-line text-sm">
                  {weightGain.result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Egg Production Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Egg className="h-5 w-5 text-orange-600" />
              {t('calculators.eggProduction.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('calculators.eggProduction.hens')}</Label>
              <Input
                type="number"
                value={eggProduction.hens}
                onChange={(e) => setEggProduction(prev => ({ ...prev, hens: e.target.value }))}
                placeholder="1000"
              />
            </div>
            <div>
              <Label>{t('calculators.eggProduction.productivity')}</Label>
              <Input
                type="number"
                value={eggProduction.productivity}
                onChange={(e) => setEggProduction(prev => ({ ...prev, productivity: e.target.value }))}
                placeholder="85"
              />
            </div>
            <Button onClick={calculateEggProduction} className="w-full">
              {t('calculators.weightGain.calculate')}
            </Button>
            {eggProduction.result && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                <pre className="font-medium text-orange-800 whitespace-pre-line text-sm">
                  {eggProduction.result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost and Profit Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              {t('calculators.costProfit.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('calculators.costProfit.feedCost')}</Label>
              <Input
                type="number"
                value={costProfit.feedCost}
                onChange={(e) => setCostProfit(prev => ({ ...prev, feedCost: e.target.value }))}
                placeholder="50000"
              />
            </div>
            <div>
              <Label>{t('calculators.costProfit.medicineCost')}</Label>
              <Input
                type="number"
                value={costProfit.medicineCost}
                onChange={(e) => setCostProfit(prev => ({ ...prev, medicineCost: e.target.value }))}
                placeholder="5000"
              />
            </div>
            <div>
              <Label>{t('calculators.costProfit.laborCost')}</Label>
              <Input
                type="number"
                value={costProfit.laborCost}
                onChange={(e) => setCostProfit(prev => ({ ...prev, laborCost: e.target.value }))}
                placeholder="10000"
              />
            </div>
            <div>
              <Label>{t('calculators.costProfit.otherCost')}</Label>
              <Input
                type="number"
                value={costProfit.otherCost}
                onChange={(e) => setCostProfit(prev => ({ ...prev, otherCost: e.target.value }))}
                placeholder="3000"
              />
            </div>
            <div>
              <Label>{t('calculators.costProfit.income')}</Label>
              <Input
                type="number"
                value={costProfit.income}
                onChange={(e) => setCostProfit(prev => ({ ...prev, income: e.target.value }))}
                placeholder="80000"
              />
            </div>
            <Button onClick={calculateCostProfit} className="w-full">
              {t('calculators.weightGain.calculate')}
            </Button>
            {costProfit.result && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <pre className="font-medium text-blue-800 whitespace-pre-line text-sm">
                  {costProfit.result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feed Mix Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              {t('calculators.feedMix.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('calculators.feedMix.maize')}</Label>
              <Input
                type="number"
                value={feedMix.maize}
                onChange={(e) => setFeedMix(prev => ({ ...prev, maize: e.target.value }))}
                placeholder="60"
              />
            </div>
            <div>
              <Label>{t('calculators.feedMix.soy')}</Label>
              <Input
                type="number"
                value={feedMix.soy}
                onChange={(e) => setFeedMix(prev => ({ ...prev, soy: e.target.value }))}
                placeholder="25"
              />
            </div>
            <div>
              <Label>{t('calculators.feedMix.bran')}</Label>
              <Input
                type="number"
                value={feedMix.bran}
                onChange={(e) => setFeedMix(prev => ({ ...prev, bran: e.target.value }))}
                placeholder="15"
              />
            </div>
            <Button onClick={calculateFeedMix} className="w-full">
              {t('calculators.weightGain.calculate')}
            </Button>
            {feedMix.result && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                <pre className="font-medium text-purple-800 whitespace-pre-line text-sm">
                  {feedMix.result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disease Risk Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-600" />
              {t('calculators.diseaseRisk.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('calculators.diseaseRisk.birdAge')}</Label>
              <Input
                type="number"
                value={diseaseRisk.birdAge}
                onChange={(e) => setDiseaseRisk(prev => ({ ...prev, birdAge: e.target.value }))}
                placeholder="21"
              />
            </div>
            <div>
              <Label>{t('calculators.diseaseRisk.temperature')}</Label>
              <Input
                type="number"
                value={diseaseRisk.temperature}
                onChange={(e) => setDiseaseRisk(prev => ({ ...prev, temperature: e.target.value }))}
                placeholder="29"
              />
            </div>
            <Button onClick={calculateDiseaseRisk} className="w-full">
              {t('calculators.weightGain.calculate')}
            </Button>
            {diseaseRisk.result && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <pre className="font-medium text-red-800 whitespace-pre-line text-sm">
                  {diseaseRisk.result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Water Requirement Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-cyan-600" />
              {t('calculators.waterReq.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('calculators.waterReq.birds')}</Label>
              <Input
                type="number"
                value={waterReq.birds}
                onChange={(e) => setWaterReq(prev => ({ ...prev, birds: e.target.value }))}
                placeholder="1000"
              />
            </div>
            <div>
              <Label>{t('calculators.waterReq.age')}</Label>
              <Input
                type="number"
                value={waterReq.age}
                onChange={(e) => setWaterReq(prev => ({ ...prev, age: e.target.value }))}
                placeholder="28"
              />
            </div>
            <div>
              <Label>Temperature (°C)</Label>
              <Input
                type="number"
                value={waterReq.temperature}
                onChange={(e) => setWaterReq(prev => ({ ...prev, temperature: e.target.value }))}
                placeholder="30"
              />
            </div>
            <Button onClick={calculateWaterReq} className="w-full">
              {t('calculators.weightGain.calculate')}
            </Button>
            {waterReq.result && (
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded">
                <pre className="font-medium text-cyan-800 whitespace-pre-line text-sm">
                  {waterReq.result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transport Cost Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-indigo-600" />
              {t('calculators.transportCost.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('calculators.transportCost.distance')}</Label>
              <Input
                type="number"
                value={transportCost.distance}
                onChange={(e) => setTransportCost(prev => ({ ...prev, distance: e.target.value }))}
                placeholder="50"
              />
            </div>
            <div>
              <Label>{t('calculators.transportCost.weight')}</Label>
              <Input
                type="number"
                value={transportCost.weight}
                onChange={(e) => setTransportCost(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="2000"
              />
            </div>
            <div>
              <Label>{t('calculators.transportCost.fuelPrice')}</Label>
              <Input
                type="number"
                value={transportCost.fuelPrice}
                onChange={(e) => setTransportCost(prev => ({ ...prev, fuelPrice: e.target.value }))}
                placeholder="100"
              />
            </div>
            <Button onClick={calculateTransportCost} className="w-full">
              {t('calculators.weightGain.calculate')}
            </Button>
            {transportCost.result && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded">
                <pre className="font-medium text-indigo-800 whitespace-pre-line text-sm">
                  {transportCost.result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Growth Standards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><Badge variant="outline">Week 1:</Badge> 40-60g daily gain</div>
              <div><Badge variant="outline">Week 2-4:</Badge> 60-80g daily gain</div>
              <div><Badge variant="outline">Week 5+:</Badge> 80-100g daily gain</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Production Standards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><Badge variant="outline">Peak:</Badge> 85-95% productivity</div>
              <div><Badge variant="outline">Average:</Badge> 75-85% productivity</div>
              <div><Badge variant="outline">Minimum:</Badge> 65-75% productivity</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cost Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><Badge variant="outline">Feed:</Badge> 65-70% of total cost</div>
              <div><Badge variant="outline">Labor:</Badge> 10-15% of total cost</div>
              <div><Badge variant="outline">Medicine:</Badge> 5-10% of total cost</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PoultryCalculators;
