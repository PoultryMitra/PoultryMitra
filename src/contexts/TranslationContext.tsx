import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation data
const translations = {
  hi: {
    // Common
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता",
    warning: "चेतावनी",
    info: "जानकारी",
    
    // Navigation
    home: "होम",
    dashboard: "डैशबोर्ड",
    batchManagement: "बैच प्रबंधन",
    feedPrices: "फीड की कीमतें",
    reports: "रिपोर्ट्स",
    settings: "सेटिंग्स",
    profile: "प्रोफाइल",
    logout: "लॉग आउट",
    
    // Authentication
    login: "लॉगिन",
    register: "रजिस्टर",
    email: "ईमेल",
    password: "पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    forgotPassword: "पासवर्ड भूल गए?",
    welcome: "स्वागत",
    
    // Batch Management
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
    inactive: "निष्क्रिय",
    days: "दिन",
    kg: "किलोग्राम",
    bags: "बोरे",
    
    // Dashboard
    overview: "सिंहावलोकन",
    totalBatches: "कुल बैच",
    totalBirdsCount: "कुल पक्षी संख्या",
    avgFCR: "औसत FCR",
    totalMortality: "कुल मृत्यु दर",
    performance: "प्रदर्शन",
    
    // Actions
    add: "जोड़ें",
    edit: "संपादित करें",
    delete: "हटाएं",
    save: "सेव करें",
    cancel: "रद्द करें",
    submit: "जमा करें",
    download: "डाउनलोड करें",
    upload: "अपलोड करें",
    refresh: "रीफ्रेश करें",
    
    // Messages
    saveSuccess: "सफलतापूर्वक सेव हो गया",
    deleteSuccess: "सफलतापूर्वक हटा दिया गया",
    updateSuccess: "सफलतापूर्वक अपडेट हो गया",
    operationFailed: "ऑपरेशन विफल हो गया",
    fillAllFields: "कृपया सभी आवश्यक फ़ील्ड भरें",
    confirmDelete: "क्या आप वास्तव में इसे हटाना चाहते हैं?",
    
    // Language
    language: "भाषा",
    hindi: "हिंदी",
    english: "अंग्रेजी",
    switchLanguage: "भाषा बदलें",
    currentLanguage: "वर्तमान भाषा: हिंदी"
  },
  en: {
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Information",
    
    // Navigation
    home: "Home",
    dashboard: "Dashboard",
    batchManagement: "Batch Management",
    feedPrices: "Feed Prices",
    reports: "Reports",
    settings: "Settings",
    profile: "Profile",
    logout: "Logout",
    
    // Authentication
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    welcome: "Welcome",
    
    // Batch Management
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
    inactive: "Inactive",
    days: "days",
    kg: "kg",
    bags: "bags",
    
    // Dashboard
    overview: "Overview",
    totalBatches: "Total Batches",
    totalBirdsCount: "Total Birds Count",
    avgFCR: "Average FCR",
    totalMortality: "Total Mortality",
    performance: "Performance",
    
    // Actions
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    submit: "Submit",
    download: "Download",
    upload: "Upload",
    refresh: "Refresh",
    
    // Messages
    saveSuccess: "Successfully saved",
    deleteSuccess: "Successfully deleted",
    updateSuccess: "Successfully updated",
    operationFailed: "Operation failed",
    fillAllFields: "Please fill in all required fields",
    confirmDelete: "Are you sure you want to delete this?",
    
    // Language
    language: "Language",
    hindi: "Hindi",
    english: "English",
    switchLanguage: "Switch Language",
    currentLanguage: "Current Language: English"
  }
};

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to Hindi
    const savedLanguage = localStorage.getItem('fowl-app-language');
    return savedLanguage || 'hi';
  });

  // Save to localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem('fowl-app-language', language);
    // Also set document language attribute for accessibility
    document.documentElement.lang = language;
  }, [language]);

  // Translation function with fallback
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    // If translation not found in current language, try English
    if (!value && language !== 'en') {
      value = translations.en;
      for (const k of keys) {
        value = value?.[k];
      }
    }
    
    // Return the value or the key itself if no translation found
    return value || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'hi' ? 'en' : 'hi');
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export default TranslationContext;
