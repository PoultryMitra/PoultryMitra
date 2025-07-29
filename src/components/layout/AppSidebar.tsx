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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// Mock user role - in real app this would come from auth context
const userRole = "farmer"; // "farmer" | "dealer" | "admin"

const farmerItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Expenses", url: "/expenses", icon: DollarSign },
  { title: "FCR Calculator", url: "/fcr-calculator", icon: Calculator },
  { title: "Vaccine Reminders", url: "/vaccines", icon: Calendar },
  { title: "Rates", url: "/rates", icon: TrendingUp },
];

const dealerItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Farmers", url: "/farmers", icon: Users },
  { title: "Rates", url: "/rates", icon: TrendingUp },
  { title: "Inventory", url: "/inventory", icon: Package },
];

const adminItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Users", url: "/users", icon: Users },
  { title: "Rates Management", url: "/rates-management", icon: Settings },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
];

const getItemsByRole = (role: string) => {
  switch (role) {
    case "dealer":
      return dealerItems;
    case "admin":
      return adminItems;
    default:
      return farmerItems;
  }
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const items = getItemsByRole(userRole);

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent className="border-r bg-card/50 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-sm text-foreground">PoultryCare</h2>
                <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}