/**
 * LibreTranslate API Service
 * Provides translation between Hindi and English using LibreTranslate API with fallback services
 */

// LibreTranslate API Configuration
const LIBRETRANSLATE_CONFIG = {
  // Multiple fallback services - will try in order
  fallbackServices: [
    {
      baseURL: 'https://translate.argosopentech.com',
      apiKey: '',
      name: 'Argos Open Tech'
    },
    {
      baseURL: 'https://libretranslate.com',
      apiKey: '', // Add your API key here if you have one
      name: 'LibreTranslate.com'
    }
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

class LibreTranslateService {
  private fallbackServices: Array<{baseURL: string; apiKey: string; name: string}>;
  private timeout: number;
  private currentServiceIndex: number;
  private cache: Map<string, {data: any; timestamp: number}>;

  constructor() {
    this.fallbackServices = LIBRETRANSLATE_CONFIG.fallbackServices;
    this.timeout = LIBRETRANSLATE_CONFIG.timeout;
    this.currentServiceIndex = 0;
    this.cache = new Map();
  }

  /**
   * Try to make a request with fallback services
   */
  private async tryWithFallback<T>(
    operation: (service: {baseURL: string; apiKey: string; name: string}) => Promise<T>
  ): Promise<T & {service?: string}> {
    let lastError: Error | null = null;

    for (let i = 0; i < this.fallbackServices.length; i++) {
      const service = this.fallbackServices[i];
      try {
        console.log(`Trying ${service.name}...`);
        const result = await operation(service);
        this.currentServiceIndex = i;
        return { ...result, service: service.name } as T & {service?: string};
      } catch (error) {
        console.warn(`${service.name} failed:`, error);
        lastError = error as Error;
        continue;
      }
    }

    // Log warning but don't break the app - static translations will still work
    console.warn('All translation services failed, using static translations only');
    throw new Error(`Translation services unavailable. Using static translations.`);
  }

  /**
   * Get cache key for a request
   */
  private getCacheKey(key: string): string {
    return `libretranslate_${key}`;
  }

  /**
   * Get cached data if available and not expired
   */
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(this.getCacheKey(key));
    if (cached && Date.now() - cached.timestamp < LIBRETRANSLATE_CONFIG.cacheDuration) {
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
    const cacheKey = 'languages';
    const cached = this.getCached<LanguageInfo[]>(cacheKey);
    if (cached) return cached;

    try {
      const result = await this.tryWithFallback(async (service) => {
        const response = await fetch(`${service.baseURL}/languages`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(this.timeout)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      });

      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('Could not fetch languages, using defaults:', error);
      return [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' }
      ];
    }
  }

  /**
   * Translate text
   */
  async translateText({ text, source, target }: TranslationRequest): Promise<TranslationResponse> {
    if (!text || text.trim() === '') {
      return { translatedText: text };
    }

    // Check cache
    const cacheKey = `${text}_${source}_${target}`;
    const cached = this.getCached<TranslationResponse>(cacheKey);
    if (cached) return cached;

    try {
      const result = await this.tryWithFallback(async (service) => {
        const requestBody: any = {
          q: text,
          source: source === 'auto' ? 'auto' : source,
          target: target,
          format: 'text'
        };

        // Add API key if available and service requires it
        if (service.apiKey && service.baseURL.includes('libretranslate.com')) {
          requestBody.api_key = service.apiKey;
        }

        const response = await fetch(`${service.baseURL}/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(this.timeout)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return {
          translatedText: data.translatedText,
          detectedLanguage: data.detectedLanguage
        };
      });

      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('Translation failed, returning original text:', error);
      return { 
        translatedText: text,
        service: 'fallback'
      };
    }
  }

  /**
   * Detect language of text
   */
  async detectLanguage(text: string): Promise<string> {
    if (!text || text.trim() === '') {
      return 'en';
    }

    const cacheKey = `detect_${text}`;
    const cached = this.getCached<string>(cacheKey);
    if (cached) return cached;

    try {
      const result = await this.tryWithFallback(async (service) => {
        const requestBody: any = {
          q: text
        };

        if (service.apiKey && service.baseURL.includes('libretranslate.com')) {
          requestBody.api_key = service.apiKey;
        }

        const response = await fetch(`${service.baseURL}/detect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(this.timeout)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data[0]?.language || 'en';
      });

      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('Language detection failed, defaulting to English:', error);
      return 'en';
    }
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
      await this.getLanguages();
      return true;
    } catch (error) {
      console.warn('Translation services unavailable, using static translations only:', error);
      // Return false but don't break the app - static translations will still work
      return false;
    }
  }

  /**
   * Get service status
   */
  async getServiceStatus(): Promise<ServiceInfo[]> {
    const status: ServiceInfo[] = [];

    for (const service of this.fallbackServices) {
      try {
        const response = await fetch(`${service.baseURL}/languages`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });

        status.push({
          name: service.name,
          baseURL: service.baseURL,
          available: response.ok
        });
      } catch (error) {
        status.push({
          name: service.name,
          baseURL: service.baseURL,
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
    const service = this.fallbackServices[this.currentServiceIndex];
    return {
      name: service.name,
      baseURL: service.baseURL
    };
  }
}

// Create and export a singleton instance
export const libreTranslateService = new LibreTranslateService();

// Export the class for testing purposes
export { LibreTranslateService };
