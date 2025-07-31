import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { validateInvitationCode, connectFarmerToDealer } from "@/services/connectionService";
import { CheckCircle, AlertCircle, UserPlus, Bird } from "lucide-react";

export default function FarmerConnect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // Get invite code from URL params or hash (for fallback compatibility)
  const getInviteCode = () => {
    const fromParams = searchParams.get('invite');
    if (fromParams) return fromParams;
    
    // Fallback: check if invite code is in the hash or search string
    const search = location.search || window.location.search;
    const match = search.match(/[?&]invite=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  };
  
  const [inviteCode, setInviteCode] = useState(getInviteCode());
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [dealerData, setDealerData] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Debug logging for production troubleshooting
  useEffect(() => {
    console.log('FarmerConnect Debug:', {
      currentUrl: window.location.href,
      searchString: window.location.search,
      hashString: window.location.hash,
      inviteCode,
      pathname: location.pathname,
      search: location.search
    });
  }, [location, inviteCode]);

  // Validate invitation code on component mount
  useEffect(() => {
    if (inviteCode) {
      validateInvitation();
    }
  }, [inviteCode]);

  // Auto-connect if user is already logged in and invitation is valid
  useEffect(() => {
    if (currentUser && isValid && dealerData && !isConnecting) {
      handleAutoConnect();
    }
  }, [currentUser, isValid, dealerData]);

  const validateInvitation = async () => {
    setIsValidating(true);
    try {
      const result = await validateInvitationCode(inviteCode);
      setIsValid(result.valid);
      if (result.valid && result.data) {
        setDealerData(result.data);
      }
    } catch (error) {
      setIsValid(false);
      toast({
        title: "Error",
        description: "Failed to validate invitation code.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleAutoConnect = async () => {
    if (!currentUser || !dealerData) return;
    
    setIsConnecting(true);
    try {
      await connectFarmerToDealer(
        currentUser.uid,
        currentUser.displayName || currentUser.email?.split('@')[0] || 'Farmer',
        currentUser.email || '',
        dealerData.dealerId,
        dealerData.dealerName,
        dealerData.dealerEmail,
        inviteCode
      );
      
      toast({
        title: "Success!",
        description: "You have been successfully connected to the dealer network.",
      });
      
      // Clear the invitation code from URL and redirect to farmer dashboard
      navigate('/farmer', { replace: true });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to dealer network. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLoginRedirect = () => {
    // Store invitation code in localStorage to persist through login
    localStorage.setItem('pendingInvitation', inviteCode);
    navigate(`/farmer-login?invite=${inviteCode}`);
  };

  const handleRegisterRedirect = () => {
    // Store invitation code in localStorage to persist through registration
    localStorage.setItem('pendingInvitation', inviteCode);
    navigate(`/register?invite=${inviteCode}&type=farmer`);
  };

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

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Validating invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isValid === false) {
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
            </div>
          </div>
        </header>
        
        <div className="flex items-center justify-center py-16">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                This invitation link is invalid or has expired. Please contact your dealer for a new invitation.
              </p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                  Go Home
                </Button>
                <Button onClick={() => navigate('/register')} className="w-full">
                  Create New Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isValid === true) {
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
            </div>
          </div>
        </header>
        
        <div className="py-8">
          <div className="max-w-md mx-auto px-4">
            <Card>
              <CardHeader className="text-center">
                <UserPlus className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <CardTitle className="text-2xl">Join Dealer Network</CardTitle>
                <p className="text-gray-600">
                  You've been invited to join a poultry dealer network
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Valid Invitation</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    You're about to join a verified poultry dealer network.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-center text-gray-600">
                    To complete the connection, please log in to your farmer account or create a new one.
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
                  
                  <div className="text-xs text-center text-gray-500">
                    After logging in or registering, you'll be automatically connected to the dealer network.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Default state - no invitation code
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
          </div>
        </div>
      </header>
      
      <div className="flex items-center justify-center py-16">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>Farmer Connection</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You need a valid invitation link to connect to a dealer network.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Go Home
              </Button>
              <Button onClick={() => navigate('/register')} className="w-full">
                Create New Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
