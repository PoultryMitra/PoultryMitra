# 🌐 LibreTranslate Integration Guide

This guide explains how the LibreTranslate API integration works in your React application, providing seamless Hindi ↔ English translation.

## 🚀 Features Implemented

### ✅ Complete Translation System
- **Static Translations**: Instant UI element translations (login, save, cancel, etc.)
- **Dynamic API Translations**: Real-time content translation via LibreTranslate
- **Smart Caching**: 24-hour localStorage cache for translated content
- **Fallback System**: Always works, even when API is offline
- **Auto Language Detection**: Detects source language automatically

### ✅ UI Components Ready
- **Language Toggle Button**: Switch between Hindi/English
- **Translation Status**: Shows service availability
- **Async Translation Component**: For dynamic content
- **Translation Input**: Input field with translate button
- **Debug Panel**: Development-only translation testing

### ✅ Developer Experience
- **TypeScript Support**: Fully typed translation functions
- **Hook-based**: Easy `useEnhancedTranslation()` hook
- **Batch Translation**: Translate multiple texts efficiently
- **Error Handling**: Graceful fallbacks on API failures

## 🛠️ Setup Options

### Option 1: Public Instance (Quick Start)
```typescript
// In src/services/libreTranslateService.ts
const LIBRETRANSLATE_CONFIG = {
  baseURL: 'https://libretranslate.com',
  apiKey: 'YOUR_API_KEY', // Get from libretranslate.com
  // ...rest
};
```

### Option 2: Self-Hosted (Recommended)
```bash
# Quick Docker setup
docker run -ti --rm -p 5000:5000 libretranslate/libretranslate

# Or install directly
pip install libretranslate
libretranslate --host 0.0.0.0 --port 5000
```

```typescript
// Update config for self-hosted
const LIBRETRANSLATE_CONFIG = {
  baseURL: 'http://localhost:5000', // Your server
  apiKey: '', // No API key needed for self-hosted
  // ...rest
};
```

## 📝 Usage in Your Components

### Basic Usage
```tsx
import { useEnhancedTranslation } from '@/contexts/EnhancedTranslationContext';
import { LanguageToggle, AsyncTranslate } from '@/components/translation/TranslationComponents';

const MyComponent = () => {
  const { t, translateText, language } = useEnhancedTranslation();
  
  return (
    <div>
      {/* Static translation (instant) */}
      <h1>{t('title')}</h1>
      <button>{t('save')}</button>
      
      {/* Dynamic translation (API) */}
      <AsyncTranslate text="This will be translated dynamically" />
      
      {/* Language toggle */}
      <LanguageToggle />
    </div>
  );
};
```

### Async Translation
```tsx
const handleTranslate = async () => {
  const translated = await translateText("Hello, how are you?");
  console.log(translated); // "नमस्ते, आप कैसे हैं?"
};
```

### Batch Translation
```tsx
import { useBatchTranslation } from '@/components/translation/TranslationComponents';

const MyComponent = () => {
  const { batchTranslate } = useBatchTranslation();
  
  const handleBatch = async () => {
    const texts = ['Hello', 'World', 'Good morning'];
    const results = await batchTranslate(texts, 'hi');
    // Results: ['नमस्ते', 'दुनिया', 'सुप्रभात']
  };
};
```

## 🎯 Integration Status

### ✅ Completed Pages
- [x] **BatchManagement.tsx** - Fully integrated with LibreTranslate
- [x] **LibreTranslateDemo.tsx** - Complete demo of all features
- [x] **App.tsx** - Enhanced translation provider setup

### 🔧 Ready for Integration
All other pages in your app can now use the translation system by:

1. **Import the hook**:
   ```tsx
   import { useEnhancedTranslation } from '@/contexts/EnhancedTranslationContext';
   ```

2. **Use in component**:
   ```tsx
   const { t, translateText, language } = useEnhancedTranslation();
   ```

3. **Add language toggle**:
   ```tsx
   import { LanguageToggle } from '@/components/translation/TranslationComponents';
   // Then use: <LanguageToggle />
   ```

## 🧪 Testing & Demo

### Live Demo Page
Visit `/libretranslate-demo` to see all features in action:
- Static vs Dynamic translations
- Single text translation
- Batch translation
- Translation input components
- Service status indicators

### Updated Batch Management
Visit `/batch-management` to see the enhanced page with:
- Language toggle in header
- Translation status indicator
- All text content translatable
- Persistent language selection

## 📊 Performance & Caching

### Smart Caching Strategy
- **Static translations**: Instant loading from memory
- **API translations**: Cached for 24 hours in localStorage
- **Batch operations**: Optimized for multiple translations
- **Service health**: Checked on app startup

### Fallback System
1. **Primary**: LibreTranslate API translation
2. **Secondary**: Static translation (if key exists)
3. **Fallback**: Original text (always works)

## 🔧 Configuration

### Environment Variables
```env
# .env file
VITE_LIBRETRANSLATE_URL=https://libretranslate.com
VITE_LIBRETRANSLATE_API_KEY=your_api_key_here
```

### Service Configuration
The service automatically:
- ✅ Detects available languages
- ✅ Handles API rate limits
- ✅ Provides health check endpoint
- ✅ Manages connection timeouts
- ✅ Caches translation results

## 🎨 UI Components Available

### Language Toggle
```tsx
<LanguageToggle variant="outline" size="sm" showFlag={true} />
```

### Translation Status
```tsx
<TranslationStatus /> // Shows "Online/Offline" status
```

### Async Translation
```tsx
<AsyncTranslate 
  text="Dynamic content to translate" 
  fallback="Loading..."
  targetLang="hi" 
/>
```

### Translation Input
```tsx
<TranslateInput
  value={text}
  onChange={setText}
  placeholder="Type to translate..."
  showTranslateButton={true}
/>
```

## 🚀 Next Steps

1. **Test the system**: Visit `/libretranslate-demo` and `/batch-management`
2. **Choose setup**: Public API key or self-hosted instance
3. **Integrate gradually**: Add translation to other pages as needed
4. **Customize**: Extend static translations for your specific content

## 💡 Best Practices

- **Use static translations** for UI elements (buttons, labels)
- **Use dynamic translations** for user content and dynamic text
- **Cache aggressively** to minimize API calls
- **Provide fallbacks** for offline scenarios
- **Test both languages** thoroughly

The system is now ready to use across your entire application! 🎉
