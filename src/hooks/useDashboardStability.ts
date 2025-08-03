import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook to prevent dashboard blackouts and manage loading states
 * across order management operations
 */
export function useDashboardStability() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isStable, setIsStable] = useState(true);
  const [operationInProgress, setOperationInProgress] = useState(false);

  // Prevent blackouts during critical operations
  const executeWithStability = useCallback(async (
    operation: () => Promise<void>,
    operationName: string
  ) => {
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    setOperationInProgress(true);
    setIsStable(false);

    try {
      await operation();
      
      // Brief delay to allow real-time updates to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsStable(true);
    } catch (error) {
      console.error(`Dashboard stability error in ${operationName}:`, error);
      
      toast({
        title: "Operation Failed",
        description: `Failed to complete ${operationName}. Dashboard remains stable.`,
        variant: "destructive",
      });
      
      // Force stability recovery
      setIsStable(true);
    } finally {
      setOperationInProgress(false);
    }
  }, [currentUser, toast]);

  // Monitor auth state changes to prevent blackouts
  useEffect(() => {
    if (!currentUser) {
      setIsStable(false);
    } else {
      setIsStable(true);
    }
  }, [currentUser]);

  return {
    isStable,
    operationInProgress,
    executeWithStability
  };
}
