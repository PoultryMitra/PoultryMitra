# LibreTranslate Configuration

This document explains how to configure and use LibreTranslate in your application.

## Configuration Options

### 1. Public Instance (libretranslate.com)
- **URL**: `https://libretranslate.com`
- **Requires**: API Key
- **Cost**: Pay per use
- **Setup**: Add your API key to the service configuration

### 2. Self-Hosted Instance (Recommended for Production)
- **URL**: `http://your-server:5000`
- **Requires**: No API Key
- **Cost**: Free (hosting costs only)
- **Setup**: Deploy LibreTranslate on your server

## Quick Setup

### Option 1: Using Public Instance
1. Get an API key from https://libretranslate.com
2. Update `src/services/libreTranslateService.ts`:
   ```typescript
   const LIBRETRANSLATE_CONFIG = {
     baseURL: 'https://libretranslate.com',
     apiKey: 'YOUR_API_KEY_HERE', // Add your API key
     // ... rest of config
   };
   ```

### Option 2: Self-Hosted (Docker)
1. Run LibreTranslate with Docker:
   ```bash
   docker run -ti --rm -p 5000:5000 libretranslate/libretranslate
   ```

2. Update `src/services/libreTranslateService.ts`:
   ```typescript
   const LIBRETRANSLATE_CONFIG = {
     baseURL: 'http://localhost:5000', // Your server URL
     apiKey: '', // Leave empty for self-hosted
     // ... rest of config
   };
   ```

### Option 3: Self-Hosted (VPS - Recommended for Production)
1. Deploy on a VPS (DigitalOcean, AWS, etc.):
   ```bash
   # Install LibreTranslate
   pip install libretranslate
   
   # Run with custom settings
   libretranslate --host 0.0.0.0 --port 5000 --req-limit 100
   ```

2. Update configuration with your VPS URL:
   ```typescript
   const LIBRETRANSLATE_CONFIG = {
     baseURL: 'https://your-domain.com', // Your VPS URL
     apiKey: '', // No API key needed
     // ... rest of config
   };
   ```

## Environment Variables

You can also use environment variables for configuration:

```env
# .env file
VITE_LIBRETRANSLATE_URL=https://libretranslate.com
VITE_LIBRETRANSLATE_API_KEY=your_api_key_here
```

Then update the service:
```typescript
const LIBRETRANSLATE_CONFIG = {
  baseURL: import.meta.env.VITE_LIBRETRANSLATE_URL || 'https://libretranslate.com',
  apiKey: import.meta.env.VITE_LIBRETRANSLATE_API_KEY || '',
  // ... rest of config
};
```

## Features Implemented

### ✅ Core Translation Features
- [x] Text translation between Hindi and English
- [x] Auto language detection
- [x] Batch translation support
- [x] Translation caching (24 hours)
- [x] Fallback to original text on error
- [x] Service health checking

### ✅ UI Components
- [x] Language toggle button
- [x] Translation status indicator
- [x] Async translation component
- [x] Translation input with translate button
- [x] Debug panel for development

### ✅ Context Integration
- [x] Enhanced translation context
- [x] Static + dynamic translation fallback
- [x] Persistent language selection
- [x] Local storage caching

## Usage in Components

### Basic Translation
```typescript
import { useEnhancedTranslation } from '@/contexts/EnhancedTranslationContext';

const MyComponent = () => {
  const { t, translateText, language } = useEnhancedTranslation();
  
  return (
    <div>
      <h1>{t('title')}</h1> {/* Static translation */}
      <AsyncTranslate text="Dynamic content" /> {/* Dynamic translation */}
    </div>
  );
};
```

### Language Toggle
```typescript
import { LanguageToggle } from '@/components/translation/TranslationComponents';

const Header = () => (
  <header>
    <LanguageToggle />
  </header>
);
```

### Batch Translation
```typescript
import { useBatchTranslation } from '@/components/translation/TranslationComponents';

const MyComponent = () => {
  const { batchTranslate } = useBatchTranslation();
  
  const handleBatchTranslate = async () => {
    const texts = ['Hello', 'World', 'How are you?'];
    const translated = await batchTranslate(texts, 'hi');
    console.log(translated); // ['नमस्ते', 'दुनिया', 'आप कैसे हैं?']
  };
};
```

## Performance Considerations

1. **Caching**: Translations are cached for 24 hours in localStorage
2. **Fallback**: Static translations load instantly, dynamic ones load async
3. **Batching**: Use batch translation for multiple texts
4. **Service Health**: Service availability is checked on app start

## Troubleshooting

### Service Offline
- The app will show "Translation service offline" indicator
- Static translations will still work
- Dynamic translations will return original text

### API Key Issues (Public Instance)
- Ensure API key is valid and has credits
- Check network connectivity
- Verify CORS settings if running locally

### Self-Hosted Issues
- Ensure LibreTranslate server is running
- Check firewall/port settings
- Verify language models are downloaded

## Development

### Debug Panel
In development mode, a debug panel appears in the bottom-right corner showing:
- Current language
- Service status
- Cache size
- Translation test interface

### Adding New Languages
To add support for more languages:

1. Update `supportedLanguages` in service config
2. Add language option to context
3. Update UI components for language selection
4. Add static translations for new language

## Security Notes

- API keys should be stored in environment variables
- Consider rate limiting for public instances
- Self-hosted instances are more secure and private
- Translation cache is stored in browser localStorage

## Cost Optimization

- Use self-hosted instance for heavy usage
- Implement smart caching strategies
- Cache translations server-side for common content
- Use static translations for UI elements
