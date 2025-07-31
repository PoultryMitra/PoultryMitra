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
} from "lucide-react";

interface AppSidebarProps {
  userType?: "farmer" | "dealer" | "admin";
}

const navigationGroups = {
  farmer: {
    FARMER: [
      { title: "Dashboard", url: "/farmer/dashboard", icon: Home },
      { title: "Feed Prices", url: "/farmer/feed-prices", icon: DollarSign },
      { title: "FCR Calculator", url: "/farmer/fcr-calculator", icon: Calculator },
      { title: "Vaccine Reminders", url: "/farmer/vaccines", icon: Syringe },
    ],
  },
  dealer: {
    DEALER: [
      { title: "Dashboard", url: "/dealer/dashboard", icon: Home },
      { title: "Feed Prices", url: "/dealer/feed-prices", icon: DollarSign },
    ],
  },
};

export function AppSidebar({ userType = "farmer" }: AppSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const groups = navigationGroups[userType as keyof typeof navigationGroups];

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Poultry Mitra</h1>
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
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.url)
                        ? "bg-green-100 text-green-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.title}
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