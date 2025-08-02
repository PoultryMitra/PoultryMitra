import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sessionManager } from '@/lib/sessionManager';

interface SessionRecoveryProps {
  children: React.ReactNode;
}

const SessionRecovery: React.FC<SessionRecoveryProps> = ({ children }) => {
  const { currentUser, loading, sessionChecked } = useAuth();
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);

  useEffect(() => {
    const attemptRecovery = async () => {
      // If we already have a current user or are still loading, don't interfere
      if (recoveryAttempted || currentUser || loading) {
        setRecoveryAttempted(true);
        return;
      }

      const session = sessionManager.getSession();
      if (session) {
        
        try {
          const isValid = await sessionManager.validateCurrentSession();
          if (!isValid) {
            sessionManager.clearSession();
          }
        } catch (error) {
          sessionManager.clearSession();
        }
      }
      
      setRecoveryAttempted(true);
    };

    // Only attempt recovery if session is checked
    if (sessionChecked) {
      attemptRecovery();
    }
  }, [currentUser, loading, recoveryAttempted, sessionChecked]);

  // Show minimal loading only if we haven't attempted recovery and session isn't checked yet
  if (!recoveryAttempted && !sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SessionRecovery;
