/**
 * Enhanced Translation Context with Google Translate Integration
 * Combines static translations with dynamic Google Translate API
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { googleTranslateService, TranslationResponse } from '@/services/googleTranslateService';

// Static translations for immediate UI responses
const staticTranslations = {
  hi: {
    // Homepage content
    'header.title': "पोल्ट्री मित्र",
    'header.about': "हमारे बारे में",
    'header.services': "सेवाएं",
    'header.guides': "गाइड्स",
    'header.contact': "संपर्क",
    'header.login': "लॉग इन",
    'header.register': "रजिस्टर करें",
    
    'hero.title': "भारत का सबसे बेहतरीन पोल्ट्री फार्म मैनेजमेंट सिस्टम",
    'hero.subtitle': "अपने मुर्गी पालन व्यवसाय को डिजिटल बनाएं। FCR कैलकुलेशन से लेकर खर्च ट्रैकिंग तक - सब कुछ एक ही जगह!",
    'hero.farmerLogin': "किसान लॉगिन",
    'hero.dealerLogin': "डीलर लॉगिन",
    'hero.fcr': "FCR कैलकुलेटर",
    'hero.fcrFree': "मुफ्त",
    
    'features.title': "क्यों चुनें पोल्ट्री मित्र?",
    'services.subtitle': "आधुनिक किसानों के लिए बनाया गया, परंपरागत मूल्यों के साथ",
    'features.fcr.title': "स्मार्ट FCR कैलकुलेटर",
    'features.fcr.shortDesc': "सटीक गणना",
    'features.fcr.desc': "अपने फार्म की फीड कन्वर्जन रेट को सटीक रूप से कैलकुलेट करें",
    'features.fcr.tryButton': "आज़माएं",
    'features.expense.title': "खर्च ट्रैकिंग",
    'features.expense.shortDesc': "पूरा हिसाब",

    // Common UI elements
    save: "सेव करें",
    cancel: "रद्द करें",
    edit: "संपादित करें",
    delete: "मिटाएं",
    add: "जोड़ें",
    submit: "सबमिट करें",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफल",
    warning: "चेतावनी",
    info: "जानकारी",
    confirm: "पुष्टि करें",
    yes: "हाँ",
    no: "नहीं",
    ok: "ठीक है",
    
    // Navigation
    home: "घर",
    dashboard: "डैशबोर्ड",
    profile: "प्रोफ़ाइल",
    settings: "सेटिंग्स",
    logout: "लॉगआउट",
    login: "लॉगिन",
    register: "रजिस्टर",
    
    // Language
    language: "भाषा",
    hindi: "हिंदी",
    english: "अंग्रेजी",
    translate: "अनुवाद करें",
    translating: "अनुवाद हो रहा है...",
    
    // Batch Management
    batchManagement: "बैच प्रबंधन",
    addNewBatch: "नया बैच जोड़ें",
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
    kg: "किग्रा"
  },
  en: {
    // Homepage content
    'header.title': "Poultry Mitra",
    'header.about': "About",
    'header.services': "Services",
    'header.guides': "Guides",
    'header.contact': "Contact",
    'header.login': "Login",
    'header.register': "Register",
    
    'hero.title': "India's Best Poultry Farm Management System",
    'hero.subtitle': "Digitize your poultry business. From FCR calculation to expense tracking - everything in one place!",
    'hero.farmerLogin': "Farmer Login",
    'hero.dealerLogin': "Dealer Login", 
    'hero.fcr': "FCR Calculator",
    'hero.fcrFree': "Free",
    
    'features.title': "Why Choose Poultry Mitra?",
    'services.subtitle': "Built for modern farmers with traditional values",
    'features.fcr.title': "Smart FCR Calculator",
    'features.fcr.shortDesc': "Accurate calculation",
    'features.fcr.desc': "Calculate your farm's Feed Conversion Rate accurately",
    'features.fcr.tryButton': "Try Now",
    'features.expense.title': "Expense Tracking",
    'features.expense.shortDesc': "Complete accounting",

    // Common UI elements
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    submit: "Submit",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Info",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    ok: "OK",
    
    // Navigation
    home: "Home",
    dashboard: "Dashboard",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    register: "Register",
    
    // Language
    language: "Language",
    hindi: "Hindi",
    english: "English",
    translate: "Translate",
    translating: "Translating...",
    
    // Batch Management
    batchManagement: "Batch Management",
    addNewBatch: "Add New Batch",
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
    kg: "kg"
  }
};

interface TranslationCacheEntry {
  hi?: string;
  en?: string;
  timestamp: number;
}

interface TranslationCache {
  [key: string]: TranslationCacheEntry;
}

interface EnhancedTranslationContextType {
  language: 'hi' | 'en';
  setLanguage: (lang: 'hi' | 'en') => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  translateText: (text: string, targetLang?: 'hi' | 'en') => Promise<string>;
  translateAsync: (key: string) => Promise<string>;
  isTranslating: boolean;
  translationCache: TranslationCache;
  clearCache: () => void;
  serviceAvailable: boolean;
}

const EnhancedTranslationContext = createContext<EnhancedTranslationContextType | undefined>(undefined);

export const EnhancedTranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'hi' | 'en'>(() => {
    const saved = localStorage.getItem('fowl-app-language');
    return (saved as 'hi' | 'en') || 'hi';
  });
  
  const [translationCache, setTranslationCache] = useState<TranslationCache>(() => {
    try {
      const cached = localStorage.getItem('fowl-translation-cache');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [serviceAvailable, setServiceAvailable] = useState(false);

  // Check service availability on mount
  useEffect(() => {
    const checkService = async () => {
      try {
        const available = await googleTranslateService.checkServiceHealth();
        setServiceAvailable(available);
      } catch (error) {
        console.warn('Translation service check failed, using static translations:', error);
        setServiceAvailable(false); // Service not available, but app will work with static translations
      }
    };
    
    checkService();
  }, []);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('fowl-app-language', language);
    document.documentElement.lang = language;
  }, [language]);

  // Save translation cache
  useEffect(() => {
    localStorage.setItem('fowl-translation-cache', JSON.stringify(translationCache));
  }, [translationCache]);

  // Static translation function with fallback
  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = staticTranslations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    // If not found in current language, try English
    if (!value && language !== 'en') {
      value = staticTranslations.en;
      for (const k of keys) {
        value = value?.[k];
      }
    }
    
    return value || key;
  }, [language]);

  // Dynamic translation using LibreTranslate
  const translateText = useCallback(async (
    text: string, 
    targetLang?: 'hi' | 'en'
  ): Promise<string> => {
    if (!text.trim()) return text;
    
    const target = targetLang || language;
    const source = target === 'hi' ? 'en' : 'hi';
    const cacheKey = `${text}_${source}_${target}`;
    
    // Check cache first (valid for 24 hours)
    const cached = translationCache[cacheKey];
    if (cached && cached[target] && (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000)) {
      return cached[target]!;
    }
    
    // If service is not available, return original text
    if (!serviceAvailable) {
      return text;
    }
    
    try {
      setIsTranslating(true);
      
      const result = await googleTranslateService.translateText({
        text,
        source: 'auto', // Auto-detect source language
        target
      });
      
      // Update cache
      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: {
          ...prev[cacheKey],
          [target]: result.translatedText,
          timestamp: Date.now()
        }
      }));
      
      return result.translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // Return original text on error
    } finally {
      setIsTranslating(false);
    }
  }, [language, translationCache, serviceAvailable]);

  // Async translation for keys not in static translations
  const translateAsync = useCallback(async (key: string): Promise<string> => {
    const staticResult = t(key);
    
    // If we found a static translation, return it
    if (staticResult !== key) {
      return staticResult;
    }
    
    // Otherwise, try dynamic translation
    return await translateText(key);
  }, [t, translateText]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'hi' ? 'en' : 'hi');
  }, []);

  const clearCache = useCallback(() => {
    setTranslationCache({});
    localStorage.removeItem('fowl-translation-cache');
  }, []);

  const value: EnhancedTranslationContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    translateText,
    translateAsync,
    isTranslating,
    translationCache,
    clearCache,
    serviceAvailable
  };

  return (
    <EnhancedTranslationContext.Provider value={value}>
      {children}
    </EnhancedTranslationContext.Provider>
  );
};

export const useEnhancedTranslation = () => {
  const context = useContext(EnhancedTranslationContext);
  if (context === undefined) {
    throw new Error('useEnhancedTranslation must be used within an EnhancedTranslationProvider');
  }
  return context;
};

export default EnhancedTranslationContext;
