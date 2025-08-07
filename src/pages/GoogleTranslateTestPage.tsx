import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEnhancedTranslation } from '@/contexts/EnhancedTranslationContext';
import { LanguageToggle } from '@/components/TranslationComponents';
import { CheckCircle, Globe, ArrowRight, Home, User, Package, FileText, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

const GoogleTranslateTestPage: React.FC = () => {
  const { language, t } = useEnhancedTranslation();

  // Test bt() function like other pages
  const testTranslations = {
    en: {
      title: "Google Translate Integration Test",
      subtitle: "Testing all pages with Google Translate",
      status: "Implementation Status",
      working: "Working with Google Translate",
      pageTests: {
        title: "Page Translation Tests",
        description: "Click to test translations on each page"
      },
      features: {
        title: "New Features",
        apiKey: "No API key required",
        fallback: "Local dictionary fallback",
        cache: "24-hour translation cache",
        endpoints: "Multiple Google endpoints"
      },
      instructions: {
        title: "How to Test",
        step1: "Use the language toggle above (हिंदी | English)",
        step2: "Visit each page using the buttons below",
        step3: "Verify translations work on all pages",
        step4: "Check console for any translation errors"
      }
    },
    hi: {
      title: "गूगल अनुवाद एकीकरण परीक्षण",
      subtitle: "गूगल अनुवाद के साथ सभी पेजों का परीक्षण",
      status: "कार्यान्वयन स्थिति",
      working: "गूगल अनुवाद के साथ काम कर रहा है",
      pageTests: {
        title: "पेज अनुवाद परीक्षण",
        description: "प्रत्येक पेज पर अनुवाद का परीक्षण करने के लिए क्लिक करें"
      },
      features: {
        title: "नई सुविधाएं",
        apiKey: "एपीआई की की आवश्यकता नहीं",
        fallback: "स्थानीय शब्दकोश फॉलबैक",
        cache: "24 घंटे अनुवाद कैश",
        endpoints: "कई गूगल एंडपॉइंट्स"
      },
      instructions: {
        title: "परीक्षण कैसे करें",
        step1: "ऊपर भाषा टॉगल का उपयोग करें (हिंदी | English)",
        step2: "नीचे दिए गए बटनों का उपयोग करके प्रत्येक पेज पर जाएं",
        step3: "सभी पेजों पर अनुवाद काम करने की पुष्टि करें",
        step4: "किसी भी अनुवाद त्रुटि के लिए कंसोल जांचें"
      }
    }
  };

  const bt = (key: string) => {
    const keys = key.split('.');
    let value: any = testTranslations[language as keyof typeof testTranslations];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const testPages = [
    {
      name: bt('pageTests.home') || 'Homepage',
      path: '/',
      icon: Home,
      status: 'working'
    },
    {
      name: bt('pageTests.login') || 'Login',
      path: '/login',
      icon: User,
      status: 'working'
    },
    {
      name: bt('pageTests.register') || 'Register',
      path: '/register',
      icon: User,
      status: 'working'
    },
    {
      name: bt('pageTests.dealerDashboard') || 'Dealer Dashboard',
      path: '/dealer-dashboard',
      icon: Package,
      status: 'working'
    },
    {
      name: bt('pageTests.batchManagement') || 'Batch Management',
      path: '/batch-management',
      icon: FileText,
      status: 'working'
    },
    {
      name: bt('pageTests.googleDemo') || 'Google Translate Demo',
      path: '/google-translate-demo',
      icon: Globe,
      status: 'new'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Globe className="h-10 w-10 text-green-600" />
          <h1 className="text-4xl font-bold text-gray-900">
            {bt('title')}
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {bt('subtitle')}
        </p>
        
        <div className="flex justify-center">
          <LanguageToggle />
        </div>
      </div>

      {/* Implementation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {bt('status')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">{bt('features.apiKey')}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{bt('features.fallback')}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">{bt('features.cache')}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">{bt('features.endpoints')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Tests */}
      <Card>
        <CardHeader>
          <CardTitle>{bt('pageTests.title')}</CardTitle>
          <CardDescription>
            {bt('pageTests.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testPages.map((page, index) => {
              const IconComponent = page.icon;
              return (
                <Link key={index} to={page.path}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{page.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge 
                          variant={page.status === 'working' ? 'default' : 'secondary'}
                          className={page.status === 'working' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {page.status === 'working' ? bt('working') : 'New'}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>{bt('instructions.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <p className="text-gray-700">{bt('instructions.step1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-gray-700">{bt('instructions.step2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <p className="text-gray-700">{bt('instructions.step3')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                4
              </div>
              <p className="text-gray-700">{bt('instructions.step4')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4">
        <Link to="/google-translate-demo">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Globe className="w-4 h-4 mr-2" />
            View Demo
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Back to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default GoogleTranslateTestPage;
