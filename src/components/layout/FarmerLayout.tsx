import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case "/farmer/dashboard":
      return "Farmer Dashboard";
    case "/farmer/feed-prices":
      return "Feed Prices & Dealers";
    case "/farmer/fcr-calculator":
      return "FCR Calculator";
    case "/farmer/vaccines":
      return "Vaccine Reminders";
    case "/farmer/calculators":
      return "Advanced Poultry Calculators";
    case "/farmer/shed-management":
      return "Shed Design & Management";
    default:
      return "Farmer Portal";
  }
};

export function FarmerLayout() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${isMobile ? 'fixed inset-y-0 left-0 z-50 transform' : 'relative'} ${
        isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
      } transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <AppSidebar userType="farmer" onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 lg:ml-0 flex flex-col min-w-0">
        <TopBar 
          title={title} 
          onMenuClick={() => setSidebarOpen(true)}
          showMenuButton={isMobile}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
