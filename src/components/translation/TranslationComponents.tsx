/**
 * Translation Hook and Components
 * Provides easy-to-use translation components and hooks
 */

import React, { useState, useEffect } from 'react';
import { useEnhancedTranslation } from '@/contexts/EnhancedTranslationContext';
import { Button } from '@/components/ui/button';
import { Globe, Loader2 } from 'lucide-react';

// Translation Status Indicator
export const TranslationStatus: React.FC = () => {
  const { isTranslating, serviceAvailable, language } = useEnhancedTranslation();

  if (!serviceAvailable) {
    return (
      <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
        <Globe className="w-3 h-3" />
        <span>Translation service offline</span>
      </div>
    );
  }

  if (isTranslating) {
    return (
      <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Translating...</span>
      </div>
    );
  }

  return null;
};

// Language Toggle Button
export interface LanguageToggleProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showFlag?: boolean;
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'outline',
  size = 'sm',
  showFlag = true,
  className = ''
}) => {
  const { language, toggleLanguage, t } = useEnhancedTranslation();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleLanguage}
      className={`flex items-center gap-2 ${className}`}
    >
      {showFlag && <Globe className="w-4 h-4" />}
      <span>{language === 'hi' ? 'EN' : 'हिं'}</span>
    </Button>
  );
};

// Async Translation Component
export interface AsyncTranslateProps {
  text: string;
  fallback?: string;
  className?: string;
  targetLang?: 'hi' | 'en';
}

export const AsyncTranslate: React.FC<AsyncTranslateProps> = ({
  text,
  fallback,
  className,
  targetLang
}) => {
  const { translateText, language } = useEnhancedTranslation();
  const [translatedText, setTranslatedText] = useState<string>(fallback || text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const performTranslation = async () => {
      setIsLoading(true);
      try {
        const result = await translateText(text, targetLang);
        setTranslatedText(result);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(fallback || text);
      } finally {
        setIsLoading(false);
      }
    };

    if (text) {
      performTranslation();
    }
  }, [text, targetLang, language, translateText, fallback]);

  if (isLoading) {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>{fallback || text}</span>
      </span>
    );
  }

  return <span className={className}>{translatedText}</span>;
};

// Translation Input Component
export interface TranslateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showTranslateButton?: boolean;
}

export const TranslateInput: React.FC<TranslateInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  showTranslateButton = true
}) => {
  const { translateText, language, t } = useEnhancedTranslation();
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!value.trim()) return;

    setIsTranslating(true);
    try {
      const targetLang = language === 'hi' ? 'en' : 'hi';
      const translated = await translateText(value, targetLang);
      onChange(translated);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 ${className}`}
      />
      {showTranslateButton && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTranslate}
          disabled={isTranslating || !value.trim()}
        >
          {isTranslating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Globe className="w-4 h-4" />
          )}
        </Button>
      )}
    </div>
  );
};

// Translation Panel for Development/Debug
export const TranslationPanel: React.FC = () => {
  const { 
    language, 
    toggleLanguage, 
    serviceAvailable, 
    translationCache, 
    clearCache, 
    t,
    translateText 
  } = useEnhancedTranslation();

  const [testText, setTestText] = useState('');
  const [translatedTest, setTranslatedTest] = useState('');

  const testTranslation = async () => {
    if (!testText.trim()) return;
    
    const result = await translateText(testText);
    setTranslatedTest(result);
  };

  const cacheSize = Object.keys(translationCache).length;

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">Translation Debug Panel</h3>
      
      <div className="space-y-2 text-xs">
        <div>Language: <strong>{language}</strong></div>
        <div>Service: <strong>{serviceAvailable ? '✅ Online' : '❌ Offline'}</strong></div>
        <div>Cache: <strong>{cacheSize} entries</strong></div>
        
        <div className="flex gap-2">
          <Button size="sm" onClick={toggleLanguage}>
            Switch to {language === 'hi' ? 'EN' : 'HI'}
          </Button>
          <Button size="sm" variant="outline" onClick={clearCache}>
            Clear Cache
          </Button>
        </div>

        <div className="border-t pt-2">
          <input
            type="text"
            placeholder="Test translation..."
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full text-xs p-1 border rounded"
          />
          <Button size="sm" onClick={testTranslation} className="w-full mt-1">
            Translate
          </Button>
          {translatedTest && (
            <div className="mt-1 p-1 bg-gray-50 rounded text-xs">
              {translatedTest}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Custom hook for batch translations
export const useBatchTranslation = () => {
  const { translateText } = useEnhancedTranslation();
  const [isTranslating, setIsTranslating] = useState(false);

  const batchTranslate = async (
    texts: string[], 
    targetLang?: 'hi' | 'en'
  ): Promise<string[]> => {
    setIsTranslating(true);
    try {
      const promises = texts.map(text => translateText(text, targetLang));
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Batch translation failed:', error);
      return texts; // Return original texts on error
    } finally {
      setIsTranslating(false);
    }
  };

  return { batchTranslate, isTranslating };
};

export default {
  TranslationStatus,
  LanguageToggle,
  AsyncTranslate,
  TranslateInput,
  TranslationPanel,
  useBatchTranslation
};
