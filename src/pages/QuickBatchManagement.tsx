import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Plus, 
  Bird, 
  TrendingUp, 
  Download, 
  Save, 
  Users,
  Weight,
  Activity,
  DollarSign,
  ArrowLeft,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickBatchManagement() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [language, setLanguage] = useState("hi");
  
  const content = {
    hi: {
      title: "बैच प्रबंधन",
      subtitle: "अपने पोल्ट्री बैच का प्रबंधन करें",
      backToHome: "होम पर वापस",
      login: "लॉगिन",
      register: "रजिस्टर",
      addNewBatch: "नया बैच जोड़ें",
      saveReport: "रिपोर्ट सेव करें",
      downloadReport: "रिपोर्ट डाउनलोड करें",
      batchName: "बैच का नाम",
      startDate: "शुरूआती तारीख",
      totalBirds: "कुल पक्षी",
      totalBatches: "कुल बैच",
      active: "सक्रिय",
      avgFCR: "औसत FCR",
      totalMortality: "कुल मृत्यु दर",
      currentAge: "वर्तमान आयु",
      mortality: "मृत्यु दर",
      fcr: "FCR",
      kg: "किग्रा",
      days: "दिन",
      avgWeight: "औसत वजन",
      feedUsed: "फीड उपयोग",
      daysLeft: "बचे दिन",
      yourBatches: "आपके बैच",
      addBatch: "बैच जोड़ें",
      cancel: "रद्द करें",
      error: "त्रुटि",
      fillAllFields: "कृपया सभी फ़ील्ड भरें",
      batchAdded: "बैच जोड़ा गया",
      batchCreated: "नया बैच बनाया गया"
    },
    en: {
      title: "Batch Management",
      subtitle: "Manage your poultry batches",
      backToHome: "Back to Home",
      login: "Login",
      register: "Register",
      addNewBatch: "Add New Batch",
      saveReport: "Save Report",
      downloadReport: "Download Report",
      batchName: "Batch Name",
      startDate: "Start Date",
      totalBirds: "Total Birds",
      totalBatches: "Total Batches",
      active: "Active",
      avgFCR: "Avg FCR",
      totalMortality: "Total Mortality",
      currentAge: "Current Age",
      mortality: "Mortality",
      fcr: "FCR",
      kg: "kg",
      days: "days",
      avgWeight: "Avg Weight",
      feedUsed: "Feed Used",
      daysLeft: "Days Left",
      yourBatches: "Your Batches",
      addBatch: "Add Batch",
      cancel: "Cancel",
      error: "Error",
      fillAllFields: "Please fill all fields",
      batchAdded: "Batch Added",
      batchCreated: "New batch created"
    }
  };

  const t = content[language];
  
  const [batches, setBatches] = useState([
    {
      id: 1,
      name: "Batch A-001",
      startDate: "2024-01-15",
      birds: 1000,
      currentAge: 35,
      mortality: 25,
      currentWeight: 1.8,
      fcr: 1.67,
      status: "Active"
    }
  ]);

  const [showAddBatch, setShowAddBatch] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: "",
    startDate: "",
    birds: ""
  });

  const addBatch = () => {
    if (!newBatch.name || !newBatch.startDate || !newBatch.birds) {
      toast({
        title: t.error,
        description: t.fillAllFields,
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
      currentWeight: 0,
      fcr: 0,
      status: "Active"
    };

    setBatches([...batches, batch]);
    setNewBatch({ name: "", startDate: "", birds: "" });
    setShowAddBatch(false);
    
    toast({
      title: t.batchAdded,
      description: t.batchCreated,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <ArrowLeft className="w-5 h-5" />
                <span>{t.backToHome}</span>
              </Link>
              <div className="flex items-center gap-2">
                <Bird className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                {language === 'hi' ? 'EN' : 'हिं'}
              </Button>
              {!currentUser && (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">{t.login}</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">{t.register}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Quick Actions */}
        <div className="mb-6">
          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => setShowAddBatch(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {t.addNewBatch}
            </Button>
            <Button variant="outline" className="gap-2">
              <Save className="w-4 h-4" />
              {t.saveReport}
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              {t.downloadReport}
            </Button>
          </div>
        </div>

        {/* Add New Batch Form */}
        {showAddBatch && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t.addNewBatch}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="batchName">{t.batchName} *</Label>
                  <Input
                    id="batchName"
                    placeholder="Batch A-002"
                    value={newBatch.name}
                    onChange={(e) => setNewBatch({...newBatch, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">{t.startDate} *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newBatch.startDate}
                    onChange={(e) => setNewBatch({...newBatch, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="birds">{t.totalBirds} *</Label>
                  <Input
                    id="birds"
                    type="number"
                    placeholder="1000"
                    value={newBatch.birds}
                    onChange={(e) => setNewBatch({...newBatch, birds: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addBatch}>{t.addBatch}</Button>
                <Button variant="outline" onClick={() => setShowAddBatch(false)}>{t.cancel}</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Bird className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{batches.length}</div>
                  <div className="text-sm text-gray-600">{t.totalBatches}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{batches.reduce((sum, b) => sum + b.birds, 0)}</div>
                  <div className="text-sm text-gray-600">{t.totalBirds}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">1.67</div>
                  <div className="text-sm text-gray-600">{t.avgFCR}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">2.5%</div>
                  <div className="text-sm text-gray-600">{t.totalMortality}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Batch List */}
        <Card>
          <CardHeader>
            <CardTitle>{t.yourBatches}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {batches.map((batch) => (
                <div key={batch.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{batch.name}</h4>
                      <p className="text-sm text-gray-600">{batch.startDate}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {t.active}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="font-medium">{batch.birds}</div>
                      <div className="text-gray-600">{t.totalBirds}</div>
                    </div>
                    <div>
                      <div className="font-medium">{batch.currentAge} {t.days}</div>
                      <div className="text-gray-600">{t.currentAge}</div>
                    </div>
                    <div>
                      <div className="font-medium">{batch.mortality}</div>
                      <div className="text-gray-600">{t.mortality}</div>
                    </div>
                    <div>
                      <div className="font-medium">{batch.currentWeight} {t.kg}</div>
                      <div className="text-gray-600">{t.avgWeight}</div>
                    </div>
                    <div>
                      <div className="font-medium">{batch.fcr}</div>
                      <div className="text-gray-600">{t.fcr}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
