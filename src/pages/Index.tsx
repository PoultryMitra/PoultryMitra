import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEnhancedTranslation } from "@/contexts/EnhancedTranslationContext";
import { LanguageToggle, TranslationStatus } from "@/components/TranslationComponents";
import { Globe, Calculator, TrendingUp, Users, Shield, Award, Play, Bird, Feather, Star, CheckCircle, Youtube, ArrowRight } from "lucide-react";
import * as adminContentService from "@/services/adminContentService";

const Index = () => {
  const { language, t, translateText } = useEnhancedTranslation();
  const [latestPosts, setLatestPosts] = useState<adminContentService.AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load latest posts
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    try {
      unsubscribe = adminContentService.subscribeToAdminPosts((posts) => {
        // Get only the latest 3 posts for the home page
        console.log('📊 Home page loaded posts:', posts.length);
        setLatestPosts(posts.slice(0, 3));
        setLoading(false);
      });
    } catch (error) {
      console.error('❌ Error loading posts on home page:', error);
      setLoading(false);
      setLatestPosts([]);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render YouTube embed for posts
  const renderYouTubeEmbed = (videoId: string) => {
    return (
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  };
  
  const content = {
    hi: {
      header: {
        title: "पोल्ट्री मित्र",
        about: "हमारे बारे में",
        services: "सेवाएं",
        guides: "गाइड्स",
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
      guides: {
        title: "नवीनतम गाइड्स और टिप्स",
        subtitle: "विशेषज्ञों द्वारा तैयार पोल्ट्री फार्मिंग गाइड्स और वीडियो ट्यूटोरियल्स",
        viewAll: "सभी गाइड्स देखें",
        noGuides: "जल्द ही नई गाइड्स आ रही हैं...",
        watchVideo: "वीडियो देखें"
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
        guides: "Guides",
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
      guides: {
        title: "Latest Guides & Tips",
        subtitle: "Expert-curated poultry farming guides and video tutorials",
        viewAll: "View All Guides",
        noGuides: "New guides coming soon...",
        watchVideo: "Watch Video"
      },
      cta: {
        title: "Start Your Digital Poultry Journey Today",
        subtitle: "Trusted by thousands of farmers. Your turn awaits.",
        button: "Register Free"
      }
    }
  };

  const currentContent = content[language as keyof typeof content];
  
  // Enhanced translation helper that uses Google Translate
  const bt = (key: string) => {
    // First try Enhanced Translation Context (Google Translate)
    const dynamicTranslation = t(key);
    if (dynamicTranslation && dynamicTranslation !== key) {
      console.log(`🌍 Google Translate used for: ${key} -> ${dynamicTranslation}`);
      return dynamicTranslation;
    }

    // Fallback to static content if Google Translate doesn't have it
    const keys = key.split('.');
    let value: any = currentContent;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (value) {
      console.log(`📚 Static content used for: ${key} -> ${value}`);
    } else {
      console.log(`❌ No translation found for: ${key}`);
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
              <h1 className="text-2xl font-bold text-green-600">{bt('header.title')}</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/about" className="text-gray-500 hover:text-gray-900">{bt('header.about')}</Link>
              <Link to="/services" className="text-gray-500 hover:text-gray-900">{bt('header.services')}</Link>
              <Link to="/posts" className="text-gray-500 hover:text-gray-900">{bt('header.guides')}</Link>
              <Link to="/contact" className="text-gray-500 hover:text-gray-900">{bt('header.contact')}</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <TranslationStatus />
              <Link to="/login">
                <Button variant="outline">{bt('header.login')}</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-green-600 hover:bg-green-700">{bt('header.register')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {bt('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {bt('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/farmer-login">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                {bt('hero.farmerLogin')}
              </Button>
            </Link>
            <Link to="/dealer-login">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                {bt('hero.dealerLogin')}
              </Button>
            </Link>
          </div>
          <div className="mt-6">
            <Link to="/fcr-calculator">
              <Button variant="outline" size="lg" className="text-green-600 border-green-600 hover:bg-green-50">
                {bt('hero.fcr')} - {bt('hero.fcrFree')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{bt('features.title')}</h2>
            <p className="text-lg text-gray-600">{bt('services.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{bt('features.fcr.title')}</CardTitle>
                <CardDescription>{bt('features.fcr.shortDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{bt('features.fcr.desc')}</p>
                <div className="mt-4">
                  <Link to="/fcr-calculator">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      {bt('features.fcr.tryButton')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{bt('features.expense.title')}</CardTitle>
                <CardDescription>{bt('features.expense.shortDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{bt('features.expense.desc')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{bt('features.health.title')}</CardTitle>
                <CardDescription>{bt('features.health.shortDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{bt('features.health.desc')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{bt('features.feed.title')}</CardTitle>
                <CardDescription>{bt('features.feed.shortDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{bt('features.feed.desc')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{bt('features.rates.title')}</CardTitle>
                <CardDescription>{bt('features.rates.shortDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{bt('features.rates.desc')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{bt('features.batch.title')}</CardTitle>
                <CardDescription>{bt('features.batch.shortDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{bt('features.batch.desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Guides & Tips Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {bt('guides.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {bt('guides.subtitle')}
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">गाइड्स लोड हो रही हैं...</p>
            </div>
          ) : latestPosts.length === 0 ? (
            <div className="text-center py-12">
              <Youtube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">{bt('guides.noGuides')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {latestPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      {/* YouTube Video Embed */}
                      {post.youtubeVideoId && renderYouTubeEmbed(post.youtubeVideoId)}
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            post.type === 'guide' ? 'bg-green-100 text-green-800' :
                            post.type === 'tip' ? 'bg-yellow-100 text-yellow-800' :
                            post.type === 'tutorial' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {post.type === 'guide' ? 'गाइड' :
                             post.type === 'tip' ? 'टिप' :
                             post.type === 'tutorial' ? 'ट्यूटोरियल' : 'घोषणा'}
                          </span>
                          {post.youtubeVideoId && (
                            <span className="flex items-center gap-1 text-red-600 text-xs">
                              <Youtube className="w-3 h-3" />
                              वीडियो
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {post.content}
                        </p>
                        
                        <div className="text-xs text-gray-500">
                          {post.createdAt.toDate().toLocaleDateString('hi-IN')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center">
                <Link to="/posts">
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg inline-flex items-center gap-2">
                    {bt('guides.viewAll')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">{bt('header.title')}</h3>
              <p className="text-gray-300 mb-4">
                {bt('footer.description')}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">{bt('footer.quickLinks')}</h4>
              <ul className="space-y-2">
                <li><Link to="/about" onClick={scrollToTop} className="text-gray-300 hover:text-white">{bt('nav.about')}</Link></li>
                <li><Link to="/services" onClick={scrollToTop} className="text-gray-300 hover:text-white">{bt('nav.services')}</Link></li>
                <li><Link to="/contact" onClick={scrollToTop} className="text-gray-300 hover:text-white">{bt('nav.contact')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">{bt('footer.support')}</h4>
              <ul className="space-y-2">
                <li><Link to="/help" onClick={scrollToTop} className="text-gray-300 hover:text-white">{bt('footer.help')}</Link></li>
                <li><Link to="/privacy" onClick={scrollToTop} className="text-gray-300 hover:text-white">{bt('footer.privacy')}</Link></li>
                <li><Link to="/terms" onClick={scrollToTop} className="text-gray-300 hover:text-white">{bt('footer.terms')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-300">{bt('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
