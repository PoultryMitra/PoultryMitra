import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FarmerDashboardStabilityState {
  isStable: boolean;
  isRecovering: boolean;
  lastError: Error | null;
  operationCount: number;
  maxRetries: number;
  retryCount: number;
  isNetworkBlocked: boolean;
  circuitBreakerOpen: boolean;
}

export interface FarmerStabilityHookReturn extends FarmerDashboardStabilityState {
  executeWithStability: <T>(
    operation: () => Promise<T>,
    operationName: string,
    options?: {
      showSuccessToast?: boolean;
      showErrorToast?: boolean;
      maxRetries?: number;
      fallbackValue?: T;
    }
  ) => Promise<T | null>;
  resetStability: () => void;
  forceStabilityCheck: () => Promise<boolean>;
}

/**
 * Enhanced stability hook specifically for farmer dashboard
 * Prevents blackouts and handles error recovery with circuit breaker pattern
 */
export function useFarmerDashboardStability(): FarmerStabilityHookReturn {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [stabilityState, setStabilityState] = useState<FarmerDashboardStabilityState>({
    isStable: true,
    isRecovering: false,
    lastError: null,
    operationCount: 0,
    maxRetries: 3,
    retryCount: 0,
    isNetworkBlocked: false,
    circuitBreakerOpen: false
  });

  // Monitor user authentication status for stability
  useEffect(() => {
    if (!currentUser) {
      setStabilityState(prev => ({
        ...prev,
        isStable: false,
        lastError: new Error('No authenticated user')
      }));
    } else {
      setStabilityState(prev => ({
        ...prev,
        isStable: true,
        lastError: null
      }));
    }
  }, [currentUser]);

  const executeWithStability = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    options: {
      showSuccessToast?: boolean;
      showErrorToast?: boolean;
      maxRetries?: number;
      fallbackValue?: T;
    } = {}
  ): Promise<T | null> => {
    const {
      showSuccessToast = false,
      showErrorToast = true,
      maxRetries = 2, // Reduced from 3 to prevent excessive retries
      fallbackValue
    } = options;

    // Check for circuit breaker - don't attempt operations if network is blocked
    if (stabilityState.circuitBreakerOpen) {
      console.warn(`🚫 Farmer Dashboard Stability: Circuit breaker open, skipping ${operationName}`);
      if (showErrorToast) {
        toast({
          title: "Network Issue",
          description: "Connection blocked. Please check your network settings or disable ad blockers.",
          variant: "destructive",
        });
      }
      return fallbackValue ?? null;
    }

    // Check basic stability requirements
    if (!currentUser) {
      console.error(`❌ Farmer Dashboard Stability: No authenticated user for ${operationName}`);
      return fallbackValue ?? null;
    }

    let lastError: Error | null = null;
    
    // Retry logic with limited attempts
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Farmer Dashboard Stability: Executing ${operationName} (attempt ${attempt}/${maxRetries})`);
        
        const result = await operation();
        
        // Reset circuit breaker on success
        setStabilityState(prev => ({
          ...prev,
          retryCount: 0,
          isStable: true,
          isNetworkBlocked: false,
          circuitBreakerOpen: false,
          operationCount: prev.operationCount + 1
        }));

        console.log(`✅ Farmer Dashboard Stability: ${operationName} completed successfully`);
        return result;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Farmer Dashboard Stability: ${operationName} failed (attempt ${attempt}/${maxRetries}):`, error);
        
        // Check for network-related errors that indicate Firebase is blocked
        const isNetworkError = error instanceof Error && (
          error.message.includes('ERR_BLOCKED_BY_CLIENT') ||
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('firestore.googleapis.com') ||
          error.message.includes('firebase') ||
          error.message.includes('googleapis.com')
        );

        // Open circuit breaker immediately on network errors to prevent infinite loops
        if (isNetworkError) {
          setStabilityState(prev => ({
            ...prev,
            lastError: lastError,
            isStable: false,
            isNetworkBlocked: true,
            circuitBreakerOpen: true // Stop all further attempts
          }));
          
          console.log(`🚫 Farmer Dashboard Stability: Circuit breaker opened due to network error`);
          break; // Exit retry loop immediately
        }

        // Don't retry on authentication errors
        if (error instanceof Error && (
          error.message.includes('auth') ||
          error.message.includes('permission') ||
          error.message.includes('unauthenticated')
        )) {
          console.log(`🚫 Farmer Dashboard Stability: Not retrying ${operationName} due to auth error`);
          break;
        }

        setStabilityState(prev => ({
          ...prev,
          lastError: lastError,
          retryCount: attempt,
          isStable: attempt < maxRetries
        }));

        // Wait before retry only for non-network errors
        if (attempt < maxRetries) {
          const waitTime = 1000 * attempt; // Simple linear backoff
          console.log(`⏳ Farmer Dashboard Stability: Waiting ${waitTime}ms before retry ${attempt + 1}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed or circuit breaker opened
    if (lastError && showErrorToast) {
      const isNetworkIssue = lastError.message.includes('ERR_BLOCKED_BY_CLIENT') || 
                            lastError.message.includes('firestore.googleapis.com') ||
                            lastError.message.includes('Failed to fetch');
      
      toast({
        title: "Operation Failed",
        description: isNetworkIssue 
          ? "Network connection blocked. Please check your firewall or ad blocker settings." 
          : `${operationName} failed: ${lastError.message}`,
        variant: "destructive",
      });
    }

    return fallbackValue ?? null;
  }, [currentUser, stabilityState, toast]);

  const resetStability = useCallback(() => {
    console.log('🔄 Farmer Dashboard Stability: Manual reset - reopening circuit breaker');
    setStabilityState({
      isStable: true,
      isRecovering: false,
      lastError: null,
      operationCount: 0,
      maxRetries: 3,
      retryCount: 0,
      isNetworkBlocked: false,
      circuitBreakerOpen: false
    });
  }, []);

  const forceStabilityCheck = useCallback(async (): Promise<boolean> => {
    console.log('🔍 Farmer Dashboard Stability: Performing stability check');
    
    if (!currentUser) {
      return false;
    }

    // Simple check - if we have a user, we're stable
    setStabilityState(prev => ({
      ...prev,
      isStable: true,
      lastError: null,
      circuitBreakerOpen: false
    }));

    return true;
  }, [currentUser]);

  return {
    ...stabilityState,
    executeWithStability,
    resetStability,
    forceStabilityCheck
  };
}
