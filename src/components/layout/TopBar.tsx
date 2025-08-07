import { useState } from "react";
import { Globe, LogOut, Menu, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LanguageToggle } from "@/components/TranslationComponents";

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  showBackButton?: boolean;
}

export function TopBar({ title, onMenuClick, showMenuButton = false, showBackButton = false }: TopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userProfile } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBackClick = () => {
    // Smart back navigation based on current route
    const path = location.pathname;
    
    if (path.startsWith('/farmer/')) {
      navigate('/farmer/dashboard');
    } else if (path.startsWith('/dealer/')) {
      navigate('/dealer/dashboard');
    } else if (path.startsWith('/admin/')) {
      navigate('/admin');
    } else {
      // Fallback to browser back
      window.history.back();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Back Button */}
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {/* Menu Button for Mobile */}
          {showMenuButton && onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <h1 className="text-lg lg:text-2xl font-semibold text-gray-900 truncate">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* User Info */}
          {userProfile && (
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <span>{userProfile.displayName}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full capitalize">
                {userProfile.role}
              </span>
            </div>
          )}
          
          {/* Language Toggle */}
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-sm"
          >
            <span className="hidden sm:inline">Logout</span>
            <LogOut className="h-4 w-4 sm:hidden" />
          </Button>
        </div>
      </div>
    </header>
  );
}