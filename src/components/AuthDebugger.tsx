import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AuthDebugger: React.FC = () => {
  const { currentUser, userProfile, loading, sessionChecked, authError } = useAuth();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 z-50 bg-black bg-opacity-75 text-white p-2 text-xs font-mono max-w-xs">
      <div className="space-y-1">
        <div>🔐 Auth State:</div>
        <div>Loading: {loading ? '✅' : '❌'}</div>
        <div>Session Checked: {sessionChecked ? '✅' : '❌'}</div>
        <div>Current User: {currentUser ? '✅ ' + currentUser.email : '❌'}</div>
        <div>User Profile: {userProfile ? '✅ ' + userProfile.role : '❌'}</div>
        <div>Profile Complete: {userProfile?.profileComplete ? '✅' : '❌'}</div>
        {authError && <div className="text-red-300">Error: {authError}</div>}
      </div>
    </div>
  );
};

export default AuthDebugger;
