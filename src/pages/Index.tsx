import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Globe, Calculator, TrendingUp, Users, Shield, Award, Play, Bird, Feather, Star, CheckCircle } from "lucide-react";

const Index = () => {
  const [language, setLanguage] = useState("hi");
  
  const toggleLanguage = () => {
    setLanguage(language === "hi" ? "en" : "hi");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const content = {
    hi: {
      header: {
        title: "पोल्ट्री मित्र",
        about: "हमारे बारे में",
        services: "सेवाएं",
        contact: "संपर्क",
        login: "लॉग इन",
        register: "रजिस्टर करें"
      },
      hero: {
        title: "भारत का सबसे बेहतरीन पोल्ट्री फार्म मैनेजमेंट सिस्टम",
        subtitle: "अपने मुर्गी पालन व्यवसाय को डिजिटल बनाएं। FCR कैलकुलेशन से लेकर खर्च ट्रैकिंग तक - सब कुछ एक ही जगह!",
        freeFCR: "मुफ्त FCR कैलकुलेटर",
        startFree: "मुफ्त शुरू करें",
        watchDemo: "डेमो देखें"
      },
      features: {
        title: "क्यों चुनें पोल्ट्री मित्र?",
        subtitle: "आधुनिक किसानों के लिए बनाया गया, परंपरागत मूल्यों के साथ",
        fcr: {
          title: "स्मार्ट FCR कैलकुलेटर",
          desc: "अपने फार्म की फीड कन्वर्जन रेट को सटीक रूप से कैलकुलेट करें"
        },
        expense: {
          title: "खर्च ट्रैकिंग",
          desc: "दाना, दवाई, मजदूरी - हर खर्च का हिसाब रखें"
        },
        market: {
          title: "बाजार भाव",
          desc: "लाइव मार्केट रेट्स और ट्रेंड्स देखें"
        },
        reports: {
          title: "डिटेल्ड रिपोर्ट्स",
          desc: "अपने बिजनेस की पूरी जानकारी ग्राफ और चार्ट में देखें"
        }
      },
      stats: {
        farmers: "खुश किसान",
        success: "सफलता दर",
        support: "24/7 सपोर्ट",
        growth: "औसत ग्रोथ"
      },
      testimonials: {
        title: "किसान क्या कहते हैं",
        t1: {
          text: "पोल्ट्री मित्र से मेरा मुनाफा 30% बढ़ गया है। FCR कैलकुलेटर बहुत काम का है।",
          name: "राजेश कुमार",
          location: "हरियाणा"
        },
        t2: {
          text: "खर्च का हिसाब रखना अब बहुत आसान हो गया। बहुत बढ़िया ऐप है।",
          name: "सुनीता देवी",
          location: "पंजाब"
        }
      },
      cta: {
        title: "आज ही शुरू करें अपना डिजिटल पोल्ट्री जर्नी",
        subtitle: "हजारों किसानों का भरोसा। आपका भी इंतजार है।",
        button: "मुफ्त रजिस्टर करें"
      }
    },
    en: {
      header: {
        title: "Poultry Mitra",
        about: "About",
        services: "Services",
        contact: "Contact",
        login: "Login",
        register: "Register"
      },
      hero: {
        title: "India's Best Poultry Farm Management System",
        subtitle: "Digitize your poultry business. From FCR calculation to expense tracking - everything in one place!",
        freeFCR: "Free FCR Calculator",
        startFree: "Start Free",
        watchDemo: "Watch Demo"
      },
      features: {
        title: "Why Choose Poultry Mitra?",
        subtitle: "Built for modern farmers with traditional values",
        fcr: {
          title: "Smart FCR Calculator",
          desc: "Calculate your farm's Feed Conversion Rate accurately"
        },
        expense: {
          title: "Expense Tracking",
          desc: "Track feed, medicine, labor - every expense"
        },
        market: {
          title: "Market Rates",
          desc: "View live market rates and trends"
        },
        reports: {
          title: "Detailed Reports",
          desc: "See complete business insights in graphs and charts"
        }
      },
      stats: {
        farmers: "Happy Farmers",
        success: "Success Rate",
        support: "24/7 Support",
        growth: "Average Growth"
      },
      testimonials: {
        title: "What Farmers Say",
        t1: {
          text: "Poultry Mitra increased my profit by 30%. The FCR calculator is very useful.",
          name: "Rajesh Kumar",
          location: "Haryana"
        },
        t2: {
          text: "Expense tracking has become very easy. Excellent app.",
          name: "Sunita Devi",
          location: "Punjab"
        }
      },
      cta: {
        title: "Start Your Digital Poultry Journey Today",
        subtitle: "Trusted by thousands of farmers. Your turn awaits.",
        button: "Register Free"
      }
    }
  };

  const currentContent = content[language as keyof typeof content];
  
  // Translation function
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = currentContent;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">{t('header.title')}</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/about" className="text-gray-500 hover:text-gray-900">{t('nav.about')}</Link>
              <Link to="/services" className="text-gray-500 hover:text-gray-900">{t('nav.services')}</Link>
              <Link to="/contact" className="text-gray-500 hover:text-gray-900">{t('nav.contact')}</Link>
            </nav>
            <div className="flex items-center space-x-4">
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
                <Button variant="outline">{t('nav.login')}</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-green-600 hover:bg-green-700">{t('nav.register')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/farmer-login">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                {t('hero.farmerLogin')}
              </Button>
            </Link>
            <Link to="/dealer-login">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                {t('hero.dealerLogin')}
              </Button>
            </Link>
          </div>
          <div className="mt-6">
            <Link to="/fcr-calculator">
              <Button variant="outline" size="lg" className="text-green-600 border-green-600 hover:bg-green-50">
                {t('hero.fcr')} - {t('hero.fcrFree')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('features.title')}</h2>
            <p className="text-lg text-gray-600">{t('services.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('features.fcr.title')}</CardTitle>
                <CardDescription>{t('features.fcr.shortDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{t('features.fcr.desc')}</p>
                <div className="mt-4">
                  <Link to="/fcr-calculator">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      {t('features.fcr.tryButton')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('features.expense.title')}</CardTitle>
                <CardDescription>{t('features.expense.shortDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{t('features.expense.desc')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('features.health.title')}</CardTitle>
                <CardDescription>{t('features.health.shortDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{t('features.health.desc')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('features.feed.title')}</CardTitle>
                <CardDescription>{t('features.feed.shortDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{t('features.feed.desc')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('features.rates.title')}</CardTitle>
                <CardDescription>{t('features.rates.shortDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{t('features.rates.desc')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('features.batch.title')}</CardTitle>
                <CardDescription>{t('features.batch.shortDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{t('features.batch.desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">{t('header.title')}</h3>
              <p className="text-gray-300 mb-4">
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
              <ul className="space-y-2">
                <li><Link to="/about" onClick={scrollToTop} className="text-gray-300 hover:text-white">{t('nav.about')}</Link></li>
                <li><Link to="/services" onClick={scrollToTop} className="text-gray-300 hover:text-white">{t('nav.services')}</Link></li>
                <li><Link to="/contact" onClick={scrollToTop} className="text-gray-300 hover:text-white">{t('nav.contact')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2">
                <li><Link to="/help" onClick={scrollToTop} className="text-gray-300 hover:text-white">{t('footer.help')}</Link></li>
                <li><Link to="/privacy" onClick={scrollToTop} className="text-gray-300 hover:text-white">{t('footer.privacy')}</Link></li>
                <li><Link to="/terms" onClick={scrollToTop} className="text-gray-300 hover:text-white">{t('footer.terms')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-300">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
