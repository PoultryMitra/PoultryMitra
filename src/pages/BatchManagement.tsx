import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEnhancedTranslation } from "@/contexts/EnhancedTranslationContext";
import { TranslationStatus } from "@/components/TranslationComponents";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, 
  Calendar, 
  Bird, 
  TrendingUp, 
  Download, 
  Save, 
  AlertTriangle,
  Users,
  Weight,
  Activity,
  DollarSign,
  ArrowLeft,
  Syringe,
  Package,
  Calculator
} from "lucide-react";
import { Link } from "react-router-dom";

export default function BatchManagement() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { language, t, translateText } = useEnhancedTranslation();
  
  // Extended translations specific to batch management
  const batchTranslations = {
    hi: {
      title: "बैच प्रबंधन",
      subtitle: "अपने पोल्ट्री बैच का प्रबंधन करें, प्रदर्शन को ट्रैक करें, और विकास की निगरानी करें।",
      freeTools: "सभी उपकरण मुफ्त हैं - केवल रिपोर्ट सेव करने और डाउनलोड करने के लिए लॉगिन आवश्यक है।",
      backToHome: "होम पर वापस",
      welcome: "स्वागत",
      addNewBatch: "नया बैच जोड़ें",
      saveReport: "रिपोर्ट सेव करें",
      downloadReport: "रिपोर्ट डाउनलोड करें",
      saveYourWork: "अपना काम सेव करें",
      freeToolsDesc: "आप सभी बैच प्रबंधन उपकरण मुफ्त में उपयोग कर सकते हैं! रिपोर्ट सेव करने और डेटा डाउनलोड करने के लिए केवल लॉगिन आवश्यक है।",
      batchName: "बैच का नाम",
      startDate: "शुरूआती तारीख",
      totalBirds: "कुल पक्षी",
      currentAge: "वर्तमान आयु",
      mortality: "मृत्यु दर",
      feedConsumed: "फीड की खपत",
      currentWeight: "वर्तमान वजन",
      fcr: "FCR", 
      status: "स्थिति",
      active: "सक्रिय",
      days: "दिन",
      kg: "किग्रा",
      bags: "बोरे",
      fillAllFields: "कृपया सभी आवश्यक फ़ील्ड भरें",
      batchAdded: "बैच जोड़ा गया",
      batchCreated: "नया बैच सफलतापूर्वक बनाया गया",
      loginRequired: "लॉगिन आवश्यक",
      loginToSave: "बैच रिपोर्ट सेव करने के लिए कृपया लॉगिन करें",
      reportSaved: "रिपोर्ट सेव हो गई",
      reportSavedDesc: "बैच रिपोर्ट आपके खाते में सेव हो गई है",
      loginToDownload: "बैच रिपोर्ट डाउनलोड करने के लिए कृपया लॉगिन करें",
      downloadStarted: "डाउनलोड शुरू हो गया",
      downloadDesc: "आपकी बैच रिपोर्ट डाउनलोड की जा रही है",
      notes: "नोट्स",
      addBatch: "बैच जोड़ें",
      overview: "सिंहावलोकन",
      totalBatches: "कुल बैच",
      totalBirdsCount: "कुल पक्षी",
      avgFCR: "औसत FCR",
      totalMortality: "कुल मृत्यु दर",
      performance: "प्रदर्शन",
      avgWeight: "औसत वजन",
      feedUsed: "उपयोग किया गया फीड",
      daysLeft: "बचे दिन",
      yourBatches: "आपके बैच",
      started: "शुरू किया गया",
      age: "आयु",
      mortalityRate: "मृत्यु दर",
      feedConversionRatio: "फीड रूपांतरण अनुपात",
      overallMortality: "समग्र मृत्यु दर",
      acrossAllBatches: "सभी बैचों में"
    },
    en: {
      title: "Batch Management",
      subtitle: "Manage your poultry batches, track performance, and monitor growth.",
      freeTools: "All tools are free - only saving and downloading reports requires login.",
      backToHome: "Back to Home",
      welcome: "Welcome",
      addNewBatch: "Add New Batch",
      saveReport: "Save Report",
      downloadReport: "Download Report",
      saveYourWork: "Save Your Work",
      freeToolsDesc: "You can use all batch management tools for free! Login only required to save reports and download data.",
      batchName: "Batch Name",
      startDate: "Start Date",
      totalBirds: "Total Birds",
      currentAge: "Current Age",
      mortality: "Mortality",
      feedConsumed: "Feed Consumed",
      currentWeight: "Current Weight",
      fcr: "FCR",
      status: "Status",
      active: "Active",
      days: "days",
      kg: "kg",
      bags: "bags",
      fillAllFields: "Please fill in all required fields",
      batchAdded: "Batch Added",
      batchCreated: "New batch has been created successfully",
      loginRequired: "Login Required",
      loginToSave: "Please login to save batch reports",
      reportSaved: "Report Saved",
      reportSavedDesc: "Batch report has been saved to your account",
      loginToDownload: "Please login to download batch reports",
      downloadStarted: "Download Started",
      downloadDesc: "Your batch report is being downloaded",
      notes: "Notes",
      addBatch: "Add Batch",
      overview: "Overview",
      totalBatches: "Total Batches",
      totalBirdsCount: "Total Birds",
      avgFCR: "Avg FCR",
      totalMortality: "Total Mortality",
      performance: "Performance",
      avgWeight: "Avg Weight",
      feedUsed: "Feed Used",
      daysLeft: "Days Left",
      yourBatches: "Your Batches", 
      started: "Started",
      age: "Age",
      mortalityRate: "Mortality Rate",
      feedConversionRatio: "Feed conversion ratio",
      overallMortality: "Overall mortality",
      acrossAllBatches: "Across all batches"
    }
  };

  // Translation helper function - prioritize Google Translate
  const bt = (key: string): string => {
    // First try Enhanced Translation Context (Google Translate)
    const dynamicTranslation = t(key);
    if (dynamicTranslation && dynamicTranslation !== key) {
      console.log(`🌍 Google Translate used for BatchManagement: ${key} -> ${dynamicTranslation}`);
      return dynamicTranslation;
    }

    // Fallback to local translations
    const localTranslation = batchTranslations[language][key as keyof typeof batchTranslations[typeof language]] || 
                             batchTranslations.en[key as keyof typeof batchTranslations.en];
    
    if (localTranslation) {
      console.log(`📚 Local translation used for BatchManagement: ${key} -> ${localTranslation}`);
      return localTranslation;
    }

    console.log(`❌ No translation found for BatchManagement: ${key}`);
    return key;
  };
  const [batches, setBatches] = useState([
    {
      id: 1,
      name: "Batch A-2024-001",
      startDate: "2024-01-15",
      birds: 1000,
      currentAge: 35,
      mortality: 25,
      feedConsumed: 1200,
      feedBagsUsed: 25, // NEW: Track feed bags used
      currentWeight: 1.8,
      fcr: 1.67,
      status: "Active",
      vaccineReminders: [ // NEW: Vaccine tracking
        { name: "Newcastle Disease", dueDate: "2024-08-10", status: "pending" },
        { name: "Infectious Bronchitis", dueDate: "2024-08-15", status: "completed" }
      ]
    },
    {
      id: 2,
      name: "Batch B-2024-002", 
      startDate: "2024-02-01",
      birds: 1500,
      currentAge: 21,
      mortality: 15,
      feedConsumed: 800,
      feedBagsUsed: 25, // NEW: Track feed bags used
      currentWeight: 1.2,
      fcr: 1.33,
      status: "Active",
      vaccineReminders: [ // NEW: Vaccine tracking
        { name: "Marek's Disease", dueDate: "2024-08-08", status: "pending" }
      ]
    }
  ]);

  // NEW: Feed stock state
  const [feedStock, setFeedStock] = useState({
    totalBags: 100,
    usedBags: 50,
    remainingBags: 50
  });

  const [showAddBatch, setShowAddBatch] = useState(false);
  const [showVaccineReminder, setShowVaccineReminder] = useState(false);
  const [showFeedUpdate, setShowFeedUpdate] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  
  const [newBatch, setNewBatch] = useState({
    name: "",
    startDate: "",
    birds: "",
    notes: ""
  });

  // NEW: State for vaccine reminder
  const [newVaccine, setNewVaccine] = useState({
    name: "",
    dueDate: "",
    notes: ""
  });

  // NEW: State for feed update
  const [feedUpdate, setFeedUpdate] = useState({
    batchId: 0,
    feedBagsToAdd: "",
    updateType: "add" // or "set"
  });

  const addBatch = () => {
    if (!newBatch.name || !newBatch.startDate || !newBatch.birds) {
      toast({
        title: bt("error"),
        description: bt("fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    const batch = {
      id: batches.length + 1,
      name: newBatch.name,
      startDate: newBatch.startDate,
      birds: parseInt(newBatch.birds),
      currentAge: 0,
      mortality: 0,
      feedConsumed: 0,
      feedBagsUsed: 0, // NEW: Initialize feed bags used
      currentWeight: 0,
      fcr: 0,
      status: "Active",
      vaccineReminders: [] // NEW: Initialize vaccine reminders
    };

    setBatches([...batches, batch]);
    setNewBatch({ name: "", startDate: "", birds: "", notes: "" });
    setShowAddBatch(false);
    
    toast({
      title: bt("batchAdded"),
      description: bt("batchCreated"),
    });
  };

  const handleSaveReport = () => {
    if (!currentUser) {
      toast({
        title: bt("loginRequired"),
        description: bt("loginToSave"),
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: bt("reportSaved"),
      description: bt("reportSavedDesc"),
    });
  };

  const handleDownloadReport = () => {
    if (!currentUser) {
      toast({
        title: bt("loginRequired"), 
        description: bt("loginToDownload"),
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: bt("downloadStarted"),
      description: bt("downloadDesc"),
    });
  };

  // NEW: Add vaccine reminder function
  const addVaccineReminder = () => {
    if (!newVaccine.name || !newVaccine.dueDate || !selectedBatchId) {
      toast({
        title: "Error",
        description: "Please fill all vaccine reminder fields",
        variant: "destructive",
      });
      return;
    }

    setBatches(batches.map(batch => 
      batch.id === selectedBatchId 
        ? {
            ...batch,
            vaccineReminders: [
              ...batch.vaccineReminders,
              {
                name: newVaccine.name,
                dueDate: newVaccine.dueDate,
                status: "pending"
              }
            ]
          }
        : batch
    ));

    setNewVaccine({ name: "", dueDate: "", notes: "" });
    setShowVaccineReminder(false);
    setSelectedBatchId(null);
    
    toast({
      title: "Vaccine Reminder Added",
      description: `${newVaccine.name} reminder added successfully`,
    });
  };

  // NEW: Update feed bags function
  const updateFeedBags = () => {
    if (!feedUpdate.feedBagsToAdd || !feedUpdate.batchId) {
      toast({
        title: "Error",
        description: "Please enter feed bags amount",
        variant: "destructive",
      });
      return;
    }

    const bagsToAdd = parseInt(feedUpdate.feedBagsToAdd);
    
    setBatches(batches.map(batch => {
      if (batch.id === feedUpdate.batchId) {
        const newFeedBags = feedUpdate.updateType === "add" 
          ? batch.feedBagsUsed + bagsToAdd 
          : bagsToAdd;
        
        // Auto-calculate FCR: (Feed consumed in kg) / (Total weight gain)
        const totalWeight = batch.currentWeight * (batch.birds - batch.mortality);
        const feedConsumedKg = newFeedBags * 50; // Assuming 50kg per bag
        const newFCR = totalWeight > 0 ? feedConsumedKg / totalWeight : 0;
        
        return {
          ...batch,
          feedBagsUsed: newFeedBags,
          feedConsumed: feedConsumedKg,
          fcr: parseFloat(newFCR.toFixed(2))
        };
      }
      return batch;
    }));

    // Update stock
    setFeedStock(prev => ({
      ...prev,
      usedBags: prev.usedBags + (feedUpdate.updateType === "add" ? bagsToAdd : bagsToAdd - batches.find(b => b.id === feedUpdate.batchId)?.feedBagsUsed || 0),
      remainingBags: prev.totalBags - (prev.usedBags + (feedUpdate.updateType === "add" ? bagsToAdd : bagsToAdd - batches.find(b => b.id === feedUpdate.batchId)?.feedBagsUsed || 0))
    }));

    setFeedUpdate({ batchId: 0, feedBagsToAdd: "", updateType: "add" });
    setShowFeedUpdate(false);
    
    toast({
      title: "Feed Updated",
      description: `Feed consumption updated and FCR recalculated`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-green-600 hover:text-green-700">
                <ArrowLeft className="w-5 h-5" />
                <span>{bt("backToHome")}</span>
              </Link>
              <div className="flex items-center gap-2">
                <Bird className="w-8 h-8 text-green-600" />
                <h1 className="text-2xl font-bold text-green-600">{bt("title")}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <TranslationStatus />
              {!currentUser ? (
                <>
                  <Link to="/login">
                    <Button variant="outline">{t("login")}</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-green-600 hover:bg-green-700">{t("register")}</Button>
                  </Link>
                </>
              ) : (
                <span className="text-sm text-gray-600">{bt("welcome")}, {currentUser.email}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{bt("title")}</h1>
            <p className="text-gray-600 mb-6">
              {bt("subtitle")} {bt("freeTools")}
            </p>
            
            <div className="flex gap-4 flex-wrap">
              <Button onClick={() => setShowAddBatch(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                {bt("addNewBatch")}
              </Button>
              <Button onClick={handleSaveReport} variant="outline" className="gap-2">
                <Save className="w-4 h-4" />
                {bt("saveReport")}
              </Button>
              <Button onClick={handleDownloadReport} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                {bt("downloadReport")}
              </Button>
            </div>
          </div>

          {/* Login Prompt */}
          {!currentUser && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">{bt("saveYourWork")}</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      {bt("freeToolsDesc")}
                    </p>
                    <div className="flex gap-2">
                      <Link to="/login">
                        <Button size="sm">{t("login")}</Button>
                      </Link>
                      <Link to="/register">
                        <Button size="sm" variant="outline">{t("register")}</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add New Batch Form */}
          {showAddBatch && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{bt("addNewBatch")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batchName">{bt("batchName")} *</Label>
                    <Input
                      id="batchName"
                      placeholder="e.g., Batch A-2024-003"
                      value={newBatch.name}
                      onChange={(e) => setNewBatch({...newBatch, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">{bt("startDate")} *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newBatch.startDate}
                      onChange={(e) => setNewBatch({...newBatch, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="birds">{bt("totalBirds")} *</Label>
                    <Input
                      id="birds"
                      type="number" 
                      placeholder="e.g., 1000"
                      value={newBatch.birds}
                      onChange={(e) => setNewBatch({...newBatch, birds: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">{bt("notes")}</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about this batch"
                      value={newBatch.notes}
                      onChange={(e) => setNewBatch({...newBatch, notes: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addBatch}>{bt("addBatch")}</Button>
                  <Button variant="outline" onClick={() => setShowAddBatch(false)}>{t("cancel")}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Batch Overview Cards */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{bt("totalBatches")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batches.length}</div>
                <p className="text-xs text-muted-foreground">{bt("active")}: {batches.filter(b => b.status === 'Active').length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{bt("totalBirdsCount")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batches.reduce((sum, b) => sum + b.birds, 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{bt("performance")}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{bt("avgFCR")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(batches.reduce((sum, b) => sum + b.fcr, 0) / batches.length).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">{bt("performance")}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{bt("totalMortality")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((batches.reduce((sum, b) => sum + b.mortality, 0) / batches.reduce((sum, b) => sum + b.birds, 0)) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">{bt("mortality")}</p>
              </CardContent>
            </Card>

            {/* NEW: Feed Stock Card */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  Feed Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{feedStock.remainingBags}</div>
                <p className="text-xs text-orange-600">bags left</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 text-xs"
                  onClick={() => setShowFeedUpdate(true)}
                >
                  Update Feed
                </Button>
              </CardContent>
            </Card>

            {/* NEW: Vaccine Reminders Card */}
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <Syringe className="w-4 h-4" />
                  Vaccines Due
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {batches.reduce((sum, b) => sum + b.vaccineReminders.filter(v => v.status === 'pending').length, 0)}
                </div>
                <p className="text-xs text-purple-600">pending</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 text-xs"
                  onClick={() => setShowVaccineReminder(true)}
                >
                  Add Reminder
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Batch List */}
          <Card>
            <CardHeader>
              <CardTitle>{bt("yourBatches")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {batches.map((batch) => (
                  <div key={batch.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{batch.name}</h4>
                        <p className="text-sm text-gray-600">{bt("startDate")}: {batch.startDate}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          batch.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {bt("active")}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{bt("currentAge")}: {batch.currentAge} {bt("days")}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-6 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium">{batch.birds}</p>
                          <p className="text-gray-600">{bt("totalBirds")}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Weight className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-medium">{batch.currentWeight} {bt("kg")}</p>
                          <p className="text-gray-600">{bt("avgWeight")}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="font-medium">{batch.mortality}</p>
                          <p className="text-gray-600">{bt("mortality")}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-amber-600" />
                        <div>
                          <p className="font-medium">{batch.feedBagsUsed} bags</p>
                          <p className="text-gray-600">Feed Used</p>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-xs p-1 h-auto"
                            onClick={() => {
                              setFeedUpdate({...feedUpdate, batchId: batch.id});
                              setShowFeedUpdate(true);
                            }}
                          >
                            <Calculator className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="font-medium">{batch.fcr}</p>
                          <p className="text-gray-600">{bt("fcr")}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Syringe className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="font-medium">
                            {batch.vaccineReminders.filter(v => v.status === 'pending').length}
                          </p>
                          <p className="text-gray-600">Vaccines Due</p>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-xs p-1 h-auto"
                            onClick={() => {
                              setSelectedBatchId(batch.id);
                              setShowVaccineReminder(true);
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* NEW: Vaccine Reminders List */}
                    {batch.vaccineReminders.length > 0 && (
                      <div className="border-t pt-3">
                        <p className="text-sm font-medium mb-2">Vaccine Schedule:</p>
                        <div className="flex gap-2 flex-wrap">
                          {batch.vaccineReminders.map((vaccine, idx) => (
                            <Badge 
                              key={idx} 
                              variant={vaccine.status === 'pending' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {vaccine.name} - {vaccine.dueDate}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* NEW: Feed Update Dialog */}
          <Dialog open={showFeedUpdate} onOpenChange={setShowFeedUpdate}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Feed Consumption</DialogTitle>
                <DialogDescription>
                  Update feed bags used for batch and automatically recalculate FCR
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Batch</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={feedUpdate.batchId}
                    onChange={(e) => setFeedUpdate({...feedUpdate, batchId: parseInt(e.target.value)})}
                  >
                    <option value={0}>Select a batch</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Feed Bags Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter number of bags"
                    value={feedUpdate.feedBagsToAdd}
                    onChange={(e) => setFeedUpdate({...feedUpdate, feedBagsToAdd: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Update Type</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={feedUpdate.updateType}
                    onChange={(e) => setFeedUpdate({...feedUpdate, updateType: e.target.value as "add" | "set"})}
                  >
                    <option value="add">Add to existing</option>
                    <option value="set">Set total amount</option>
                  </select>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Current Stock:</strong> {feedStock.remainingBags} bags remaining out of {feedStock.totalBags} total
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={updateFeedBags} className="flex-1">Update Feed & Recalculate FCR</Button>
                  <Button variant="outline" onClick={() => setShowFeedUpdate(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* NEW: Vaccine Reminder Dialog */}
          <Dialog open={showVaccineReminder} onOpenChange={setShowVaccineReminder}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Vaccine Reminder</DialogTitle>
                <DialogDescription>
                  Add a vaccine reminder for your batch
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Batch</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={selectedBatchId || 0}
                    onChange={(e) => setSelectedBatchId(parseInt(e.target.value))}
                  >
                    <option value={0}>Select a batch</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Vaccine Name</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={newVaccine.name}
                    onChange={(e) => setNewVaccine({...newVaccine, name: e.target.value})}
                  >
                    <option value="">Select vaccine</option>
                    <option value="Newcastle Disease">Newcastle Disease</option>
                    <option value="Infectious Bronchitis">Infectious Bronchitis</option>
                    <option value="Marek's Disease">Marek's Disease</option>
                    <option value="Fowl Pox">Fowl Pox</option>
                    <option value="Infectious Bursal Disease">Infectious Bursal Disease</option>
                    <option value="Avian Influenza">Avian Influenza</option>
                  </select>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newVaccine.dueDate}
                    onChange={(e) => setNewVaccine({...newVaccine, dueDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Additional notes about the vaccine"
                    value={newVaccine.notes}
                    onChange={(e) => setNewVaccine({...newVaccine, notes: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addVaccineReminder} className="flex-1">Add Reminder</Button>
                  <Button variant="outline" onClick={() => setShowVaccineReminder(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
