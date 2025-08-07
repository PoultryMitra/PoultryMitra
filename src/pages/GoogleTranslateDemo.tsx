import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Globe, ArrowRightLeft, Copy, Trash2 } from 'lucide-react';
import { googleTranslateService, TranslationResponse, ServiceInfo } from '@/services/googleTranslateService';

const GoogleTranslateDemo: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState<'en' | 'hi' | 'auto'>('auto');
  const [targetLanguage, setTargetLanguage] = useState<'en' | 'hi'>('hi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceInfo[]>([]);
  const [isServiceHealthy, setIsServiceHealthy] = useState(false);
  const [translationHistory, setTranslationHistory] = useState<Array<{
    original: string;
    translated: string;
    sourceLanguage: string;
    targetLanguage: string;
    service?: string;
    timestamp: Date;
  }>>([]);

  const { toast } = useToast();

  // Check service health on mount
  useEffect(() => {
    checkServiceHealth();
    loadServiceStatus();
  }, []);

  const checkServiceHealth = async () => {
    try {
      const isHealthy = await googleTranslateService.checkServiceHealth();
      setIsServiceHealthy(isHealthy);
    } catch (error) {
      setIsServiceHealthy(false);
    }
  };

  const loadServiceStatus = async () => {
    try {
      const status = await googleTranslateService.getServiceStatus();
      setServiceStatus(status);
    } catch (error) {
      console.warn('Failed to load service status:', error);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to translate.",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    
    try {
      const result: TranslationResponse = await googleTranslateService.translateText({
        text: inputText.trim(),
        source: sourceLanguage,
        target: targetLanguage
      });

      setTranslatedText(result.translatedText);

      // Add to history
      setTranslationHistory(prev => [{
        original: inputText.trim(),
        translated: result.translatedText,
        sourceLanguage: result.detectedLanguage?.language || sourceLanguage,
        targetLanguage,
        service: result.service,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]); // Keep last 10 translations

      toast({
        title: "Translation Successful",
        description: `Translated using ${result.service || 'Google Translate'}`,
      });

    } catch (error) {
      console.error('Translation failed:', error);
      toast({
        title: "Translation Failed",
        description: "Failed to translate text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLanguage !== 'auto') {
      const newSource = targetLanguage;
      const newTarget = sourceLanguage as 'en' | 'hi';
      setSourceLanguage(newSource);
      setTargetLanguage(newTarget);
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  };

  const handleClearAll = () => {
    setInputText('');
    setTranslatedText('');
    setTranslationHistory([]);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard.",
        variant: "destructive"
      });
    }
  };

  const predefinedExamples = [
    { en: "Hello, how are you?", hi: "नमस्ते, आप कैसे हैं?" },
    { en: "Welcome to our poultry farm", hi: "हमारे मुर्गी पालन फार्म में आपका स्वागत है" },
    { en: "Please check the feed inventory", hi: "कृपया चारे की इन्वेंटरी जांचें" },
    { en: "The batch is ready for sale", hi: "बैच बिक्री के लिए तैयार है" },
    { en: "Monitor the bird health daily", hi: "पक्षियों के स्वास्थ्य की दैनिक निगरानी करें" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <Globe className="h-10 w-10 text-blue-600" />
          Google Translate Demo
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Test Google Translate API integration for Hindi-English translation without API key requirements.
          This demo will be used as the foundation for implementing translations across all pages.
        </p>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isServiceHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
            Service Status
          </CardTitle>
          <CardDescription>
            Current status of Google Translate service endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceStatus.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-gray-600 truncate">{service.baseURL}</p>
                </div>
                <Badge variant={service.available ? "default" : "destructive"}>
                  {service.available ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  {service.available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button onClick={checkServiceHealth} variant="outline" size="sm">
              Refresh Status
            </Button>
            <Button 
              onClick={() => googleTranslateService.clearCache()} 
              variant="outline" 
              size="sm"
            >
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Translation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="source-lang" className="text-sm">From:</Label>
              <Select value={sourceLanguage} onValueChange={(value) => setSourceLanguage(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSwapLanguages}
                disabled={sourceLanguage === 'auto'}
                className="p-1"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
              
              <Label htmlFor="target-lang" className="text-sm">To:</Label>
              <Select value={targetLanguage} onValueChange={(value) => setTargetLanguage(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to translate..."
              className="min-h-32 mb-4"
              maxLength={5000}
            />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {inputText.length}/5000 characters
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating || !inputText.trim()}
                  className="min-w-24"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    'Translate'
                  )}
                </Button>
                <Button onClick={handleClearAll} variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Translation Result</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={translatedText}
              readOnly
              placeholder="Translation will appear here..."
              className="min-h-32 mb-4 bg-gray-50"
            />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {translatedText.length} characters
              </span>
              <Button
                onClick={() => copyToClipboard(translatedText)}
                disabled={!translatedText}
                variant="outline"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Examples</CardTitle>
          <CardDescription>
            Try these common poultry farming phrases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {predefinedExamples.map((example, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">EN:</span> {example.en}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">HI:</span> {example.hi}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setInputText(example.en);
                        setSourceLanguage('en');
                        setTargetLanguage('hi');
                      }}
                    >
                      Try EN→HI
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setInputText(example.hi);
                        setSourceLanguage('hi');
                        setTargetLanguage('en');
                      }}
                    >
                      Try HI→EN
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Translation History */}
      {translationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Translation History</CardTitle>
            <CardDescription>
              Recent translations (last 10)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {translationHistory.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Original ({item.sourceLanguage}):</p>
                      <p className="font-medium">{item.original}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Translated ({item.targetLanguage}):</p>
                      <p className="font-medium">{item.translated}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.service}</Badge>
                      <span className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(item.translated)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Implementation Notes */}
      <Alert>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          <strong>Implementation Status:</strong> This demo shows Google Translate working without an API key using unofficial endpoints. 
          The service includes fallback to a local dictionary for common poultry terms when external APIs are unavailable. 
          Once tested and approved, this will replace the LibreTranslate service across all pages in your application.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default GoogleTranslateDemo;
