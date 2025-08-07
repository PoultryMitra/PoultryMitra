import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

export default function BatchManagementImproved() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // Enhanced language management with localStorage persistence
  const [language, setLanguage] = useState(() => {
    // Try to get language from localStorage, default to Hindi
    const savedLanguage = localStorage.getItem('fowl-app-language');
    return savedLanguage || "hi";
  });

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fowl-app-language', language);
  }, [language]);

  // Enhanced content with more comprehensive translations
  const content = {
    hi: {
      title: "बैच प्रबंधन",
      subtitle: "अपने पोल्ट्री बैच का प्रबंधन करें, प्रदर्शन को ट्रैक करें, और विकास की निगरानी करें।",
      freeTools: "सभी उपकरण मुफ्त हैं - केवल रिपोर्ट सेव करने और डाउनलोड करने के लिए लॉगिन आवश्यक है।",
      backToHome: "होम पर वापस",
      login: "लॉगिन",
      register: "रजिस्टर",
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
      fcr: "FCR (फीड रूपांतरण अनुपात)", 
      status: "स्थिति",
      active: "सक्रिय",
      days: "दिन",
      kg: "किलोग्राम",
      bags: "बोरे",
      error: "त्रुटि",
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
      cancel: "रद्द करें",
      addBatch: "बैच जोड़ें",
      overview: "सिंहावलोकन",
      totalBatches: "कुल बैच",
      totalBirdsCount: "कुल पक्षी संख्या",
      avgFCR: "औसत FCR",
      totalMortality: "कुल मृत्यु दर",
      performance: "प्रदर्शन",
      avgWeight: "औसत वजन",
      feedUsed: "उपयोग किया गया फीड",
      daysLeft: "बचे हुए दिन",
      yourBatches: "आपके बैच",
      started: "शुरू किया गया",
      age: "आयु",
      mortalityRate: "मृत्यु दर",
      feedConversionRatio: "फीड रूपांतरण अनुपात",
      overallMortality: "समग्र मृत्यु दर",
      acrossAllBatches: "सभी बैचों में",
      batchNamePlaceholder: "उदाहरण: बैच ए-2024-003",
      notesPlaceholder: "इस बैच के बारे में अतिरिक्त जानकारी",
      totalBirdsPlaceholder: "उदाहरण: 1000",
      languageSwitch: "भाषा बदलें",
      currentLanguage: "वर्तमान भाषा: हिंदी"
    },
    en: {
      title: "Batch Management",
      subtitle: "Manage your poultry batches, track performance, and monitor growth.",
      freeTools: "All tools are free - only saving and downloading reports requires login.",
      backToHome: "Back to Home",
      login: "Login",
      register: "Register", 
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
      fcr: "FCR (Feed Conversion Ratio)",
      status: "Status",
      active: "Active",
      days: "days",
      kg: "kg",
      bags: "bags",
      error: "Error",
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
      cancel: "Cancel",
      addBatch: "Add Batch",
      overview: "Overview",
      totalBatches: "Total Batches",
      totalBirdsCount: "Total Birds Count",
      avgFCR: "Average FCR",
      totalMortality: "Total Mortality",
      performance: "Performance",
      avgWeight: "Average Weight",
      feedUsed: "Feed Used",
      daysLeft: "Days Left",
      yourBatches: "Your Batches", 
      started: "Started",
      age: "Age",
      mortalityRate: "Mortality Rate",
      feedConversionRatio: "Feed Conversion Ratio",
      overallMortality: "Overall Mortality",
      acrossAllBatches: "Across All Batches",
      batchNamePlaceholder: "e.g., Batch A-2024-003",
      notesPlaceholder: "Additional information about this batch",
      totalBirdsPlaceholder: "e.g., 1000",
      languageSwitch: "Switch Language",
      currentLanguage: "Current Language: English"
    }
  };

  // Enhanced translation function with fallback
  const t = (key) => {
    return content[language]?.[key] || content['en']?.[key] || key;
  };

  // Enhanced language toggle with user feedback
  const toggleLanguage = () => {
    const newLanguage = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLanguage);
    
    toast({
      title: newLanguage === 'hi' ? "भाषा बदली गई" : "Language Changed",
      description: newLanguage === 'hi' 
        ? "अब सभी टेक्स्ट हिंदी में दिखेगा" 
        : "All text will now appear in English",
      duration: 2000,
    });
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
      currentWeight: 1.8,
      fcr: 1.67,
      status: "Active"
    },
    {
      id: 2,
      name: "Batch B-2024-002", 
      startDate: "2024-02-01",
      birds: 1500,
      currentAge: 21,
      mortality: 15,
      feedConsumed: 800,
      currentWeight: 1.2,
      fcr: 1.33,
      status: "Active"
    }
  ]);

  const [showAddBatch, setShowAddBatch] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: "",
    startDate: "",
    birds: "",
    notes: ""
  });

  const addBatch = () => {
    if (!newBatch.name || !newBatch.startDate || !newBatch.birds) {
      toast({
        title: t('error'),
        description: t('fillAllFields'),
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
      currentWeight: 0,
      fcr: 0,
      status: "Active"
    };

    setBatches([...batches, batch]);
    setNewBatch({ name: "", startDate: "", birds: "", notes: "" });
    setShowAddBatch(false);
    
    toast({
      title: t('batchAdded'),
      description: t('batchCreated'),
    });
  };

  const handleSaveReport = () => {
    if (!currentUser) {
      toast({
        title: t('loginRequired'),
        description: t('loginToSave'),
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: t('reportSaved'),
      description: t('reportSavedDesc'),
    });
  };

  const handleDownloadReport = () => {
    if (!currentUser) {
      toast({
        title: t('loginRequired'), 
        description: t('loginToDownload'),
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: t('downloadStarted'),
      description: t('downloadDesc'),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Enhanced Header with better language indicator */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">{t('backToHome')}</span>
              </Link>
              <div className="flex items-center gap-2">
                <Bird className="w-8 h-8 text-green-600" />
                <h1 className="text-2xl font-bold text-green-600">{t('title')}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center gap-2 hover:bg-green-50 border-green-200"
                title={t('languageSwitch')}
              >
                <Globe className="w-4 h-4" />
                <span className="font-medium">
                  {language === 'hi' ? 'English' : 'हिंदी'}
                </span>
              </Button>
              {!currentUser ? (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="hover:bg-blue-50">{t('login')}</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-green-600 hover:bg-green-700">{t('register')}</Button>
                  </Link>
                </>
              ) : (
                <span className="text-sm text-gray-600 font-medium">
                  {t('welcome')}, {currentUser.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header Section with language indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {t('currentLanguage')}
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              {t('subtitle')} {t('freeTools')}
            </p>
            
            <div className="flex gap-4 flex-wrap">
              <Button onClick={() => setShowAddBatch(true)} className="gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4" />
                {t('addNewBatch')}
              </Button>
              <Button onClick={handleSaveReport} variant="outline" className="gap-2">
                <Save className="w-4 h-4" />
                {t('saveReport')}
              </Button>
              <Button onClick={handleDownloadReport} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                {t('downloadReport')}
              </Button>
            </div>
          </div>

          {/* Enhanced Login Prompt */}
          {!currentUser && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">{t('saveYourWork')}</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      {t('freeToolsDesc')}
                    </p>
                    <div className="flex gap-2">
                      <Link to="/login">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">{t('login')}</Button>
                      </Link>
                      <Link to="/register">
                        <Button size="sm" variant="outline">{t('register')}</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Add New Batch Form */}
          {showAddBatch && (
            <Card className="mb-6 border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-800">{t('addNewBatch')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batchName" className="text-sm font-medium text-gray-700">
                      {t('batchName')} *
                    </Label>
                    <Input
                      id="batchName"
                      placeholder={t('batchNamePlaceholder')}
                      value={newBatch.name}
                      onChange={(e) => setNewBatch({...newBatch, name: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                      {t('startDate')} *
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newBatch.startDate}
                      onChange={(e) => setNewBatch({...newBatch, startDate: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birds" className="text-sm font-medium text-gray-700">
                      {t('totalBirds')} *
                    </Label>
                    <Input
                      id="birds"
                      type="number" 
                      placeholder={t('totalBirdsPlaceholder')}
                      value={newBatch.birds}
                      onChange={(e) => setNewBatch({...newBatch, birds: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                      {t('notes')}
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder={t('notesPlaceholder')}
                      value={newBatch.notes}
                      onChange={(e) => setNewBatch({...newBatch, notes: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={addBatch} className="bg-green-600 hover:bg-green-700">
                    {t('addBatch')}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddBatch(false)}>
                    {t('cancel')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Batch Overview Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="border-blue-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">{t('totalBatches')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{batches.length}</div>
                <p className="text-xs text-blue-600">{t('active')}: {batches.filter(b => b.status === 'Active').length}</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">{t('totalBirdsCount')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{batches.reduce((sum, b) => sum + b.birds, 0).toLocaleString()}</div>
                <p className="text-xs text-green-600">{t('performance')}</p>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">{t('avgFCR')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">
                  {batches.length > 0 ? (batches.reduce((sum, b) => sum + b.fcr, 0) / batches.length).toFixed(2) : '0.00'}
                </div>
                <p className="text-xs text-orange-600">{t('performance')}</p>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-700">{t('overallMortality')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">
                  {batches.length > 0 ? ((batches.reduce((sum, b) => sum + b.mortality, 0) / batches.reduce((sum, b) => sum + b.birds, 0)) * 100).toFixed(1) : '0.0'}%
                </div>
                <p className="text-xs text-red-600">{t('acrossAllBatches')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Batch List */}
          <Card className="border-gray-200">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-gray-800">{t('yourBatches')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {batches.map((batch) => (
                  <div key={batch.id} className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">{batch.name}</h4>
                        <p className="text-sm text-gray-600">{t('started')}: {batch.startDate}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          batch.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {t('active')}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{t('age')}: {batch.currentAge} {t('days')}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-6 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{batch.birds.toLocaleString()}</p>
                          <p className="text-gray-600">{t('totalBirds')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Weight className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{batch.currentWeight} {t('kg')}</p>
                          <p className="text-gray-600">{t('avgWeight')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="font-medium text-gray-900">{batch.mortality}</p>
                          <p className="text-gray-600">{t('mortalityRate')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">{batch.feedConsumed} {t('kg')}</p>
                          <p className="text-gray-600">{t('feedUsed')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="font-medium text-gray-900">{batch.fcr}</p>
                          <p className="text-gray-600">{t('fcr')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="font-medium text-gray-900">{42 - batch.currentAge}</p>
                          <p className="text-gray-600">{t('daysLeft')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
