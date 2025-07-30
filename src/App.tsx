import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/RegisterNew";
import FarmerDashboard from "./pages/FarmerDashboard";
import DealerDashboard from "./pages/DealerDashboard";
import AdminPanel from "./pages/admin/AdminPanel";
import FCRCalculator from "./pages/FCRCalculatorNew";
import Expenses from "./pages/Expenses";
import Vaccines from "./pages/Vaccines";
import Rates from "./pages/Rates";
import NotFound from "./pages/NotFound";
import Crops from "./pages/Crops";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import FarmerLogin from "./pages/FarmerLogin";
import DealerLogin from "./pages/DealerLogin";
import AdminLogin from "./pages/AdminLogin";
import Settings from "./pages/admin/Settings";
import BroilerRate from "./pages/admin/BroilerRate";
import Users from "./pages/admin/Users";
import ProfileCompletion from "./pages/ProfileCompletion";
import AboutUs from "./pages/AboutUs";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// Layouts
import { FarmerLayout } from "./components/layout/FarmerLayout";
import { DealerLayout } from "./components/layout/DealerLayout";
import { AdminLayout } from "./components/layout/AdminLayout";

// Auth Context
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileGuard from "./components/ProfileGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/farmer-login" element={<FarmerLogin />} />
          <Route path="/dealer-login" element={<DealerLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/complete-profile" element={<ProfileCompletion />} />
          
          {/* Public Information Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/fcr-calculator" element={<FCRCalculator />} />
          
          {/* Farmer Routes */}
          <Route path="/farmer" element={
            <ProfileGuard>
              <FarmerLayout />
            </ProfileGuard>
          }>
            <Route path="dashboard" element={<FarmerDashboard />} />
            <Route path="crops" element={<Crops />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="vaccines" element={<Vaccines />} />
            <Route path="fcr-calculator" element={<FCRCalculator />} />
          </Route>
          
          {/* Dealer Routes */}
          <Route path="/dealer" element={
            <ProfileGuard>
              <DealerLayout />
            </ProfileGuard>
          }>
            <Route path="dashboard" element={<DealerDashboard />} />
            <Route path="orders" element={<DealerDashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
            <Route path="reports" element={<Reports />} />
            <Route path="rates" element={<Rates />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProfileGuard>
              <AdminLayout />
            </ProfileGuard>
          }>
            <Route index element={<AdminPanel />} />
            <Route path="settings" element={<Settings />} />
            <Route path="rates" element={<BroilerRate />} />
            <Route path="users" element={<Users />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
