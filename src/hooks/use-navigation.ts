import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationState {
  previousPath?: string;
  canGoBack: boolean;
}

export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();

  const goBack = () => {
    const path = location.pathname;
    
    // Smart back navigation based on current route and user role
    if (userProfile?.role === 'farmer') {
      if (path === '/farmer/dashboard') {
        // Can't go back from dashboard, maybe go to home
        navigate('/');
      } else {
        navigate('/farmer/dashboard');
      }
    } else if (userProfile?.role === 'dealer') {
      if (path === '/dealer/dashboard') {
        navigate('/');
      } else {
        navigate('/dealer/dashboard');
      }
    } else if (userProfile?.role === 'admin') {
      if (path === '/admin') {
        navigate('/');
      } else {
        navigate('/admin');
      }
    } else {
      // Fallback to browser back
      window.history.back();
    }
  };

  const goToHome = () => {
    if (userProfile?.role === 'farmer') {
      navigate('/farmer/dashboard');
    } else if (userProfile?.role === 'dealer') {
      navigate('/dealer/dashboard');
    } else if (userProfile?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const goToPage = (page: string) => {
    const basePath = userProfile?.role ? `/${userProfile.role}` : '';
    navigate(`${basePath}/${page}`);
  };

  const canGoBack = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    // Can go back if not on root dashboard
    if (userProfile?.role === 'farmer') {
      return path !== '/farmer/dashboard';
    } else if (userProfile?.role === 'dealer') {
      return path !== '/dealer/dashboard';
    } else if (userProfile?.role === 'admin') {
      return path !== '/admin';
    }
    
    return segments.length > 0;
  };

  const getNavigationInfo = (): NavigationState => {
    return {
      canGoBack: canGoBack(),
      previousPath: getPreviousPath(),
    };
  };

  const getPreviousPath = (): string | undefined => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length <= 1) return undefined;
    
    // Return parent path
    return '/' + segments.slice(0, -1).join('/');
  };

  return {
    goBack,
    goToHome,
    goToPage,
    canGoBack: canGoBack(),
    navigationInfo: getNavigationInfo(),
    currentPath: location.pathname,
    userRole: userProfile?.role,
  };
}

export default useNavigation;
