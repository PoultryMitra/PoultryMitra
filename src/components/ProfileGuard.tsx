import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileGuardProps {
  children: React.ReactNode;
}

const ProfileGuard: React.FC<ProfileGuardProps> = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

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

  // Check if accessing admin routes
  if (location.pathname.startsWith('/admin')) {
    if (userProfile.role !== 'admin') {
      // Non-admin users trying to access admin panel - redirect to appropriate dashboard
      if (userProfile.role === 'farmer') {
        return <Navigate to="/farmer/dashboard" replace />;
      } else if (userProfile.role === 'dealer') {
        return <Navigate to="/dealer/dashboard" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProfileGuard;
