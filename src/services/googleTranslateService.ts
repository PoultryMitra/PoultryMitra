/**
 * Google Translate Service (No API Key Required)
 * Provides translation between Hindi and English using Google Translate web interface
 */

// Google Translate Configuration
const GOOGLE_TRANSLATE_CONFIG = {
  // Unofficial Google Translate endpoints that don't require API keys
  endpoints: [
    'https://translate.googleapis.com/translate_a/single',
    'https://clients5.google.com/translate_a/t'
  ],
  
  // Supported languages
  supportedLanguages: ['hi', 'en'],
  
  // Default timeout
  timeout: 10000,
  
  // Cache duration (24 hours)
  cacheDuration: 24 * 60 * 60 * 1000
};

export interface TranslationRequest {
  text: string;
  source: 'hi' | 'en' | 'auto';
  target: 'hi' | 'en';
}

export interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: {
    confidence: number;
    language: string;
  };
  service?: string;
}

export interface LanguageInfo {
  code: string;
  name: string;
}

export interface ServiceInfo {
  name: string;
  baseURL: string;
  available: boolean;
}

class GoogleTranslateService {
  private endpoints: string[];
  private timeout: number;
  private currentEndpointIndex: number;
  private cache: Map<string, {data: any; timestamp: number}>;

  constructor() {
    this.endpoints = GOOGLE_TRANSLATE_CONFIG.endpoints;
    this.timeout = GOOGLE_TRANSLATE_CONFIG.timeout;
    this.currentEndpointIndex = 0;
    this.cache = new Map();
  }

  /**
   * Try multiple endpoints as fallback
   */
  private async tryWithFallback<T>(
    operation: (endpoint: string) => Promise<T>
  ): Promise<T & {service?: string}> {
    let lastError: Error | null = null;

    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.endpoints[i];
      try {
        console.log(`Trying Google Translate endpoint ${i + 1}...`);
        const result = await operation(endpoint);
        this.currentEndpointIndex = i;
        return { ...result, service: `Google Translate (${i + 1})` } as T & {service?: string};
      } catch (error) {
        console.warn(`Google Translate endpoint ${i + 1} failed:`, error);
        lastError = error as Error;
        continue;
      }
    }

