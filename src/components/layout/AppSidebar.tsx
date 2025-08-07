import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  DollarSign,
  Calculator,
  Calendar,
  Users,
  Settings,
  TrendingUp,
  Package,
  Shield,
  Syringe,
  X,
  Building,
  Zap,
  BookOpen,
  ShoppingCart,
  Archive,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnhancedTranslation } from "@/contexts/EnhancedTranslationContext";

interface AppSidebarProps {
  userType?: "farmer" | "dealer" | "admin";
  onClose?: () => void;
}

interface NavigationItem {
  title: string;
  url: string;
  icon: any;
}

interface NavigationGroups {
  [groupName: string]: NavigationItem[];
}

const getNavigationGroups = (bt: (key: string) => string): { [key: string]: NavigationGroups } => ({
  farmer: {
    [bt('farmer')]: [
      { title: bt('dashboard'), url: "/farmer/dashboard", icon: Home },
      { title: bt('feedPrices'), url: "/farmer/feed-prices", icon: DollarSign },
      { title: bt('fcrCalculator'), url: "/farmer/fcr-calculator", icon: Calculator },
      { title: bt('vaccineReminders'), url: "/farmer/vaccines", icon: Syringe },
    ],
    [bt('ordering')]: [
      { title: bt('myOrders'), url: "/farmer/orders", icon: ShoppingCart },
    ],
    [bt('advancedTools')]: [
      { title: bt('diseaseRisk'), url: "/farmer/disease-risk", icon: Activity },
      { title: bt('poultryCalculators'), url: "/farmer/calculators", icon: Zap },
      { title: bt('shedManagement'), url: "/farmer/shed-management", icon: Building },
    ],
    [bt('resources')]: [
      { title: bt('postsGuides'), url: "/farmer/posts", icon: BookOpen },
    ],
  },
  dealer: {
    [bt('dealer')]: [
      { title: bt('dashboard'), url: "/dealer/dashboard", icon: Home },
      { title: bt('feedPrices'), url: "/dealer/feed-prices", icon: DollarSign },
    ],
    [bt('inventoryOrders')]: [
      { title: bt('inventoryManagement'), url: "/dealer/inventory", icon: Archive },
      { title: bt('orderManagement'), url: "/dealer/orders", icon: ShoppingCart },
    ],
    [bt('resources')]: [
      { title: bt('postsGuides'), url: "/dealer/posts", icon: BookOpen },
    ],
  },
});

export function AppSidebar({ userType = "farmer", onClose }: AppSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Translation setup
  const { t, language } = useEnhancedTranslation();

  // Enhanced translation helper that prioritizes Google Translate
  const bt = (key: string): string => {
    // First try Enhanced Translation Context (Google Translate)
    const dynamicTranslation = t(key);
    if (dynamicTranslation && dynamicTranslation !== key) {
      console.log(`🌍 Google Translate used for AppSidebar: ${key} -> ${dynamicTranslation}`);
      return dynamicTranslation;
    }

    // Fallback to local content - fix the nested structure lookup
    const localContent = content[key as keyof typeof content];
    if (localContent && typeof localContent === 'object') {
      const translatedValue = localContent[language as keyof typeof localContent];
      if (translatedValue) {
        console.log(`📚 Static content used for AppSidebar: ${key} -> ${translatedValue}`);
        return translatedValue as string;
      }
    }
    
    const result = key;
    console.log(`⚠️ No translation found for AppSidebar: ${key}`);
    return result;
  };

  // Content object for translations
  const content = {
    // Group titles
    farmer: { en: "FARMER", hi: "किसान" },
    ordering: { en: "ORDERING", hi: "ऑर्डरिंग" },
    advancedTools: { en: "ADVANCED TOOLS", hi: "उन्नत उपकरण" },
    resources: { en: "RESOURCES", hi: "संसाधन" },
    dealer: { en: "DEALER", hi: "डीलर" },
    inventoryOrders: { en: "INVENTORY & ORDERS", hi: "इन्वेंटरी और ऑर्डर" },
    
    // Navigation items
    dashboard: { en: "Dashboard", hi: "डैशबोर्ड" },
    feedPrices: { en: "Feed Prices", hi: "फीड मूल्य" },
    fcrCalculator: { en: "FCR Calculator", hi: "एफसीआर कैलकुलेटर" },
    vaccineReminders: { en: "Vaccine Reminders", hi: "टीकाकरण अनुस्मारक" },
    myOrders: { en: "My Orders", hi: "मेरे ऑर्डर" },
    diseaseRisk: { en: "Disease Risk Calculator", hi: "रोग जोखिम कैलकुलेटर" },
    poultryCalculators: { en: "Poultry Calculators", hi: "पोल्ट्री कैलकुलेटर" },
    shedManagement: { en: "Shed Management", hi: "शेड प्रबंधन" },
    postsGuides: { en: "Posts & Guides", hi: "पोस्ट और गाइड" },
    inventoryManagement: { en: "Inventory Management", hi: "इन्वेंटरी प्रबंधन" },
    orderManagement: { en: "Order Management", hi: "ऑर्डर प्रबंधन" },
    
    // App title
    appTitle: { en: "Poultry Mitra", hi: "पोल्ट्री मित्र" }
  };

  const groups = getNavigationGroups(bt)[userType] || {};

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{bt('appTitle')}</h1>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="px-4 space-y-8">
        {Object.entries(groups).map(([groupName, items]) => (
          <div key={groupName}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {groupName}
            </h3>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.title}>
                  <NavLink
                    to={item.url}
                    className={`flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
                      isActive(item.url)
                        ? "bg-green-100 text-green-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={onClose} // Close sidebar on mobile when navigation item is clicked
                  >
                    <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}