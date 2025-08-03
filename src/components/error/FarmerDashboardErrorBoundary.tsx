import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  Shield,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  showDetails: boolean;
}

interface ErrorReport {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
}

export class FarmerDashboardErrorBoundary extends Component<Props, State> {
  private retryTimer?: NodeJS.Timeout;
  
  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      showDetails: false
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `farmer-dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Farmer Dashboard Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Generate error report
    const errorReport: ErrorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    };

    // Log error report
    this.logError(errorReport);

    // Report to error tracking service if available
    this.reportError(errorReport);
  }

  private getCurrentUserId = (): string | undefined => {
    try {
      // Try to get current user from localStorage or session
      const userSession = localStorage.getItem('userSession');
      if (userSession) {
        const session = JSON.parse(userSession);
        return session.uid;
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  private logError = (errorReport: ErrorReport) => {
    console.group(`🚨 Farmer Dashboard Error Report: ${errorReport.errorId}`);
    console.error('Message:', errorReport.message);
    console.error('Timestamp:', errorReport.timestamp);
    console.error('URL:', errorReport.url);
    console.error('User ID:', errorReport.userId || 'Anonymous');
    if (errorReport.stack) {
      console.error('Stack:', errorReport.stack);
    }
    if (errorReport.componentStack) {
      console.error('Component Stack:', errorReport.componentStack);
    }
    console.groupEnd();
  };

  private reportError = (errorReport: ErrorReport) => {
    try {
      // Report to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: `Farmer Dashboard Error: ${errorReport.message}`,
          fatal: false,
          error_id: errorReport.errorId
        });
      }

      // Could also send to external error reporting service
      // Example: Sentry, LogRocket, etc.
    } catch (reportingError) {
      console.warn('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    console.log('🔄 Farmer Dashboard: Attempting error recovery');
    
    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1
    }));

    // Clear error state after a short delay
    this.retryTimer = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
        showDetails: false
      });
    }, 500);
  };

  private handleGoHome = () => {
    // Clear potentially corrupted state
    try {
      localStorage.removeItem('farmerDashboardState');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    
    // Navigate to home
    window.location.href = '/';
  };

  private handleRefreshPage = () => {
    // Clear any cached data that might be corrupted
    try {
      localStorage.removeItem('farmerDashboardState');
      localStorage.removeItem('farmerTransactions');
      localStorage.removeItem('farmerDealers');
    } catch (e) {
      console.warn('Could not clear cached data:', e);
    }
    
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  private getErrorSeverity = (): 'low' | 'medium' | 'high' => {
    const { error } = this.state;
    
    if (!error) return 'low';
    
    // High severity errors
    if (error.message.includes('auth') || 
        error.message.includes('permission') ||
        error.message.includes('network') ||
        error.name === 'ChunkLoadError') {
      return 'high';
    }
    
    // Medium severity errors
    if (error.message.includes('render') ||
        error.message.includes('component') ||
        error.message.includes('state')) {
      return 'medium';
    }
    
    return 'low';
  };

  private getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
    }
  };

  private getRecoveryTips = (): string[] => {
    const { error } = this.state;
    const tips: string[] = [];
    
    if (error?.message.includes('auth')) {
      tips.push('Try logging out and logging back in');
      tips.push('Clear your browser data and try again');
    }
    
    if (error?.message.includes('network')) {
      tips.push('Check your internet connection');
      tips.push('Try refreshing the page in a few moments');
    }
    
    if (error?.name === 'ChunkLoadError') {
      tips.push('The app was updated - please refresh the page');
      tips.push('Clear your browser cache');
    }
    
    if (tips.length === 0) {
      tips.push('Try refreshing the page');
      tips.push('If the problem persists, try logging out and back in');
      tips.push('Contact support if the issue continues');
    }
    
    return tips;
  };

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  public render() {
    const { hasError, error, errorInfo, errorId, retryCount, showDetails } = this.state;
    const { children, fallback, showErrorDetails = true } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const severity = this.getErrorSeverity();
      const recoveryTips = this.getRecoveryTips();

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-12 w-12 text-red-500 mr-3" />
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl text-gray-900 mb-2">
                Farmer Dashboard Error
              </CardTitle>
              <div className="flex items-center justify-center gap-2">
                <Badge className={this.getSeverityColor(severity)}>
                  {severity.toUpperCase()} SEVERITY
                </Badge>
                <Badge variant="outline">
                  Error #{errorId.split('-').pop()}
                </Badge>
                {retryCount > 0 && (
                  <Badge variant="outline">
                    Retry #{retryCount}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  We encountered an unexpected error in your farmer dashboard. 
                  Don't worry - we can help you get back on track.
                </p>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800 font-medium text-sm">
                      {error.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Recovery Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Bug className="h-4 w-4 mr-2" />
                  Recovery Steps
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  {recoveryTips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="font-medium mr-2">{index + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleRetry} 
                  className="flex-1"
                  disabled={retryCount >= 3}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {retryCount >= 3 ? 'Max Retries Reached' : `Try Again ${retryCount > 0 ? `(${retryCount}/3)` : ''}`}
                </Button>
                
                <Button 
                  onClick={this.handleRefreshPage} 
                  variant="outline" 
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Error Details */}
              {showErrorDetails && error && (
                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.toggleDetails}
                    className="mb-3"
                  >
                    {showDetails ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Error Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show Error Details
                      </>
                    )}
                  </Button>
                  
                  {showDetails && (
                    <div className="bg-gray-50 border rounded-lg p-4 text-sm font-mono space-y-2">
                      <div>
                        <strong>Error:</strong> {error.message}
                      </div>
                      <div>
                        <strong>Type:</strong> {error.name}
                      </div>
                      <div>
                        <strong>ID:</strong> {errorId}
                      </div>
                      {error.stack && (
                        <div>
                          <strong>Stack:</strong>
                          <pre className="text-xs mt-1 overflow-x-auto bg-white p-2 rounded border">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      {errorInfo?.componentStack && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="text-xs mt-1 overflow-x-auto bg-white p-2 rounded border">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="text-center text-xs text-gray-500">
                <p>Error occurred at {new Date().toLocaleString()}</p>
                <p>If this problem persists, please contact support with Error ID: {errorId}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}
