import { Outlet, useLocation } from "react-router-dom";
import { TopBar } from "./TopBar";

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

export function AdminLayout() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title={title} />
      <main className="p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
}
