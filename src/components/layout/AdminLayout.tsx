import { Outlet, useLocation } from "react-router-dom";
import { TopBar } from "./TopBar";
import { Breadcrumb } from "../navigation/Breadcrumb";

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case "/admin":
      return "Admin Panel";
    case "/admin/settings":
      return "Settings";
    case "/admin/rates":
      return "Broiler Rate Management";
    case "/admin/users":
      return "User Management";
    case "/admin/reports":
      return "Admin Reports";
    case "/admin/posts":
      return "Posts & Guides Management";
    default:
      return "Admin Portal";
  }
};

const shouldShowBackButton = (pathname: string) => {
  // Show back button for non-main admin pages
  return pathname !== "/admin";
};

export function AdminLayout() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);
  const showBackButton = shouldShowBackButton(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar 
        title={title}
        showBackButton={showBackButton}
      />
      
      {/* Breadcrumb Navigation */}
      <div className="px-4 lg:px-6 py-2 bg-white border-b border-gray-100">
        <Breadcrumb />
      </div>
      
      <main className="p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
}
