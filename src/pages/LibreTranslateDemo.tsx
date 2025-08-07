/**
 * LibreTranslate Demo Component
 * Demonstrates all translation features in one place
 */

import React, { useState } from 'react';
import { useEnhancedTranslation } from '@/contexts/EnhancedTranslationContext';
import { 
  LanguageToggle, 
  TranslationStatus, 
  AsyncTranslate, 
  TranslateInput,
  useBatchTranslation 
} from '@/components/translation/TranslationComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Globe, Zap, Database, Languages } from 'lucide-react';

const LibreTranslateDemo: React.FC = () => {
  const { language, t, translateText, serviceAvailable } = useEnhancedTranslation();
  const { batchTranslate, isTranslating } = useBatchTranslation();
  
  const [testText, setTestText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState<string[]>([]);

  const handleTranslateTest = async () => {
    if (!testText.trim()) return;
    
    const result = await translateText(testText);
    setTranslatedText(result);
  };

  const handleBatchTest = async () => {
    if (!batchInput.trim()) return;
    
    const texts = batchInput.split('\n').filter(line => line.trim());
    const results = await batchTranslate(texts);
    setBatchResults(results);
  };

  const demoTexts = {
    hi: [
      "पोल्ट्री फार्मिंग एक लाभदायक व्यवसाय है",
      "मुर्गियों का स्वास्थ्य बहुत महत्वपूर्ण है", 
      "फीड की गुणवत्ता उत्पादन को प्रभावित करती है"
    ],
    en: [
      "Poultry farming is a profitable business",
      "The health of chickens is very important",
      "Feed quality affects production"
    ]
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle className="text-2xl">LibreTranslate Integration Demo</CardTitle>
                <p className="text-gray-600 mt-1">
                  Real-time Hindi ↔ English translation powered by LibreTranslate API
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TranslationStatus />
              <LanguageToggle />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span>Service: {serviceAvailable ? '🟢 Online' : '🔴 Offline'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-blue-600" />
              <span>Current: {language === 'hi' ? 'हिंदी' : 'English'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-600" />
              <span>Cached translations available</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Static Translations Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Static Translations (Instant)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{t('batchManagement')}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• {t('save')}</div>
                <div>• {t('cancel')}</div>
                <div>• {t('add')}</div>
                <div>• {t('edit')}</div>
                <div>• {t('delete')}</div>
                <div>• {t('submit')}</div>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              ✅ These translations load instantly from static definitions
            </p>
          </CardContent>
        </Card>

        {/* Dynamic Translation Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Dynamic Translations (API)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              {demoTexts[language].map((text, index) => (
                <div key={index} className="p-2 bg-white rounded border">
                  <AsyncTranslate text={text} className="text-sm" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600">
              🔄 These translations are fetched from LibreTranslate API
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Translation Testing */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Single Text Translation */}
        <Card>
          <CardHeader>
            <CardTitle>Single Text Translation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testInput">Enter text to translate:</Label>
              <Input
                id="testInput"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder={language === 'hi' ? 'यहाँ टेक्स्ट लिखें...' : 'Type text here...'}
              />
            </div>
            <Button onClick={handleTranslateTest} disabled={!testText.trim()}>
              Translate to {language === 'hi' ? 'English' : 'Hindi'}
            </Button>
            {translatedText && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-medium text-green-800">Translation:</p>
                <p className="text-green-700">{translatedText}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batch Translation */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Translation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="batchInput">Enter multiple lines to translate:</Label>
              <Textarea
                id="batchInput"
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder={language === 'hi' 
                  ? 'प्रत्येक लाइन में एक वाक्य लिखें...\nदूसरा वाक्य...\nतीसरा वाक्य...' 
                  : 'Enter one sentence per line...\nSecond sentence...\nThird sentence...'
                }
                rows={4}
              />
            </div>
            <Button 
              onClick={handleBatchTest} 
              disabled={!batchInput.trim() || isTranslating}
            >
              {isTranslating ? 'Translating...' : 'Batch Translate'}
            </Button>
            {batchResults.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-800 mb-2">Batch Results:</p>
                <div className="space-y-1">
                  {batchResults.map((result, index) => (
                    <p key={index} className="text-blue-700 text-sm">
                      {index + 1}. {result}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Translation Input Component Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Input Component Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Smart Translation Input (with translate button):</Label>
              <TranslateInput
                value={testText}
                onChange={setTestText}
                placeholder="Type and click translate button..."
                className="w-full p-2 border rounded"
              />
            </div>
            <p className="text-xs text-gray-600">
              This component includes a built-in translate button that automatically 
              translates the input to the opposite language.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">How to Use in Your Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-yellow-800">1. Import the hook:</h4>
              <code className="bg-yellow-100 p-2 rounded block mt-1">
                import &#123; useEnhancedTranslation &#125; from '@/contexts/EnhancedTranslationContext';
              </code>
            </div>
            
            <div>
              <h4 className="font-semibold text-yellow-800">2. Use in your component:</h4>
              <code className="bg-yellow-100 p-2 rounded block mt-1">
                const &#123; t, translateText, language &#125; = useEnhancedTranslation();
              </code>
            </div>
            
            <div>
              <h4 className="font-semibold text-yellow-800">3. Static vs Dynamic:</h4>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><code>t('key')</code> - Static translations (instant)</li>
                <li><code>translateText(text)</code> - Dynamic API translations (async)</li>
                <li><code>&lt;AsyncTranslate text="..." /&gt;</code> - Component for async translation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LibreTranslateDemo;
