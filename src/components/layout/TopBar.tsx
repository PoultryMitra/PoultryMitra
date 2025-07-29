import { useState } from "react";
import { Globe, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        
        <div className="flex items-center space-x-4">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="text-gray-600"
          >
            {language === "en" ? "English" : "हिंदी"} | {language === "en" ? "Hindi" : "English"}
          </Button>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}