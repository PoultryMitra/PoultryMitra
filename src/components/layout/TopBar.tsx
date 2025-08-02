import { useState } from "react";
import { Globe, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function TopBar({ title, onMenuClick, showMenuButton = false }: TopBarProps) {
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="text-gray-600 hidden sm:flex text-xs lg:text-sm"
          >
            {language === "en" ? "English" : "हिंदी"} | {language === "en" ? "Hindi" : "English"}
          </Button>

          {/* Mobile Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="text-gray-600 sm:hidden text-xs"
          >
            {language === "en" ? "EN" : "हि"}
          </Button>

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