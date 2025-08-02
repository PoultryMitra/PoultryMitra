import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, RefreshCw, AlertCircle } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error | null;
  resetError?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const handleGoHome = () => {
    // Clear all local storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate to home
    window.location.href = '/';
  };

  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-xl text-gray-900">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {error && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded mb-4">
              <p className="font-medium mb-1">Error Details:</p>
              <p className="font-mono text-xs break-all">
                {error.message || 'Unknown error occurred'}
              </p>
            </div>
          )}
          
          <p className="text-gray-600">
            We encountered an unexpected error. This might be due to:
          </p>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>• Network connectivity issues</p>
            <p>• Browser security settings</p>
            <p>• Ad blockers interfering with the site</p>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleRefresh} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
          
          <p className="text-xs text-gray-400 pt-2">
            If the problem persists, try disabling ad blockers or using a different browser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback;
