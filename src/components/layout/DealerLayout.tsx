import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case "/dealer/dashboard":
      return "Dealer Dashboard";
    case "/dealer/orders":
      return "Orders Management";
    case "/dealer/customers":
      return "Customer Management";
    case "/dealer/products":
      return "Product Management";
    case "/dealer/reports":
      return "Reports";
    default:
      return "Dealer Portal";
  }
};

export function DealerLayout() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar userType="dealer" />
      <div className="flex-1">
        <TopBar title={title} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
