import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case "/farmer/dashboard":
      return "Farmer Dashboard";
    case "/farmer/crops":
      return "Crops Management";
    case "/farmer/tasks":
      return "Task Management";
    case "/farmer/expenses":
      return "Expenses";
    case "/farmer/vaccines":
      return "Vaccines";
    case "/farmer/fcr-calculator":
      return "FCR Calculator";
    default:
      return "Farmer Portal";
  }
};

export function FarmerLayout() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar userType="farmer" />
      <div className="flex-1">
        <TopBar title={title} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
