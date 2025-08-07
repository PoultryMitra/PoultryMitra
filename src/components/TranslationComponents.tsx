/**
 * Translation Components for LibreTranslate Integration
 * UI components for handling translations
 */

import React, { useState, useEffect } from 'react';
import { useEnhancedTranslation } from '../contexts/EnhancedTranslationContext';
import { libreTranslateService } from '../services/libreTranslateService';

/**
 * Language Toggle Button Component
 */
export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage, isTranslating } = useEnhancedTranslation();

  return (
    <button
      onClick={toggleLanguage}
      disabled={isTranslating}
      className={`
        px-4 py-2 rounded-lg border transition-all duration-200
        ${isTranslating 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
        }
        flex items-center space-x-2
      `}
      title={`Switch to ${language === 'en' ? 'Hindi' : 'English'}`}
    >
      <span className="font-medium text-sm">
        {language === 'en' ? 'English | Hindi' : 'हिंदी | English'}
      </span>
      {isTranslating && (
        <div className="animate-spin h-3 w-3 border border-blue-300 border-t-blue-600 rounded-full"></div>
      )}
    </button>
  );
};

/**
 * Translation Status Indicator
 */
export const TranslationStatus: React.FC = () => {
  const { isTranslating, language, serviceAvailable } = useEnhancedTranslation();
  const [serviceStatus, setServiceStatus] = useState<string>('checking');

  useEffect(() => {
    const checkService = async () => {
      try {
        const isHealthy = await libreTranslateService.checkServiceHealth();
        setServiceStatus(isHealthy ? 'online' : 'offline');
      } catch (error) {
        setServiceStatus('error');
      }
    };

    checkService();
  }, []);

  if (!isTranslating && serviceAvailable) return null;

  return (
    <div className={`
      fixed bottom-4 right-4 px-3 py-2 rounded-lg text-sm font-medium
      flex items-center space-x-2 shadow-lg z-50
      ${isTranslating 
        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
        : serviceStatus === 'offline' 
        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
        : 'bg-red-50 text-red-700 border border-red-200'
      }
    `}>
      {isTranslating ? (
        <>
          <div className="animate-spin h-3 w-3 border border-blue-300 border-t-blue-600 rounded-full"></div>
          <span>Translating...</span>
        </>
      ) : serviceStatus === 'offline' ? (
        <>
          <span className="text-yellow-500">⚠️</span>
          <span>Translation offline</span>
        </>
      ) : (
        <>
          <span className="text-red-500">❌</span>
          <span>Translation error</span>
        </>
      )}
    </div>
  );
};

/**
 * Async Translation Component
 * For translating text that's loaded dynamically
 */
interface AsyncTranslateProps {
  text: string;
  fallback?: string;
  className?: string;
}

export const AsyncTranslate: React.FC<AsyncTranslateProps> = ({ 
  text, 
  fallback, 
  className = '' 
}) => {
  const { translateText, language } = useEnhancedTranslation();
  const [translatedText, setTranslatedText] = useState<string>(text);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translate = async () => {
      if (language === 'en' || !text) {
        setTranslatedText(text);
        return;
      }

      setIsTranslating(true);
      try {
        const result = await translateText(text, 'hi');
        setTranslatedText(result);
      } catch (error) {
        console.warn('Translation failed:', error);
        setTranslatedText(fallback || text);
      } finally {
        setIsTranslating(false);
      }
    };

    translate();
  }, [text, language, translateText, fallback]);

  return (
    <span className={`${className} ${isTranslating ? 'opacity-70' : ''}`}>
      {isTranslating ? (
        <span className="inline-flex items-center space-x-1">
          <span>{fallback || text}</span>
          <div className="animate-spin h-3 w-3 border border-gray-300 border-t-gray-600 rounded-full"></div>
        </span>
      ) : (
        translatedText
      )}
    </span>
  );
};

/**
 * Translation Service Info Component
 * Shows current service status and info
 */
export const ServiceInfo: React.FC<{className?: string}> = ({ className = '' }) => {
  const [serviceInfo, setServiceInfo] = useState<{
    current: {name: string; baseURL: string};
    status: Array<{name: string; baseURL: string; available: boolean}>;
  } | null>(null);

  useEffect(() => {
    const getInfo = async () => {
      try {
        const current = libreTranslateService.getCurrentService();
        const status = await libreTranslateService.getServiceStatus();
        setServiceInfo({ current, status });
      } catch (error) {
        console.warn('Could not get service info:', error);
      }
    };

    getInfo();
  }, []);

  if (!serviceInfo) return null;

  return (
    <div className={`bg-gray-50 rounded-lg p-3 text-xs text-gray-600 ${className}`}>
      <div className="font-medium mb-2">Translation Service Status</div>
      <div className="space-y-1">
        <div>Current: {serviceInfo.current.name}</div>
        {serviceInfo.status.map((service, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className={service.available ? 'text-green-500' : 'text-red-500'}>
              {service.available ? '✅' : '❌'}
            </span>
            <span>{service.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Batch Translation Hook
 * For translating multiple texts at once
 */
export const useBatchTranslation = () => {
  const { language } = useEnhancedTranslation();
  const [isTranslating, setIsTranslating] = useState(false);

  const batchTranslate = async (texts: string[]): Promise<string[]> => {
    if (language === 'en') return texts;

    setIsTranslating(true);
    try {
      const results = await libreTranslateService.batchTranslate({
        texts,
        source: 'en',
        target: 'hi'
      });
      return results.map(result => result.translatedText);
    } catch (error) {
      console.warn('Batch translation failed:', error);
      return texts;
    } finally {
      setIsTranslating(false);
    }
  };

  return { batchTranslate, isTranslating };
};

export default {
  LanguageToggle,
  TranslationStatus,
  AsyncTranslate,
  ServiceInfo,
  useBatchTranslation
};
