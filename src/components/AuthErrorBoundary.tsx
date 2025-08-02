import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Report to error tracking service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  private handleReload = () => {
    // Clear any stored session data that might be corrupted
    localStorage.removeItem('userSession');
    localStorage.removeItem('firebase:authUser:' + import.meta.env.VITE_FIREBASE_API_KEY);
    
    // Reload the page
    window.location.reload();
  };

  private handleGoHome = () => {
    // Clear session and go to home
    localStorage.removeItem('userSession');
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          resetError={() => this.handleReload()}
        />
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
