import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'hi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  hi: {
    // Header
    'header.title': 'पोल्ट्री मित्र',
    'nav.about': 'हमारे बारे में',
    'nav.services': 'सेवाएं',
    'nav.contact': 'संपर्क',
    'nav.login': 'लॉगिन',
    'nav.register': 'रजिस्टर करें',
    
    // Hero Section
    'hero.title': 'पोल्ट्री मित्र में आपका स्वागत है',
    'hero.subtitle': 'मुर्गी पालन फार्म प्रबंधन के लिए आपका संपूर्ण मंच। खर्च ट्रैक करें, स्वास्थ्य की निगरानी करें, FCR की गणना करें, और अपने पोल्ट्री व्यवसाय को कुशलता से प्रबंधित करें।',
    'hero.farmerLogin': 'किसान लॉगिन',
    'hero.dealerLogin': 'डीलर लॉगिन',
    'hero.fcr': 'FCR कैलकुलेटर',
    'hero.fcrFree': 'मुफ्त में उपयोग करें',
    
    // Features Section
    'features.title': 'मुख्य विशेषताएं',
    'services.subtitle': 'आपके पोल्ट्री बिजनेस को चलाने के लिए सब कुछ',
    'features.fcr.title': 'FCR कैलकुलेटर',
    'features.fcr.shortDesc': 'फीड कन्वर्जन रेशियो ट्रैकिंग',
    'features.fcr.desc': 'फीड कन्वर्जन रेशियो की गणना करें और अपने फार्म की लाभप्रदता का विश्लेषण करें।',
    'features.fcr.tryButton': 'कैलकुलेटर आज़माएं',
    'features.expense.title': 'खर्च प्रबंधन',
    'features.expense.shortDesc': 'आय और व्यय प्रबंधन',
    'features.expense.desc': 'सभी फार्म खर्चों को ट्रैक करें और विस्तृत रिपोर्ट प्राप्त करें।',
    'features.health.title': 'स्वास्थ्य निगरानी',
    'features.health.shortDesc': 'वैक्सीन और स्वास्थ्य ट्रैकिंग',
    'features.health.desc': 'अपने पक्षियों के स्वास्थ्य की निगरानी करें और टीकाकरण शेड्यूल बनाए रखें।',
    'features.feed.title': 'फीड प्रबंधन',
    'features.feed.shortDesc': 'प्री-स्टार्टर, स्टार्टर, फिनिशर फीड',
    'features.feed.desc': 'तीन प्रकार के फीड (प्री-स्टार्टर, स्टार्टर, फिनिशर) का प्रबंधन करें।',
    'features.rates.title': 'बाजार दरें',
    'features.rates.shortDesc': 'रियल-टाइम बाजार जानकारी',
    'features.rates.desc': 'बेहतर मूल्य निर्धारण के लिए अपने क्षेत्र में वर्तमान ब्रॉयलर और अंडे की दरों से अपडेट रहें।',
    'features.batch.title': 'बैच प्रबंधन',
    'features.batch.shortDesc': 'कई बैचों का ट्रैकिंग',
    'features.batch.desc': 'कई बैचों को आसानी से प्रबंधित करें और उनकी प्रगति ट्रैक करें।',
    
    // Benefits Section
    'benefits.title': 'पोल्ट्री मित्र के फायदे',
    'benefits.profit.title': 'मुनाफा बढ़ाएं',
    'benefits.profit.desc': 'वैज्ञानिक FCR गणना और खर्च ट्रैकिंग से अधिक मुनाफा कमाएं।',
    'benefits.time.title': 'समय बचाएं',
    'benefits.time.desc': 'स्वचालित रिपोर्ट और ट्रैकिंग से रोजाना घंटों की बचत करें।',
    'benefits.decision.title': 'बेहतर निर्णय',
    'benefits.decision.desc': 'डेटा-आधारित अंतर्दृष्टि के साथ स्मार्ट निर्णय लें।',
    
    // Testimonials
    'testimonials.title': 'किसान क्या कहते हैं',
    'testimonials.farmer1.text': 'पोल्ट्री मित्र ने मेरे फार्म की लाभप्रदता 30% बढ़ा दी है। FCR कैलकुलेटर बहुत उपयोगी है।',
    'testimonials.farmer1.name': 'राम कुमार, हरियाणा',
    'testimonials.farmer2.text': 'खर्च ट्रैकिंग और बैच मैनेजमेंट फीचर वास्तव में गेम चेंजर हैं।',
    'testimonials.farmer2.name': 'सुरेश पटेल, गुजरात',
    
    // CTA Section
    'cta.title': 'आज ही शुरू करें',
    'cta.subtitle': 'हजारों किसान पहले से ही पोल्ट्री मित्र का उपयोग कर रहे हैं। आप भी शामिल हों!',
    'cta.register': 'मुफ्त रजिस्टर करें',
    'cta.demo': 'डेमो देखें',
    
    // Footer
    'footer.description': 'उत्पादकता और लाभप्रदता में सुधार के लिए पोल्ट्री किसानों को प्रौद्योगिकी से सशक्त बनाना।',
    'footer.quickLinks': 'क्विक लिंक्स',
    'footer.support': 'सहायता',
    'footer.help': 'सहायता केंद्र',
    'footer.privacy': 'प्राइवेसी पॉलिसी',
    'footer.terms': 'सेवा की शर्तें',
    'footer.copyright': '© 2025 पोल्ट्री मित्र। सभी अधिकार सुरक्षित।',
    
    // Language Toggle
    'lang.switch': 'English',
    
    // Poultry Calculators
    'calculators.title': 'उन्नत पोल्ट्री कैलकुलेटर',
    'calculators.subtitle': 'आधुनिक किसानी के लिए व्यापक गणना उपकरण',
    'calculators.weightGain.title': 'वजन वृद्धि कैलकुलेटर',
    'calculators.weightGain.initialWeight': 'प्रारंभिक वजन (ग्राम)',
    'calculators.weightGain.currentWeight': 'वर्तमान वजन (ग्राम)',
    'calculators.weightGain.days': 'दिन',
    'calculators.weightGain.calculate': 'गणना करें',
    'calculators.eggProduction.title': 'अंडा उत्पादन कैलकुलेटर',
    'calculators.eggProduction.hens': 'मुर्गियों की संख्या',
    'calculators.eggProduction.productivity': 'उत्पादकता (%)',
    'calculators.costProfit.title': 'लागत और लाभ कैलकुलेटर',
    'calculators.costProfit.feedCost': 'फीड लागत (₹)',
    'calculators.costProfit.medicineCost': 'दवा लागत (₹)',
    'calculators.costProfit.laborCost': 'मजदूरी लागत (₹)',
    'calculators.costProfit.otherCost': 'अन्य लागत (₹)',
    'calculators.costProfit.income': 'आय (₹)',
    'calculators.feedMix.title': 'फीड मिक्स कैलकुलेटर',
    'calculators.feedMix.maize': 'मक्का (किलो)',
    'calculators.feedMix.soy': 'सोयाबीन (किलो)',
    'calculators.feedMix.bran': 'चोकर (किलो)',
    'calculators.diseaseRisk.title': 'रोग जोखिम कैलकुलेटर',
    'calculators.diseaseRisk.birdAge': 'पक्षी की आयु (दिन)',
    'calculators.diseaseRisk.temperature': 'तापमान (°C)',
    'calculators.waterReq.title': 'पानी की आवश्यकता कैलकुलेटर',
    'calculators.waterReq.birds': 'पक्षियों की संख्या',
    'calculators.waterReq.age': 'आयु (दिन)',
    'calculators.transportCost.title': 'परिवहन लागत कैलकुलेटर',
    'calculators.transportCost.distance': 'दूरी (किमी)',
    'calculators.transportCost.weight': 'वजन (किलो)',
    'calculators.transportCost.fuelPrice': 'ईंधन मूल्य (₹/लीटर)',
    
    // Shed Management
    'shed.title': 'शेड डिज़ाइन और प्रबंधन',
    'shed.subtitle': 'ब्रॉयलर शेड योजना और दैनिक प्रबंधन के लिए संपूर्ण उपकरण',
    'shed.design.title': 'शेड डिज़ाइन कैलकुलेटर',
    'shed.design.length': 'शेड की लंबाई (फीट)',
    'shed.design.width': 'शेड की चौड़ाई (फीट)',
    'shed.design.orientation': 'दिशा',
    'shed.design.eastWest': 'पूर्व-पश्चिम',
    'shed.design.northSouth': 'उत्तर-दक्षिण',
    'shed.environment.title': 'ब्रॉयलर वातावरण प्रबंधक',
    'shed.environment.chickAge': 'चूजे की आयु (दिन)',
    'shed.environment.currentTemp': 'वर्तमान तापमान (°C)',
    'shed.environment.humidity': 'आर्द्रता (%)',
    'shed.checklist.title': 'दैनिक शेड चेकलिस्ट',
    'shed.checklist.birdAge': 'पक्षी की आयु (दिन)',
    'shed.checklist.generate': 'चेकलिस्ट बनाएं',
    'shed.tempGuidelines': 'तापमान दिशानिर्देश',
    'shed.humidityStandards': 'आर्द्रता मानक',
    'shed.spaceRequirements': 'स्थान आवश्यकताएं',
  },
  en: {
    // Header
    'header.title': 'Poultry Mitra',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    
    // Hero Section
    'hero.title': 'Welcome to Poultry Mitra',
    'hero.subtitle': 'Your comprehensive platform for poultry farm management. Track expenses, monitor health, calculate FCR, and manage your poultry business efficiently.',
    'hero.farmerLogin': 'Farmer Login',
    'hero.dealerLogin': 'Dealer Login',
    'hero.fcr': 'FCR Calculator',
    'hero.fcrFree': 'Free to Use',
    
    // Features Section
    'features.title': 'Key Features',
    'services.subtitle': 'Everything you need to manage your poultry business',
    'features.fcr.title': 'FCR Calculator',
    'features.fcr.shortDesc': 'Feed Conversion Ratio tracking',
    'features.fcr.desc': 'Calculate and monitor Feed Conversion Ratio to optimize feed efficiency and reduce costs.',
    'features.fcr.tryButton': 'Try Calculator',
    'features.expense.title': 'Expense Management',
    'features.expense.shortDesc': 'Income and expense management',
    'features.expense.desc': 'Monitor your expenses, track income, and get detailed financial reports for better decision making.',
    'features.health.title': 'Health Management',
    'features.health.shortDesc': 'Vaccine and health tracking',
    'features.health.desc': 'Keep track of vaccination schedules, health records, and get timely reminders.',
    'features.feed.title': 'Feed Management',
    'features.feed.shortDesc': 'Pre-Starter, Starter, Finisher feeds',
    'features.feed.desc': 'Manage three types of feeds (Pre-Starter, Starter, Finisher) for optimal poultry growth.',
    'features.rates.title': 'Market Rates',
    'features.rates.shortDesc': 'Real-time market information',
    'features.rates.desc': 'Stay updated with current broiler and egg rates in your region for better pricing decisions.',
    'features.batch.title': 'Batch Management',
    'features.batch.shortDesc': 'Multi-batch tracking',
    'features.batch.desc': 'Easily manage multiple batches and track their progress with detailed analytics.',
    
    // Benefits Section
    'benefits.title': 'Benefits of Poultry Mitra',
    'benefits.profit.title': 'Increase Profit',
    'benefits.profit.desc': 'Earn more profit with scientific FCR calculation and expense tracking.',
    'benefits.time.title': 'Save Time',
    'benefits.time.desc': 'Save hours daily with automated reports and tracking.',
    'benefits.decision.title': 'Better Decisions',
    'benefits.decision.desc': 'Make smart decisions with data-driven insights.',
    
    // Testimonials
    'testimonials.title': 'What Farmers Say',
    'testimonials.farmer1.text': 'Poultry Mitra has increased my farm profitability by 30%. The FCR calculator is very useful.',
    'testimonials.farmer1.name': 'Ram Kumar, Haryana',
    'testimonials.farmer2.text': 'Expense tracking and batch management features are real game changers.',
    'testimonials.farmer2.name': 'Suresh Patel, Gujarat',
    
    // CTA Section
    'cta.title': 'Get Started Today',
    'cta.subtitle': 'Thousands of farmers are already using Poultry Mitra. Join them!',
    'cta.register': 'Register Free',
    'cta.demo': 'View Demo',
    
    // Footer
    'footer.description': 'Empowering poultry farmers with technology to improve productivity and profitability.',
    'footer.quickLinks': 'Quick Links',
    'footer.support': 'Support',
    'footer.help': 'Help Center',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.copyright': '© 2025 Poultry Mitra. All rights reserved.',
    
    // Language Toggle
    'lang.switch': 'हिंदी',
    
    // Poultry Calculators
    'calculators.title': 'Advanced Poultry Calculators',
    'calculators.subtitle': 'Comprehensive calculation tools for modern farming',
    'calculators.weightGain.title': 'Weight Gain Calculator',
    'calculators.weightGain.initialWeight': 'Initial Weight (grams)',
    'calculators.weightGain.currentWeight': 'Current Weight (grams)',
    'calculators.weightGain.days': 'Days',
    'calculators.weightGain.calculate': 'Calculate',
    'calculators.eggProduction.title': 'Egg Production Calculator',
    'calculators.eggProduction.hens': 'Number of Hens',
    'calculators.eggProduction.productivity': 'Productivity (%)',
    'calculators.costProfit.title': 'Cost & Profit Calculator',
    'calculators.costProfit.feedCost': 'Feed Cost (₹)',
    'calculators.costProfit.medicineCost': 'Medicine Cost (₹)',
    'calculators.costProfit.laborCost': 'Labor Cost (₹)',
    'calculators.costProfit.otherCost': 'Other Cost (₹)',
    'calculators.costProfit.income': 'Income (₹)',
    'calculators.feedMix.title': 'Feed Mix Calculator',
    'calculators.feedMix.maize': 'Maize (kg)',
    'calculators.feedMix.soy': 'Soybean (kg)',
    'calculators.feedMix.bran': 'Bran (kg)',
    'calculators.diseaseRisk.title': 'Disease Risk Calculator',
    'calculators.diseaseRisk.birdAge': 'Bird Age (days)',
    'calculators.diseaseRisk.temperature': 'Temperature (°C)',
    'calculators.waterReq.title': 'Water Requirement Calculator',
    'calculators.waterReq.birds': 'Number of Birds',
    'calculators.waterReq.age': 'Age (days)',
    'calculators.transportCost.title': 'Transport Cost Calculator',
    'calculators.transportCost.distance': 'Distance (km)',
    'calculators.transportCost.weight': 'Weight (kg)',
    'calculators.transportCost.fuelPrice': 'Fuel Price (₹/liter)',
    
    // Shed Management
    'shed.title': 'Poultry Shed Design & Management',
    'shed.subtitle': 'Complete tools for broiler shed planning and daily management',
    'shed.design.title': 'Shed Design Calculator',
    'shed.design.length': 'Shed Length (feet)',
    'shed.design.width': 'Shed Width (feet)',
    'shed.design.orientation': 'Orientation',
    'shed.design.eastWest': 'East-West',
    'shed.design.northSouth': 'North-South',
    'shed.environment.title': 'Broiler Environment Manager',
    'shed.environment.chickAge': 'Chick Age (days)',
    'shed.environment.currentTemp': 'Current Temperature (°C)',
    'shed.environment.humidity': 'Humidity (%)',
    'shed.checklist.title': 'Daily Shed Checklist',
    'shed.checklist.birdAge': 'Bird Age (days)',
    'shed.checklist.generate': 'Generate Checklist',
    'shed.tempGuidelines': 'Temperature Guidelines',
    'shed.humidityStandards': 'Humidity Standards',
    'shed.spaceRequirements': 'Space Requirements',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('hi'); // Default to Hindi

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && (savedLanguage === 'hi' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('preferred-language', lang);
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'hi' ? 'en' : 'hi';
    handleSetLanguage(newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
