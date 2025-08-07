import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedTranslation } from '@/contexts/EnhancedTranslationContext';
import { 
  Phone, 
  MessageCircle,
  Building2, 
  Mail,
  AlertCircle,
  Package
} from 'lucide-react';
import { 
  subscribeToConnectedDealers, 
  subscribeToConnectedDealerProducts,
  type FarmerDealerData,
  type DealerProduct
} from '@/services/farmerService';

interface Product {
  id: string;
  productName: string;
  pricePerUnit: number;
  unit: string;
  currentStock: number;
  supplier: string;
  dealerId: string;
}

export default function FarmerFeedView() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const [connectedDealers, setConnectedDealers] = useState<FarmerDealerData[]>([]);
  const [dealerProducts, setDealerProducts] = useState<DealerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Translation setup
  const { t, language } = useEnhancedTranslation();

  // Enhanced translation helper that prioritizes Google Translate
  const bt = (key: string): string => {
    // First try Enhanced Translation Context (Google Translate)
    const dynamicTranslation = t(key);
    if (dynamicTranslation && dynamicTranslation !== key) {
      console.log(`🌍 Google Translate used for FarmerFeedView: ${key} -> ${dynamicTranslation}`);
      return dynamicTranslation;
    }

    // Fallback to local content - fix the nested structure lookup
    const localContent = content[key as keyof typeof content];
    if (localContent && typeof localContent === 'object') {
      const translatedValue = localContent[language as keyof typeof localContent];
      if (translatedValue) {
        console.log(`📚 Static content used for FarmerFeedView: ${key} -> ${translatedValue}`);
        return translatedValue as string;
      }
    }
    
    const result = key;
    console.log(`⚠️ No translation found for FarmerFeedView: ${key}`);
    return result;
  };

  // Content object for translations
  const content = {
    // Page header
    pageTitle: { en: "Feed Prices & Dealers", hi: "फीड मूल्य और डीलर" },
    pageSubtitle: { en: "View current feed prices from your connected dealers. Call directly to place orders.", hi: "अपने जुड़े डीलर से वर्तमान फीड मूल्य देखें। ऑर्डर देने के लिए सीधे कॉल करें।" },
    
    // Loading and status messages
    authenticating: { en: "Authenticating...", hi: "प्रमाणीकरण..." },
    loadingFeedPrices: { en: "Loading feed prices...", hi: "फीड मूल्य लोड कर रहे हैं..." },
    
    // Debug info
    debugInfo: { en: "Debug Info:", hi: "डिबग जानकारी:" },
    connectedDealers: { en: "Connected Dealers:", hi: "जुड़े डीलर:" },
    availableProducts: { en: "Available Products:", hi: "उपलब्ध उत्पाद:" },
    
    // No dealers section
    noConnectedDealers: { en: "No Connected Dealers", hi: "कोई जुड़े डीलर नहीं" },
    connectDealersMessage: { en: "You need to connect with dealers to view feed prices and place orders.", hi: "फीड मूल्य देखने और ऑर्डर देने के लिए आपको डीलर से जुड़ना होगा।" },
    connectWithDealers: { en: "Connect with Dealers", hi: "डीलर से जुड़ें" },
    
    // Products not available message
    noProductsMessage: { en: "Your connected dealers haven't added any products yet. Contact them directly to inquire about available feed.", hi: "आपके जुड़े डीलर ने अभी तक कोई उत्पाद नहीं जोड़े हैं। उपलब्ध फीड के बारे में पूछताछ के लिए सीधे उनसे संपर्क करें।" },
    
    // Dealer section
    dealer: { en: "Dealer", hi: "डीलर" },
    callNow: { en: "Call Now", hi: "अभी कॉल करें" },
    whatsapp: { en: "WhatsApp", hi: "व्हाट्सऐप" },
    
    // Contact info
    callForOrders: { en: "Call for orders", hi: "ऑर्डर के लिए कॉल करें" },
    whatsappOrders: { en: "WhatsApp orders", hi: "व्हाट्सऐप ऑर्डर" },
    emailInquiries: { en: "Email inquiries", hi: "ईमेल पूछताछ" },
    phoneNotAvailable: { en: "Phone not available", hi: "फोन उपलब्ध नहीं" },
    
    // Products section
    availableFeedTypes: { en: "Available Feed Types & Prices", hi: "उपलब्ध फीड प्रकार और मूल्य" },
    noProductsFromDealer: { en: "No products available from this dealer yet", hi: "इस डीलर से अभी तक कोई उत्पाद उपलब्ध नहीं" },
    contactDirectly: { en: "Contact them directly to inquire about feed availability", hi: "फीड उपलब्धता के बारे में पूछताछ के लिए सीधे उनसे संपर्क करें" },
    
    // Product card
    available: { en: "Available", hi: "उपलब्ध" },
    stock: { en: "Stock:", hi: "स्टॉक:" },
    per: { en: "per", hi: "प्रति" },
    callToOrder: { en: "Call to Order", hi: "ऑर्डर के लिए कॉल करें" },
    whatsappQuote: { en: "WhatsApp Quote", hi: "व्हाट्सऐप कोट" }
  };

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) {
      return;
    }

    // Check if user is authenticated
    if (!currentUser?.uid) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    console.log('🔍 FarmerFeedView: Loading data for user:', currentUser.uid);

    // Subscribe to connected dealers
    const unsubscribeDealers = subscribeToConnectedDealers(
      currentUser.uid,
      (dealers) => {
        console.log('✅ Connected dealers loaded:', dealers);
        setConnectedDealers(dealers);
      },
      (error) => {
        console.error('❌ Error loading dealers:', error);
        setError(`Failed to load connected dealers: ${error.message}`);
      }
    );

    // Subscribe to dealer products
    const unsubscribeProducts = subscribeToConnectedDealerProducts(
      currentUser.uid,
      (products) => {
        console.log('✅ Dealer products loaded:', products);
        setDealerProducts(products);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error loading products:', error);
        setError(`Failed to load dealer products: ${error.message}`);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeDealers();
      unsubscribeProducts();
    };
  }, [currentUser?.uid, authLoading]);

  const handleCallDealer = (phoneNumber: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const handleWhatsAppDealer = (phoneNumber: string, dealerName: string) => {
    if (phoneNumber) {
      const message = encodeURIComponent(`Hi ${dealerName}, I would like to inquire about your feed prices and availability.`);
      window.open(`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>{authLoading ? bt('authenticating') : bt('loadingFeedPrices')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (connectedDealers.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">{bt('noConnectedDealers')}</h3>
            <p className="text-gray-600 mb-4">
              {bt('connectDealersMessage')}
            </p>
            <Button>{bt('connectWithDealers')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group products by dealer, ensuring ALL connected dealers are shown
  const groupedProducts = connectedDealers.reduce((acc, dealer) => {
    acc[dealer.dealerId] = {
      dealer,
      products: dealerProducts.filter(product => product.dealerId === dealer.dealerId)
    };
    return acc;
  }, {} as Record<string, { dealer: FarmerDealerData; products: DealerProduct[] }>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{bt('pageTitle')}</h1>
        <p className="text-muted-foreground">
          {bt('pageSubtitle')}
        </p>
      </div>

      {/* Debug Info */}
      <div className="bg-blue-50 p-4 rounded-lg text-sm">
        <p><strong>{bt('debugInfo')}</strong></p>
        <p>{bt('connectedDealers')} {connectedDealers.length}</p>
        <p>{bt('availableProducts')} {dealerProducts.length}</p>
        {connectedDealers.map(dealer => (
          <p key={dealer.dealerId}>- {dealer.dealerName} ({dealer.dealerEmail})</p>
        ))}
      </div>

      {/* Show message if no products available */}
      {dealerProducts.length === 0 && connectedDealers.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {bt('noProductsMessage')}
          </AlertDescription>
        </Alert>
      )}

      {/* Dealers and their products */}
      {Object.values(groupedProducts).map(({ dealer, products }) => (
        <Card key={dealer.dealerId} className="space-y-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl">{dealer.dealerCompany || dealer.dealerName || bt('dealer')}</h2>
                  <p className="text-sm text-gray-600">{bt('dealer')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleCallDealer(dealer.dealerPhone || '')}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  disabled={!dealer.dealerPhone}
                >
                  <Phone className="h-4 w-4" />
                  {bt('callNow')}
                </Button>
                <Button 
                  onClick={() => handleWhatsAppDealer(dealer.dealerPhone || '', dealer.dealerCompany || dealer.dealerName || bt('dealer'))}
                  variant="outline"
                  className="gap-2"
                  disabled={!dealer.dealerPhone}
                >
                  <MessageCircle className="h-4 w-4" />
                  {bt('whatsapp')}
                </Button>
              </div>
            </CardTitle>
            
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{bt('callForOrders')}</p>
                  <p className="text-sm text-gray-600">
                    {dealer.dealerPhone || bt('phoneNotAvailable')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{bt('whatsappOrders')}</p>
                  <p className="text-sm text-gray-600">
                    {dealer.dealerPhone || bt('phoneNotAvailable')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{bt('emailInquiries')}</p>
                  <p className="text-sm text-gray-600">{dealer.dealerEmail}</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{bt('availableFeedTypes')}</h3>
              
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">{bt('noProductsFromDealer')}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {bt('contactDirectly')}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={() => handleCallDealer(dealer.dealerPhone || '')}
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                      disabled={!dealer.dealerPhone}
                    >
                      <Phone className="h-4 w-4" />
                      {bt('callNow')}
                    </Button>
                    <Button 
                      onClick={() => handleWhatsAppDealer(dealer.dealerPhone || '', dealer.dealerCompany || dealer.dealerName || bt('dealer'))}
                      variant="outline"
                      className="gap-2"
                      disabled={!dealer.dealerPhone}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {bt('whatsapp')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{product.productName}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {bt('available')}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <strong>{product.supplier}</strong>
                          </p>
                          <p className="text-sm text-gray-600">
                            {bt('stock')} {product.currentStock} {product.unit}
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-lg font-bold text-green-600">
                                ₹{product.pricePerUnit}
                              </p>
                              <p className="text-xs text-gray-500">{bt('per')} {product.unit}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              onClick={() => handleCallDealer(dealer.dealerPhone || '')}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              disabled={!dealer.dealerPhone}
                            >
                              {bt('callToOrder')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleWhatsAppDealer(dealer.dealerPhone || '', dealer.dealerCompany || dealer.dealerName || bt('dealer'))}
                              className="flex-1"
                              disabled={!dealer.dealerPhone}
                            >
                              {bt('whatsappQuote')}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Show connected dealers without products */}
      {connectedDealers.filter(dealer => !groupedProducts[dealer.dealerId]).map((dealer) => (
        <Card key={dealer.dealerId}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-gray-400" />
                <div>
                  <h2 className="text-xl">{dealer.dealerCompany || dealer.dealerName || bt('dealer')}</h2>
                  <p className="text-sm text-gray-600">{bt('dealer')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleCallDealer(dealer.dealerPhone || '')}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  disabled={!dealer.dealerPhone}
                >
                  <Phone className="h-4 w-4" />
                  {bt('callNow')}
                </Button>
                <Button 
                  onClick={() => handleWhatsAppDealer(dealer.dealerPhone || '', dealer.dealerCompany || dealer.dealerName || bt('dealer'))}
                  variant="outline"
                  className="gap-2"
                  disabled={!dealer.dealerPhone}
                >
                  <MessageCircle className="h-4 w-4" />
                  {bt('whatsapp')}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>{bt('noProductsFromDealer')}</p>
              <p className="text-sm">{bt('contactDirectly')}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
