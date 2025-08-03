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
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  userType?: "farmer" | "dealer" | "admin";
  onClose?: () => void;
}

const navigationGroups = {
  farmer: {
    FARMER: [
      { title: "Dashboard", url: "/farmer/dashboard", icon: Home },
      { title: "Feed Prices", url: "/farmer/feed-prices", icon: DollarSign },
      { title: "FCR Calculator", url: "/farmer/fcr-calculator", icon: Calculator },
      { title: "Vaccine Reminders", url: "/farmer/vaccines", icon: Syringe },
    ],
    "ORDERING": [
      { title: "My Orders", url: "/farmer/orders", icon: ShoppingCart },
    ],
    "ADVANCED TOOLS": [
      { title: "Poultry Calculators", url: "/farmer/calculators", icon: Zap },
      { title: "Shed Management", url: "/farmer/shed-management", icon: Building },
    ],
    "RESOURCES": [
      { title: "Posts & Guides", url: "/farmer/posts", icon: BookOpen },
    ],
  },
  dealer: {
    DEALER: [
      { title: "Dashboard", url: "/dealer/dashboard", icon: Home },
      { title: "Feed Prices", url: "/dealer/feed-prices", icon: DollarSign },
    ],
    "INVENTORY & ORDERS": [
      { title: "Inventory Management", url: "/dealer/inventory", icon: Archive },
      { title: "Order Management", url: "/dealer/orders", icon: ShoppingCart },
    ],
    "RESOURCES": [
      { title: "Posts & Guides", url: "/dealer/posts", icon: BookOpen },
    ],
  },
};

export function AppSidebar({ userType = "farmer", onClose }: AppSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const groups = navigationGroups[userType as keyof typeof navigationGroups];

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Poultry Mitra</h1>
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