    // Fallback to local translation dictionary
    console.warn('All Google Translate endpoints failed, using local translations only');
    throw new Error(`Translation services unavailable. Using static translations.`);
  }

  /**
   * Get cache key for a request
   */
  private getCacheKey(key: string): string {
    return `googletranslate_${key}`;
  }

  /**
   * Get cached data if available and not expired
   */
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(this.getCacheKey(key));
    if (cached && Date.now() - cached.timestamp < GOOGLE_TRANSLATE_CONFIG.cacheDuration) {
      return cached.data as T;
    }
    return null;
  }

  /**
   * Cache data
   */
  private setCached<T>(key: string, data: T): void {
    this.cache.set(this.getCacheKey(key), {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get available languages
   */
  async getLanguages(): Promise<LanguageInfo[]> {
    // Return supported languages directly since we know them
    return [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'Hindi' }
    ];
  }

  /**
   * Translate text using Google Translate (No API Key)
   */
  async translateText({ text, source, target }: TranslationRequest): Promise<TranslationResponse> {
    if (!text || text.trim() === '') {
      return { translatedText: text };
    }

    // Check cache first
    const cacheKey = `${text}_${source}_${target}`;
    const cached = this.getCached<TranslationResponse>(cacheKey);
    if (cached) return cached;

    try {
      const result = await this.tryWithFallback(async (endpoint) => {
        // Using Google Translate API endpoint without authentication
        const params = new URLSearchParams({
          client: 'gtx',
          sl: source === 'auto' ? 'auto' : source,
          tl: target,
          dt: 't',
          q: text
        });

        const response = await fetch(`${endpoint}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          signal: AbortSignal.timeout(this.timeout)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Parse Google Translate response format
        let translatedText = text;
        let detectedLanguage = undefined;

        if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
          translatedText = data[0][0][0] || text;
          
          if (data[2]) {
            detectedLanguage = {
              confidence: 1.0,
              language: data[2]
            };
          }
        }

        return {
          translatedText,
          detectedLanguage
        };
      });

      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('Google Translate failed, trying local translation fallback:', error);
      
      // Fallback to a simple local translation for common phrases
      const localTranslation = this.getLocalTranslation(text, source, target);
      if (localTranslation !== text) {
        const result = { translatedText: localTranslation, service: 'Local Dictionary' };
        this.setCached(cacheKey, result);
        return result;
      }

      console.warn('All translation methods failed, returning original text');
      return { 
        translatedText: text,
        service: 'fallback'
      };
    }
  }

  /**
   * Local translation fallback for common phrases
   */
  private getLocalTranslation(text: string, source: string, target: string): string {
    // Simple dictionary for common poultry farming terms
    const dictionary: {[key: string]: {[key: string]: string}} = {
      'en_to_hi': {
        'hello': 'नमस्ते',
        'welcome': 'स्वागत है',
        'dashboard': 'डैशबोर्ड',
        'dealer': 'डीलर',
        'farmer': 'किसान',
        'inventory': 'इन्वेंटरी',
        'products': 'उत्पाद',
        'total': 'कुल',
        'revenue': 'राजस्व',
        'orders': 'ऑर्डर',
        'feed': 'चारा',
        'medicine': 'दवा',
        'batch': 'बैच',
        'birds': 'पक्षी',
        'mortality': 'मृत्यु दर',
        'weight': 'वजन',
        'age': 'आयु',
        'profile': 'प्रोफाइल',
        'logout': 'लॉगआउट',
        'login': 'लॉगिन',
        'register': 'रजिस्टर',
        'password': 'पासवर्ड',
        'email': 'ईमेल',
        'phone': 'फोन',
        'address': 'पता',
        'save': 'सेव करें',
        'edit': 'संपादित करें',
        'delete': 'हटाएं',
        'add': 'जोड़ें',
        'update': 'अपडेट करें',
        'search': 'खोजें',
        'filter': 'फिल्टर',
        'sort': 'क्रमबद्ध करें',
        'test': 'परीक्षण',
        'demo': 'डेमो',
        'translate': 'अनुवाद करें',
        'google translate demo': 'गूगल अनुवाद डेमो',
        'enter text to translate': 'अनुवाद के लिए टेक्स्ट दर्ज करें',
        'translation result': 'अनुवाद परिणाम',
        'clear': 'साफ़ करें',
        'service status': 'सेवा स्थिति',
        'available': 'उपलब्ध',
        'unavailable': 'अनुपलब्ध',
        'language': 'भाषा'
      },
      'hi_to_en': {
        'नमस्ते': 'hello',
        'स्वागत है': 'welcome',
        'डैशबोर्ड': 'dashboard',
        'डीलर': 'dealer',
        'किसान': 'farmer',
        'इन्वेंटरी': 'inventory',
        'उत्पाद': 'products',
        'कुल': 'total',
        'राजस्व': 'revenue',
        'ऑर्डर': 'orders',
        'चारा': 'feed',
        'दवा': 'medicine',
        'बैच': 'batch',
        'पक्षी': 'birds',
        'मृत्यु दर': 'mortality',
        'वजन': 'weight',
        'आयु': 'age',
        'प्रोफाइल': 'profile',
        'लॉगआउट': 'logout',
        'लॉगिन': 'login',
        'रजिस्टर': 'register',
        'पासवर्ड': 'password',
        'ईमेल': 'email',
        'फोन': 'phone',
        'पता': 'address',
        'सेव करें': 'save',
        'संपादित करें': 'edit',
        'हटाएं': 'delete',
        'जोड़ें': 'add',
        'अपडेट करें': 'update',
        'खोजें': 'search',
        'फिल्टर': 'filter',
        'क्रमबद्ध करें': 'sort',
        'परीक्षण': 'test',
        'डेमो': 'demo',
        'अनुवाद करें': 'translate',
        'गूगल अनुवाद डेमो': 'google translate demo',
        'अनुवाद के लिए टेक्स्ट दर्ज करें': 'enter text to translate',
        'अनुवाद परिणाम': 'translation result',
        'साफ़ करें': 'clear',
        'सेवा स्थिति': 'service status',
        'उपलब्ध': 'available',
        'अनुपलब्ध': 'unavailable',
        'भाषा': 'language'
      }
    };

    const dictKey = `${source}_to_${target}`;
    const dict = dictionary[dictKey];
    
    if (dict && dict[text.toLowerCase()]) {
      return dict[text.toLowerCase()];
    }

    return text;
  }

  /**
   * Detect language of text
   */
  async detectLanguage(text: string): Promise<string> {
    if (!text || text.trim() === '') {
      return 'en';
    }

    // Simple language detection based on script
    const hindiPattern = /[\u0900-\u097F]/;
    if (hindiPattern.test(text)) {
      return 'hi';
    }
    
    return 'en';
  }

  /**
   * Batch translate multiple texts
   */
  async batchTranslate({ 
    texts, 
    source, 
    target 
  }: { 
    texts: string[]; 
    source: 'hi' | 'en' | 'auto'; 
    target: 'hi' | 'en' 
  }): Promise<TranslationResponse[]> {
    const promises = texts.map(text => 
      this.translateText({ text, source, target })
    );
    
    return Promise.all(promises);
  }

  /**
   * Check service health
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      // Try a simple translation to check if service is working
      const result = await this.translateText({
        text: 'test',
        source: 'en',
        target: 'hi'
      });
      return result.translatedText !== undefined;
    } catch (error) {
      console.warn('Google Translate service unavailable, using local translations only:', error);
      return false;
    }
  }

  /**
   * Get service status
   */
  async getServiceStatus(): Promise<ServiceInfo[]> {
    const status: ServiceInfo[] = [];

    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.endpoints[i];
      try {
        const response = await fetch(`${endpoint}?client=gtx&sl=en&tl=hi&dt=t&q=test`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });

        status.push({
          name: `Google Translate (${i + 1})`,
          baseURL: endpoint,
          available: response.ok
        });
      } catch (error) {
        status.push({
          name: `Google Translate (${i + 1})`,
          baseURL: endpoint,
          available: false
        });
      }
    }

    return status;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get current service info
   */
  getCurrentService(): {name: string; baseURL: string} {
    const endpoint = this.endpoints[this.currentEndpointIndex];
    return {
      name: `Google Translate`,
      baseURL: endpoint
    };
  }
}

// Create and export a singleton instance
export const googleTranslateService = new GoogleTranslateService();

// Export the class for testing purposes
export { GoogleTranslateService };
