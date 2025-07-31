import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, 
  MessageCircle,
  Building2, 
  Mail,
  AlertCircle
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
  const [connectedDealers, setConnectedDealers] = useState<FarmerDealerData[]>([]);
  const [dealerProducts, setDealerProducts] = useState<DealerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    console.log('🔍 FarmerFeedView: Loading data for user:', userId);

    // Subscribe to connected dealers
    const unsubscribeDealers = subscribeToConnectedDealers(
      userId,
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
      userId,
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
  }, []);

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading feed prices...</p>
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
            <h3 className="text-lg font-semibold mb-2">No Connected Dealers</h3>
            <p className="text-gray-600 mb-4">
              You need to connect with dealers to view feed prices and place orders.
            </p>
            <Button>Connect with Dealers</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group products by dealer
  const groupedProducts = dealerProducts.reduce((acc, product) => {
    const dealer = connectedDealers.find(d => d.dealerId === product.dealerId);
    if (!dealer) return acc;
    
    if (!acc[product.dealerId]) {
      acc[product.dealerId] = {
        dealer,
        products: []
      };
    }
    acc[product.dealerId].products.push(product);
    return acc;
  }, {} as Record<string, { dealer: FarmerDealerData; products: DealerProduct[] }>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Feed Prices & Dealers</h1>
        <p className="text-muted-foreground">
          View current feed prices from your connected dealers. Call directly to place orders.
        </p>
      </div>

      {/* Debug Info */}
      <div className="bg-blue-50 p-4 rounded-lg text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>Connected Dealers: {connectedDealers.length}</p>
        <p>Available Products: {dealerProducts.length}</p>
        {connectedDealers.map(dealer => (
          <p key={dealer.dealerId}>- {dealer.dealerName} ({dealer.dealerEmail})</p>
        ))}
      </div>

      {/* Show message if no products available */}
      {dealerProducts.length === 0 && connectedDealers.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your connected dealers haven't added any products yet. Contact them directly to inquire about available feed.
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
                  <h2 className="text-xl">{dealer.dealerName || 'Dealer'}</h2>
                  <p className="text-sm text-gray-600">Dealer</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleCallDealer('+91 98765 43210')}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </Button>
                <Button 
                  onClick={() => handleWhatsAppDealer('+91 98765 43210', dealer.dealerName || 'Dealer')}
                  variant="outline"
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </CardTitle>
            
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Call for orders</p>
                  <p className="text-sm text-gray-600">+91 98765 43210</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">WhatsApp orders</p>
                  <p className="text-sm text-gray-600">+91 98765 43210</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Email inquiries</p>
                  <p className="text-sm text-gray-600">{dealer.dealerEmail}</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Feed Types & Prices</h3>
              
              {products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No products available from this dealer</p>
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
                              Available
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <strong>{product.supplier}</strong>
                          </p>
                          <p className="text-sm text-gray-600">
                            Stock: {product.currentStock} {product.unit}
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-lg font-bold text-green-600">
                                ₹{product.pricePerUnit}
                              </p>
                              <p className="text-xs text-gray-500">per {product.unit}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              onClick={() => handleCallDealer('+91 98765 43210')}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              Call to Order
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleWhatsAppDealer('+91 98765 43210', dealer.dealerName || 'Dealer')}
                              className="flex-1"
                            >
                              WhatsApp Quote
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
                  <h2 className="text-xl">{dealer.dealerName || 'Dealer'}</h2>
                  <p className="text-sm text-gray-600">Dealer</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleCallDealer('+91 98765 43210')}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </Button>
                <Button 
                  onClick={() => handleWhatsAppDealer('+91 98765 43210', dealer.dealerName || 'Dealer')}
                  variant="outline"
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>No products available from this dealer yet</p>
              <p className="text-sm">Contact them directly to inquire about feed availability</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
