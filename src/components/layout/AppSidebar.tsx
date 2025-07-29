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
} from "lucide-react";

// Mock user role - in real app this would come from auth context
const userRole = "farmer"; // "farmer" | "dealer" | "admin"

const navigationGroups = {
  farmer: {
    FARMER: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Crops", url: "/crops", icon: Package },
      { title: "Tasks", url: "/tasks", icon: Calendar },
    ],
    DEALER: [
      { title: "Orders", url: "/orders", icon: DollarSign },
      { title: "Customers", url: "/customers", icon: Users },
      { title: "Products", url: "/products", icon: Package },
    ],
    ADMIN: [
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Broiler Rate", url: "/rates", icon: TrendingUp, active: true },
      { title: "Users", url: "/users", icon: Users },
      { title: "Reports", url: "/reports", icon: TrendingUp },
    ],
  },
  dealer: {
    FARMER: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Crops", url: "/crops", icon: Package },
      { title: "Tasks", url: "/tasks", icon: Calendar },
    ],
    DEALER: [
      { title: "Orders", url: "/orders", icon: DollarSign, active: true },
      { title: "Customers", url: "/customers", icon: Users },
      { title: "Products", url: "/products", icon: Package },
    ],
    ADMIN: [
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Broiler Rate", url: "/rates", icon: TrendingUp },
      { title: "Users", url: "/users", icon: Users },
      { title: "Reports", url: "/reports", icon: TrendingUp },
    ],
  },
  admin: {
    FARMER: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Crops", url: "/crops", icon: Package },
      { title: "Tasks", url: "/tasks", icon: Calendar },
    ],
    DEALER: [
      { title: "Orders", url: "/orders", icon: DollarSign },
      { title: "Customers", url: "/customers", icon: Users },
      { title: "Products", url: "/products", icon: Package },
    ],
    ADMIN: [
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Broiler Rate", url: "/rates", icon: TrendingUp },
      { title: "Users", url: "/users", icon: Users, active: true },
      { title: "Reports", url: "/reports", icon: TrendingUp },
    ],
  },
};

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const groups = navigationGroups[userRole as keyof typeof navigationGroups];

  const isActive = (path: string, itemActive?: boolean) => 
    currentPath === path || itemActive;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">App Name</h1>
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
                      isActive(item.url, item.active)
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