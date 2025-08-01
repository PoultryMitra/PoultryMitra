import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { validateInvitationCode, connectFarmerToDealer } from "@/services/connectionService";
import { CheckCircle, AlertCircle, UserPlus, Bird, Users, Key } from "lucide-react";

export default function FarmerConnect() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // Simple state management for dealer code connection
  const [dealerCode, setDealerCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [dealerData, setDealerData] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  // Debug logging on component mount
  useEffect(() => {
    console.log('🔄 FarmerConnect Component Mounted');
    console.log('📊 Initial State:', {
      currentUser: currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName
      } : null,
      url: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    // Check for code in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    
    if (codeFromUrl) {
      console.log('🔗 Found dealer code in URL parameters:', codeFromUrl);
      setDealerCode(codeFromUrl);
      // Auto-validate code from URL
      setTimeout(() => {
        console.log('🔍 Auto-validating code from URL');
        validateDealerCode(codeFromUrl);
      }, 500);
      return;
    }
    
    // If no URL code, check localStorage
    const pendingCode = localStorage.getItem('pendingDealerCode');
    if (pendingCode) {
      console.log('💾 Found pending dealer code in localStorage:', pendingCode);
      setDealerCode(pendingCode);
      // Auto-validate if we have a pending code
      setTimeout(() => {
        console.log('🔍 Auto-validating pending dealer code');
        validateDealerCode(pendingCode);
      }, 500);
    }

    // Health check - log critical services
    console.log('🏥 Health Check:', {
      authContext: !!useAuth,
      toastHook: !!useToast,
      navigation: !!navigate,
      localStorage: typeof localStorage !== 'undefined',
      connectionService: !!(validateInvitationCode && connectFarmerToDealer),
      currentUser: currentUser ? 'Authenticated' : 'Not authenticated',
      firebaseErrors: 'Check console for Firebase auth errors'
    });

    // Check for common Firebase issues
    if (!currentUser) {
      console.log('ℹ️ User not authenticated - Firebase auth may need attention');
      console.log('💡 Common fixes:');
      console.log('1. Check Firebase configuration in firebase.ts');
      console.log('2. Verify API keys are correct');
      console.log('3. Check if Firebase project is properly configured');
      console.log('4. Use Login/Register buttons to authenticate');
    }
  }, []);

  // Auto-connect if user is already logged in and dealer is validated
  useEffect(() => {
    console.log('🎯 Auto-connect check:', {
      hasCurrentUser: !!currentUser,
      isValid,
      hasDealerData: !!dealerData,
      isConnecting,
      dealerCode
    });
    
    if (currentUser && isValid && dealerData && !isConnecting) {
      console.log('✅ Conditions met for auto-connect, initiating...');
      handleAutoConnect();
    }
  }, [currentUser, isValid, dealerData]);

  const validateDealerCode = async (codeToValidate?: string) => {
    const code = codeToValidate || dealerCode;
    
    console.log('🔍 Starting dealer code validation:', {
      code,
      codeLength: code?.length,
      trimmedCode: code?.trim(),
      timestamp: new Date().toISOString()
    });

    if (!code?.trim()) {
      const errorMsg = 'Please enter a dealer code';
      console.error('❌ Validation failed: Empty dealer code');
      setError(errorMsg);
      return;
    }

    setIsValidating(true);
    setError('');
    
    try {
      console.log('📡 Calling validateInvitationCode service with:', {
        code: code.trim(),
        serviceExists: !!validateInvitationCode
      });

      // Use the dealer code directly as the invitation code
      const result = await validateInvitationCode(code.trim());
      
      console.log('📥 Service response:', {
        result,
        valid: result?.valid,
        hasData: !!result?.data,
        dataKeys: result?.data ? Object.keys(result.data) : []
      });

      setIsValid(result.valid);
      
      // Show dealer data even for expired/used invitations for display purposes
      if (result.data) {
        setDealerData(result.data);
        console.log('✅ Dealer data found:', {
          dealerName: result.data.dealerName,
          dealerId: result.data.dealerId,
          dealerEmail: result.data.dealerEmail,
          isExpiredOrUsed: result.data.isExpiredOrUsed
        });
        
        if (result.valid) {
          toast({
            title: "Success!",
            description: "Dealer found! Ready to connect.",
          });
        } else if (result.data.isExpiredOrUsed) {
          toast({
            title: "Code Already Used",
            description: `This invitation code has already been used${result.data.usedAt ? ' on ' + new Date(result.data.usedAt.toDate()).toLocaleDateString() : ''}.`,
            variant: "destructive",
          });
          setError(`This invitation code has already been used. The dealer "${result.data.dealerName}" is shown for reference.`);
        } else {
          toast({
            title: "Code Expired",
            description: "This invitation code has expired. Please request a new one from your dealer.",
            variant: "destructive",
          });
          setError(`This invitation code has expired. The dealer "${result.data.dealerName}" is shown for reference.`);
        }

        // Clear pending code from localStorage since we found the dealer
        localStorage.removeItem('pendingDealerCode');
      } else {
        const errorMsg = 'Invalid dealer code. Please check and try again.';
        console.warn('⚠️ Dealer code invalid:', { code: code.trim(), result });
        setError(errorMsg);
      }
    } catch (error) {
      console.error('💥 Dealer validation error:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        code: code.trim()
      });

      setIsValid(false);
      const errorMsg = 'Failed to validate dealer code. Please try again.';
      setError(errorMsg);
      
      toast({
        title: "Error",
        description: "Failed to validate dealer code.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
      console.log('🏁 Dealer validation completed');
    }
  };

  const handleAutoConnect = async () => {
    console.log('🔗 Starting auto-connect process:', {
      hasCurrentUser: !!currentUser,
      hasDealerData: !!dealerData,
      dealerCode,
      isValid,
      isExpiredOrUsed: dealerData?.isExpiredOrUsed,
      timestamp: new Date().toISOString()
    });

    if (!currentUser || !dealerData) {
      console.warn('⚠️ Auto-connect aborted: Missing required data:', {
        currentUser: !!currentUser,
        dealerData: !!dealerData
      });
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Check if connection already exists
      const alreadyConnected = await checkExistingConnection(currentUser.uid, dealerData.dealerId);
      
      if (alreadyConnected) {
        console.log('⚠️ Connection already exists, redirecting to dashboard');
        toast({
          title: "Already Connected",
          description: "You're already connected to this dealer. Redirecting to dashboard.",
        });
        
        // Clear any pending data
        localStorage.removeItem('pendingDealerCode');
        
        // Redirect to farmer dashboard
        navigate('/farmer', { replace: true });
        return;
      }
      
      // If invitation is expired/used, don't create new connection
      if (dealerData.isExpiredOrUsed) {
        console.log('⚠️ Cannot connect: Invitation is expired or already used');
        toast({
          title: "Cannot Connect",
          description: "This invitation code has expired or been used. Please request a new code from your dealer.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('📡 Calling connectFarmerToDealer service:', {
        farmerId: currentUser.uid,
        farmerName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Farmer',
        farmerEmail: currentUser.email || '',
        dealerId: dealerData.dealerId,
        dealerName: dealerData.dealerName,
        dealerEmail: dealerData.dealerEmail,
        dealerCode
      });

      await connectFarmerToDealer(
        currentUser.uid,
        currentUser.displayName || currentUser.email?.split('@')[0] || 'Farmer',
        currentUser.email || '',
        dealerData.dealerId,
        dealerData.dealerName,
        dealerData.dealerEmail,
        dealerCode
      );
      
      console.log('✅ Farmer-Dealer connection successful');
      
      toast({
        title: "Success!",
        description: "You have been successfully connected to the dealer network.",
      });
      
      // Clear any pending data
      localStorage.removeItem('pendingDealerCode');
      
      console.log('🏠 Redirecting to farmer dashboard');
      // Redirect to farmer dashboard
      navigate('/farmer', { replace: true });
    } catch (error) {
      console.error('💥 Auto-connect error:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        currentUser: currentUser ? {
          uid: currentUser.uid,
          email: currentUser.email
        } : null,
        dealerData
      });

      toast({
        title: "Error",
        description: "Failed to connect to dealer network. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
      console.log('🏁 Auto-connect process completed');
    }
  };
  
  // Check if the connection already exists
  const checkExistingConnection = async (farmerId: string, dealerId: string): Promise<boolean> => {
    try {
      console.log('🔍 Checking for existing connection:', { farmerId, dealerId });
      
      // Import necessary functions from connectionService
      const { checkConnectionExists } = await import('@/services/connectionService');
      
      if (!checkConnectionExists) {
        console.warn('⚠️ checkConnectionExists function not found, assuming no connection');
        return false;
      }
      
      const exists = await checkConnectionExists(farmerId, dealerId);
      console.log('🔍 Connection check result:', { exists });
      return exists;
    } catch (error) {
      console.error('💥 Error checking connection:', error);
      return false;
    }
  };

  const handleLoginRedirect = () => {
    console.log('🔐 Redirecting to login:', {
      dealerCode,
      willStorePending: !!dealerCode
    });
    
    // Store dealer code in localStorage to persist through login
    if (dealerCode) {
      localStorage.setItem('pendingDealerCode', dealerCode);
      console.log('💾 Stored pending dealer code for login');
    }
    
    navigate('/farmer-login');
  };

  const handleRegisterRedirect = () => {
    console.log('📝 Redirecting to registration:', {
      dealerCode,
      willStorePending: !!dealerCode
    });
    
    // Store dealer code in localStorage to persist through registration
    if (dealerCode) {
      localStorage.setItem('pendingDealerCode', dealerCode);
      console.log('💾 Stored pending dealer code for registration');
    }
    
    navigate('/register?type=farmer');
  };

  // Recovery mechanism for blank page issues
  const handleRecovery = () => {
    console.log('🚨 Recovery mode activated');
    
    // Clear all states
    setDealerCode('');
    setIsValid(null);
    setDealerData(null);
    setError('');
    localStorage.removeItem('pendingDealerCode');
    
    // Force page refresh as last resort
    setTimeout(() => {
      console.log('🔄 Performing recovery refresh');
      window.location.reload();
    }, 100);
  };

  // Debug helper - expose functions to window for manual testing
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).farmerConnectDebug = {
        validateDealerCode,
        handleAutoConnect,
        handleRecovery,
        currentState: {
          dealerCode,
          isValidating,
          isValid,
          dealerData,
          isConnecting,
          error,
          currentUser: currentUser ? {
            uid: currentUser.uid,
            email: currentUser.email
          } : null
        }
      };
      console.log('🛠️ Debug functions available at window.farmerConnectDebug');
    }
  }, [dealerCode, isValidating, isValid, dealerData, isConnecting, error, currentUser]);

  // If user is already logged in and connecting
  if (currentUser && isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Connecting you to the dealer network...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main interface - simple dealer code input
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <Bird className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-green-600">Poultry Mitra</h1>
            </div>
            <Button onClick={() => navigate('/')} variant="outline">
              Go Home
            </Button>
            
            {/* Quick Login Access */}
            {!currentUser && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  size="sm"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  variant="ghost"
                  size="sm"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="py-8">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-2xl">Connect to Dealer</CardTitle>
              <p className="text-gray-600">
                Enter your dealer's code to join their network
              </p>
              
              {/* Login Option for existing users */}
              {!currentUser && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">Already have an account?</p>
                  <div className="space-x-2">
                    <Button 
                      onClick={() => navigate('/farmer-login')}
                      variant="outline"
                      size="sm"
                    >
                      Login as Farmer
                    </Button>
                    <Button 
                      onClick={() => navigate('/dealer-login')}
                      variant="outline"
                      size="sm"
                    >
                      Login as Dealer
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dealer Code Input */}
              <div className="space-y-2">
                <Label htmlFor="dealerCode">Dealer Code</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="dealerCode"
                    type="text"
                    placeholder="Enter dealer code (e.g., DEAL123)"
                    value={dealerCode}
                    onChange={(e) => setDealerCode(e.target.value.toUpperCase())}
                    className="pl-10"
                    disabled={isValidating}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>

              {/* Validate Button */}
              <Button 
                onClick={() => validateDealerCode()}
                className="w-full"
                disabled={!dealerCode.trim() || isValidating}
              >
                {isValidating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Validating...
                  </>
                ) : (
                  'Find Dealer'
                )}
              </Button>

              {/* Success State - Dealer Found */}
              {isValid && dealerData && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Dealer Found!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Ready to connect to: <strong>{dealerData.dealerName}</strong>
                    </p>
                  </div>

                  {!currentUser ? (
                    <div className="space-y-4">
                      <p className="text-center text-gray-600">
                        To complete the connection, please log in or create an account.
                      </p>
                      
                      <div className="space-y-3">
                        <Button 
                          onClick={handleLoginRedirect}
                          className="w-full"
                          size="lg"
                        >
                          Login to Existing Account
                        </Button>
                        
                        <Button 
                          onClick={handleRegisterRedirect}
                          variant="outline"
                          className="w-full"
                          size="lg"
                        >
                          Create New Farmer Account
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleAutoConnect}
                      className="w-full"
                      size="lg"
                      disabled={isConnecting}
                    >
                      {isConnecting ? 'Connecting...' : 'Connect Now'}
                    </Button>
                  )}
                </div>
              )}

              {/* Failed State */}
              {isValid === false && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-800">Code Not Found</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Please check the dealer code and try again.
                  </p>
                </div>
              )}

              {/* Help Text - Enhanced */}
              <div className="text-sm space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🔍 Where to get a Dealer Code?</h4>
                  <div className="text-blue-700 space-y-1 text-sm">
                    <p>• <strong>From your dealer:</strong> Contact your local poultry dealer directly</p>
                    <p>• <strong>WhatsApp/SMS:</strong> Dealers often share codes via messaging</p>
                    <p>• <strong>Business cards:</strong> Many dealers print codes on their cards</p>
                    <p>• <strong>Feed suppliers:</strong> Ask at poultry feed and medicine shops</p>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">🧪 Test Codes (Demo Only)</h4>
                  <div className="text-green-700 space-y-1 text-sm">
                    <p>Try these demo codes for testing:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button 
                        onClick={() => setDealerCode('DEAL123')}
                        className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs hover:bg-green-300"
                      >
                        DEAL123
                      </button>
                      <button 
                        onClick={() => setDealerCode('TEST456')}
                        className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs hover:bg-green-300"
                      >
                        TEST456
                      </button>
                      <button 
                        onClick={() => setDealerCode('DEMO789')}
                        className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs hover:bg-green-300"
                      >
                        DEMO789
                      </button>
                    </div>
                    <p className="text-xs mt-2 text-green-600">
                      💡 Real codes look like: <code className="bg-green-100 px-1 rounded">DEALXYZ123ABC</code>
                    </p>
                  </div>
                </div>

                <div className="text-xs text-center text-gray-500">
                  <p>Need help? Contact support or visit our help center</p>
                </div>
              </div>

              {/* Debug Panel - Development Only */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">🛠️ Debug Panel</h4>
                  <div className="text-xs space-y-1 text-gray-600">
                    <p><strong>Current User:</strong> {currentUser ? currentUser.email : 'Not logged in'}</p>
                    <p><strong>Dealer Code:</strong> {dealerCode || 'None'}</p>
                    <p><strong>Validation State:</strong> {isValid === null ? 'Not tested' : isValid ? 'Valid' : 'Invalid'}</p>
                    <p><strong>Is Validating:</strong> {isValidating ? 'Yes' : 'No'}</p>
                    <p><strong>Is Connecting:</strong> {isConnecting ? 'Yes' : 'No'}</p>
                    <p><strong>Dealer Data:</strong> {dealerData ? `Found: ${dealerData.dealerName}` : 'None'}</p>
                    <p><strong>Error:</strong> {error || 'None'}</p>
                    <p><strong>Pending Code in Storage:</strong> {localStorage.getItem('pendingDealerCode') || 'None'}</p>
                  </div>
                  
                  <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
                    <p className="font-semibold text-yellow-800">🚨 Common Issues & Fixes:</p>
                    <div className="text-yellow-700 mt-1 space-y-1">
                      <p>• <strong>404 favicon:</strong> Normal, can be ignored</p>
                      <p>• <strong>Firebase 400 error:</strong> Check Firebase config</p>
                      <p>• <strong>No login option:</strong> Use buttons above or header</p>
                      <p>• <strong>Blank page:</strong> Try refresh or recovery reset</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleRecovery}
                      className="text-xs"
                    >
                      Recovery Reset
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => console.log('Current state:', { dealerCode, isValid, dealerData, error })}
                      className="text-xs"
                    >
                      Log State
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate('/login')}
                      className="text-xs"
                    >
                      Go to Login
                    </Button>
                  </div>
                </div>
              )}

              {/* Recovery Options - Always visible for production issues */}
              <div className="mt-4 text-center">
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                    Having issues? Click for recovery options
                  </summary>
                  <div className="mt-2 space-y-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800">If the page appears blank or unresponsive:</p>
                    <div className="space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => window.location.reload()}
                        className="text-xs"
                      >
                        Refresh Page
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => navigate('/', { replace: true })}
                        className="text-xs"
                      >
                        Go Home
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleRecovery}
                        className="text-xs"
                      >
                        Reset All
                      </Button>
                    </div>
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
