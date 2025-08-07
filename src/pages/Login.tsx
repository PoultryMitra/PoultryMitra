import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { useEnhancedTranslation } from "@/contexts/EnhancedTranslationContext";
import { LanguageToggle, TranslationStatus } from "@/components/TranslationComponents";

export default function Login() {
  const { language, t } = useEnhancedTranslation();

  // Enhanced translation helper that prioritizes Google Translate
  const bt = (key: string): string => {
    // First try Enhanced Translation Context (Google Translate)
    const dynamicTranslation = t(key);
    if (dynamicTranslation && dynamicTranslation !== key) {
      console.log(`🌍 Google Translate used for Login: ${key} -> ${dynamicTranslation}`);
      return dynamicTranslation;
    }

    // Fallback to local content
    const content = {
      'login.welcome': { hi: "पोल्ट्री मित्र में आपका स्वागत है", en: "Welcome to Poultry Mitra" },
      'login.chooseLogin': { hi: "जारी रखने के लिए अपना लॉगिन प्रकार चुनें", en: "Choose your login type to continue" },
      'login.farmerLogin': { hi: "किसान लॉगिन", en: "Farmer Login" },
      'login.farmerDesc': { hi: "फार्म प्रबंधन उपकरण, ट्रैक खर्च, फसल की निगरानी और अधिक एक्सेस करें।", en: "Access farm management tools, track expenses, monitor crops, and more." },
      'login.continueAsFarmer': { hi: "किसान के रूप में जारी रखें", en: "Continue as Farmer" },
      'login.dealerLogin': { hi: "डीलर लॉगिन", en: "Dealer Login" },
      'login.dealerDesc': { hi: "ऑर्डर, ग्राहक, उत्पाद प्रबंधित करें और बाजार दरें देखें।", en: "Manage orders, customers, products, and view market rates." },
      'login.continueAsDealer': { hi: "डीलर के रूप में जारी रखें", en: "Continue as Dealer" },
      'login.noAccount': { hi: "कोई खाता नहीं है?", en: "Don't have an account?" },
      'login.registerHere': { hi: "यहाँ रजिस्टर करें", en: "Register here" },
      'login.backToHome': { hi: "← होम पर वापस जाएं", en: "← Back to home" },
      'login.adminLogin': { hi: "एडमिन लॉगिन", en: "Admin Login" }
    };
    
    const translation = content[key as keyof typeof content];
    if (translation) {
      const staticTranslation = translation[language as keyof typeof translation] || translation.en;
      console.log(`📚 Static content used for Login: ${key} -> ${staticTranslation}`);
      return staticTranslation;
    }
    
    console.log(`❌ No translation found for Login: ${key}`);
    return key;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            {/* Language Toggle */}
            <div className="flex justify-end mb-2">
              <LanguageToggle />
              <TranslationStatus />
            </div>
            
            <CardTitle className="text-3xl font-bold text-green-600">{bt('login.welcome')}</CardTitle>
            <CardDescription className="text-lg">{bt('login.chooseLogin')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/farmer-login">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300">
                  <CardHeader>
                    <CardTitle className="text-green-600">{bt('login.farmerLogin')}</CardTitle>
                    <CardDescription>
                      {bt('login.farmerDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      {bt('login.continueAsFarmer')}
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/dealer-login">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300">
                  <CardHeader>
                    <CardTitle className="text-blue-600">{bt('login.dealerLogin')}</CardTitle>
                    <CardDescription>
                      {bt('login.dealerDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      {bt('login.continueAsDealer')}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-4">
                {bt('login.noAccount')}{" "}
                <Link to="/register" className="text-green-600 hover:underline font-medium">
                  {bt('login.registerHere')}
                </Link>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <Link to="/" className="text-green-600 hover:underline">
                  {bt('login.backToHome')}
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                <Link to="/admin-login" className="text-purple-600 hover:underline">
                  {bt('login.adminLogin')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}