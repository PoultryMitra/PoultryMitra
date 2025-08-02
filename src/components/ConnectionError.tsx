import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, RefreshCw, Globe } from 'lucide-react';

interface ConnectionErrorProps {
  onRetry?: () => void;
}

const ConnectionError: React.FC<ConnectionErrorProps> = ({ onRetry }) => {
  const handleRetry = () => {
    // Clear any cached data that might be causing issues
    localStorage.clear();
    sessionStorage.clear();
    
    if (onRetry) {
      onRetry();
    } else {
      // Force page reload
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <CardTitle className="text-xl text-gray-900">Connection Issues Detected</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-3">
            <p className="text-center">
              We're having trouble connecting to our services. This is usually caused by:
            </p>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Ad Blockers</p>
                  <p className="text-xs text-blue-600">Disable ad blockers for this website</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Browser Settings</p>
                  <p className="text-xs text-green-600">Check privacy/security settings</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <RefreshCw className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-800">Network Issues</p>
                  <p className="text-xs text-purple-600">Try refreshing or check your connection</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-gray-900 text-sm">Quick Fixes:</h4>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">For Ad Blockers:</p>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Disable uBlock Origin, AdBlock Plus, or similar extensions</li>
                <li>Add this site to your ad blocker's allowlist</li>
                <li>Try browsing in incognito/private mode</li>
              </ol>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">For Browser Issues:</p>
              <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
                <li>Try a different browser (Chrome, Firefox, Safari)</li>
                <li>Clear browser cache and cookies</li>
                <li>Disable strict privacy settings temporarily</li>
              </ol>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://support.google.com/chrome/answer/2392284', '_blank')}
              className="flex-1"
            >
              Get Help
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              Still having issues? Contact our support team
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionError;
