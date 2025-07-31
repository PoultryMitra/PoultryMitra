import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Globe, Calculator, TrendingUp, Users, Shield, Award, Play, Bird, Feather, Star, CheckCircle, BarChart3, DollarSign, Heart, Target } from "lucide-react";

const IndexNew = () => {
  const [language, setLanguage] = useState("hi");
  
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
        title: "भारत का #1 पोल्ट्री फार्म मैनेजमेंट सिस्टम",
        subtitle: "अपने मुर्गी पालन व्यवसाय को डिजिटल बनाएं। FCR कैलकुलेशन से लेकर खर्च ट्रैकिंग तक - सब कुछ एक ही जगह!",
        freeFCR: "मुफ्त FCR कैलकुलेटर",
        startFree: "मुफ्त शुरू करें",
        watchDemo: "डेमो देखें",
        trusted: "10,000+ किसानों का भरोसा"
      },
      features: {
        title: "क्यों चुनें पोल्ट्री मित्र?",
        subtitle: "आधुनिक किसानों के लिए बनाया गया, परंपरागत मूल्यों के साथ",
        fcr: {
          title: "स्मार्ट FCR कैलकुलेटर",
          desc: "अपने फार्म की फीड कन्वर्जन रेट को सटीक रूप से कैलकुलेट करें और मुनाफा बढ़ाएं"
        },
        expense: {
          title: "खर्च ट्रैकिंग",
          desc: "दाना, दवाई, मजदूरी - हर खर्च का हिसाब रखें और बचत करें"
        },
        market: {
          title: "लाइव बाजार भाव",
          desc: "रियल-टाइम मार्केट रेट्स और ट्रेंड्स देखें, बेहतर फैसले लें"
        },
        reports: {
          title: "डिटेल्ड एनालिटिक्स",
          desc: "अपने बिजनेस की पूरी जानकारी ग्राफ और चार्ट में देखें"
        }
      },
      stats: {
        farmers: "10,000+",
        farmersLabel: "खुश किसान",
        success: "95%",
        successLabel: "सफलता दर",
        support: "24/7",
        supportLabel: "सपोर्ट",
        growth: "40%",
        growthLabel: "औसत मुनाफा वृद्धि"
      },
      benefits: {
        title: "पोल्ट्री मित्र के फायदे",
        b1: "मुनाफा 40% तक बढ़ाएं",
        b2: "खर्च 25% तक कम करें",
        b3: "समय की 60% बचत",
        b4: "बेहतर निर्णय लें"
      },
      testimonials: {
        title: "किसान भाइयों के अनुभव",
        t1: {
          text: "पोल्ट्री मित्र से मेरा मुनाफा 35% बढ़ गया है। FCR कैलकुलेटर बहुत सटीक है और खर्च ट्रैकिंग से पैसे की बहुत बचत हुई।",
          name: "राजेश कुमार",
          location: "हरियाणा",
          birds: "5000 मुर्गियां"
        },
        t2: {
          text: "पहले कागज-पेन में हिसाब रखता था, अब सब कुछ ऑनलाइन। बहुत आसान हो गया काम। सभी किसान भाइयों को सुझाता हूं।",
          name: "सुनीता देवी",
          location: "पंजाब",
          birds: "3000 मुर्गियां"
        },
        t3: {
          text: "मार्केट रेट्स रियल टाइम मिलते हैं। अब सही समय पर सही दाम मिलता है। बहुत फायदा हुआ है।",
          name: "रमेश पटेल",
          location: "गुजरात", 
          birds: "8000 मुर्गियां"
        }
      },
      cta: {
        title: "आज ही शुरू करें अपना डिजिटल पोल्ट्री जर्नी",
        subtitle: "हजारों किसानों का भरोसा। अब आपकी बारी है।",
        button: "मुफ्त रजिस्टर करें",
        note: "कोई छुपी हुई फीस नहीं • तुरंत शुरू करें • 24/7 सपोर्ट"
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
        title: "India's #1 Poultry Farm Management System",
        subtitle: "Digitize your poultry business. From FCR calculation to expense tracking - everything in one place!",
        freeFCR: "Free FCR Calculator",
        startFree: "Start Free",
        watchDemo: "Watch Demo",
        trusted: "Trusted by 10,000+ farmers"
      },
      features: {
        title: "Why Choose Poultry Mitra?",
        subtitle: "Built for modern farmers with traditional values",
        fcr: {
          title: "Smart FCR Calculator",
          desc: "Calculate your farm's Feed Conversion Rate accurately and increase profits"
        },
        expense: {
          title: "Expense Tracking",
          desc: "Track feed, medicine, labor - every expense and save money"
        },
        market: {
          title: "Live Market Rates",
          desc: "View real-time market rates and trends, make better decisions"
        },
        reports: {
          title: "Detailed Analytics",
          desc: "See complete business insights in graphs and charts"
        }
      },
      stats: {
        farmers: "10,000+",
        farmersLabel: "Happy Farmers",
        success: "95%",
        successLabel: "Success Rate",
        support: "24/7",
        supportLabel: "Support",
        growth: "40%",
        growthLabel: "Average Profit Growth"
      },
      benefits: {
        title: "Benefits of Poultry Mitra",
        b1: "Increase profit up to 40%",
        b2: "Reduce costs up to 25%",
        b3: "Save 60% time",
        b4: "Make better decisions"
      },
      testimonials: {
        title: "Farmer Experiences",
        t1: {
          text: "Poultry Mitra increased my profit by 35%. FCR calculator is very accurate and expense tracking saved a lot of money.",
          name: "Rajesh Kumar",
          location: "Haryana",
          birds: "5000 birds"
        },
        t2: {
          text: "Earlier I kept accounts on paper, now everything is online. Work has become very easy. I recommend it to all farmer brothers.",
          name: "Sunita Devi",
          location: "Punjab",
          birds: "3000 birds"
        },
        t3: {
          text: "Market rates are available in real time. Now I get the right price at the right time. Very beneficial.",
          name: "Ramesh Patel",
          location: "Gujarat",
          birds: "8000 birds"
        }
      },
      cta: {
        title: "Start Your Digital Poultry Journey Today",
        subtitle: "Trusted by thousands of farmers. Your turn now.",
        button: "Register Free",
        note: "No hidden fees • Start instantly • 24/7 support"
      }
    }
  };

  const t = content[language as keyof typeof content];
  
  const toggleLanguage = () => {
    setLanguage(language === "hi" ? "en" : "hi");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <Bird className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-green-600">{t.header.title}</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-black-600 transition-colors">{t.header.services}</a>
              <Link to="/fcr-calculator" className="text-gray-600 hover:text-green-600 transition-colors">
                {language === 'hi' ? 'FCR कैलकुलेटर' : 'FCR Calculator'}
              </Link>
              <Link to="/batch-management" className="text-gray-600 hover:text-green-600 transition-colors">
                {language === 'hi' ? 'बैच मैनेजमेंट' : 'Batch Management'}
              </Link>
              <Link to="/fcr-reports" className="text-gray-600 hover:text-green-600 transition-colors">
                {language === 'hi' ? 'FCR रिपोर्ट्स' : 'FCR Reports'}
              </Link>
              <a href="#testimonials" className="text-gray-600 hover:text-black-600 transition-colors">Reviews</a>
              <Link to="/contact" className="text-gray-600 hover:text-green-600 transition-colors">{t.header.contact}</Link>
            </nav>
            <div className="flex items-center space-x-3">
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
                <Button variant="outline" size="sm">{t.header.login}</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-green-600 hover:bg-green-700" size="sm">{t.header.register}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              {t.hero.trusted}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              {t.hero.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Bird className="w-5 h-5 mr-2" />
                  {t.hero.startFree}
                </Button>
              </Link>
              
              <Link to="/fcr-calculator">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-4 rounded-xl border-2 hover:bg-green-50"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  {t.hero.freeFCR}
                </Button>
              </Link>
            </div>

            {/* Hero Image/Animation placeholder */}
            <div className="mt-12">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Bird className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800">Smart Management</h3>
                  </div>
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800">Real-time Analytics</h3>
                  </div>
                  <div className="text-center">
                    <DollarSign className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800">Profit Optimization</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">{t.stats.farmers}</div>
              <div className="text-gray-600 mt-2">{t.stats.farmersLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{t.stats.success}</div>
              <div className="text-gray-600 mt-2">{t.stats.successLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">{t.stats.support}</div>
              <div className="text-gray-600 mt-2">{t.stats.supportLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">{t.stats.growth}</div>
              <div className="text-gray-600 mt-2">{t.stats.growthLabel}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.features.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.features.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:shadow-xl transition-shadow border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">{t.features.fcr.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">{t.features.fcr.desc}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{t.features.expense.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">{t.features.expense.desc}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">{t.features.market.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">{t.features.market.desc}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">{t.features.reports.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">{t.features.reports.desc}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t.benefits.title}</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Target className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.benefits.b1}</h3>
            </div>
            <div className="text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.benefits.b2}</h3>
            </div>
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.benefits.b3}</h3>
            </div>
            <div className="text-center">
              <Heart className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.benefits.b4}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.testimonials.title}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{t.testimonials.t1.text}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{t.testimonials.t1.name}</p>
                  <p className="text-gray-600 text-sm">{t.testimonials.t1.location} • {t.testimonials.t1.birds}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{t.testimonials.t2.text}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{t.testimonials.t2.name}</p>
                  <p className="text-gray-600 text-sm">{t.testimonials.t2.location} • {t.testimonials.t2.birds}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{t.testimonials.t3.text}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{t.testimonials.t3.name}</p>
                  <p className="text-gray-600 text-sm">{t.testimonials.t3.location} • {t.testimonials.t3.birds}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t.cta.title}</h2>
          <p className="text-xl mb-8 opacity-90">{t.cta.subtitle}</p>
          
          <Link to="/register">
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100 text-xl px-12 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all"
            >
              <Bird className="w-6 h-6 mr-2" />
              {t.cta.button}
            </Button>
          </Link>
          
          <p className="text-sm mt-6 opacity-75">{t.cta.note}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bird className="w-8 h-8 text-green-400" />
                <h3 className="text-xl font-bold">{t.header.title}</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                {language === 'hi' 
                  ? "भारत का सबसे भरोसेमंद पोल्ट्री मैनेजमेंट प्लेटफॉर्म। किसानों के लिए, किसानों द्वारा बनाया गया।" 
                  : "India's most trusted poultry management platform. Built for farmers, by farmers."
                }
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{language === 'hi' ? 'त्वरित लिंक' : 'Quick Links'}</h4>
              <div className="space-y-2">
                <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">{t.header.about}</Link>
                <Link to="/services" className="block text-gray-400 hover:text-white transition-colors">{t.header.services}</Link>
                <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">{t.header.contact}</Link>
                <Link to="/fcr-calculator" className="block text-gray-400 hover:text-white transition-colors">{t.hero.freeFCR}</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{language === 'hi' ? 'सपोर्ट' : 'Support'}</h4>
              <div className="space-y-2">
                <Link to="/help" className="block text-gray-400 hover:text-white transition-colors">{language === 'hi' ? 'सहायता' : 'Help'}</Link>
                <Link to="/privacy" className="block text-gray-400 hover:text-white transition-colors">{language === 'hi' ? 'प्राइवेसी पॉलिसी' : 'Privacy Policy'}</Link>
                <Link to="/terms" className="block text-gray-400 hover:text-white transition-colors">{language === 'hi' ? 'नियम व शर्तें' : 'Terms & Conditions'}</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{language === 'hi' ? 'संपर्क करें' : 'Contact'}</h4>
              <div className="space-y-2 text-gray-400">
                <p>+91 98765 43210</p>
                <p>support@poultrymitra.com</p>
                <p>24/7 {language === 'hi' ? 'सपोर्ट' : 'Support'}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {t.header.title}. {language === 'hi' ? 'सभी अधिकार सुरक्षित।' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndexNew;
