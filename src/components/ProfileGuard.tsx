import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileGuardProps {
  children: React.ReactNode;
}

const ProfileGuard: React.FC<ProfileGuardProps> = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user profile exists but is not complete, redirect to profile completion
  if (userProfile && userProfile.profileComplete === false) {
    return <Navigate to="/complete-profile" replace />;
  }

  // If user profile doesn't exist at all, also redirect to profile completion
  if (!userProfile) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
};

export default ProfileGuard;
