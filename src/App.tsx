import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import IndexNew from "./pages/IndexNew";
import Login from "./pages/Login";
import Register from "./pages/RegisterNew";
import FarmerDashboard from "./pages/FarmerDashboardSimple";
import DealerDashboard from "./pages/DealerDashboard";
import AdminPanel from "./pages/admin/AdminPanel";
import FCRCalculator from "./pages/FCRCalculatorNew";
import FreeFCRCalculator from "./pages/FreeFCRCalculator";
import FreeFCRCalculatorPage from "./pages/FreeFCRCalculatorPage";
import BatchManagement from "./pages/BatchManagement";
import FCRReports from "./pages/FCRReports";
import Expenses from "./pages/Expenses";
import Vaccines from "./pages/Vaccines";
import VaccinesWorking from "./pages/VaccinesWorking";
import Rates from "./pages/Rates";
import NotFound from "./pages/NotFound";
import Crops from "./pages/Crops";
import Tasks from "./pages/Tasks";
import Reports from "./pages/admin/Reports";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import FarmerLogin from "./pages/FarmerLogin";
import DealerLogin from "./pages/DealerLogin";
import AdminLogin from "./pages/AdminLogin";
import Settings from "./pages/admin/Settings";
import BroilerRate from "./pages/admin/BroilerRate";
import Users from "./pages/admin/UserManagement";
import ProfileCompletion from "./pages/ProfileCompletion";
import FarmerConnect from "./pages/FarmerConnect";
import ConnectionTest from "./pages/ConnectionTest";
import FarmerFeedView from "./pages/FarmerFeedView";
import AboutUs from "./pages/AboutUs";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ClientRequirementsDemo from "./pages/ClientRequirementsDemo";
import PoultryCalculators from "./pages/PoultryCalculators";
import ShedManagement from "./pages/ShedManagement";
import AdminPostsManagement from "./pages/AdminPostsManagement";
import PostsAndGuides from "./pages/PostsAndGuides";

// Layouts
import { FarmerLayout } from "./components/layout/FarmerLayout";
import { DealerLayout } from "./components/layout/DealerLayout";
import { AdminLayout } from "./components/layout/AdminLayout";

// Auth Context
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileGuard from "./components/ProfileGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<IndexNew />} />
          <Route path="/old-home" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/farmer-login" element={<FarmerLogin />} />
          <Route path="/dealer-login" element={<DealerLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/fcr-calculator" element={<FreeFCRCalculatorPage />} />
          <Route path="/batch-management" element={<BatchManagement />} />
          <Route path="/fcr-reports" element={<FCRReports />} />
          <Route path="/complete-profile" element={<ProfileCompletion />} />
          <Route path="/farmer-connect" element={<FarmerConnect />} />
          <Route path="/connection-test" element={<ConnectionTest />} />
          
          {/* Public Information Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/fcr-calculator-pro" element={<FCRCalculator />} />
          <Route path="/client-demo" element={<ClientRequirementsDemo />} />
          <Route path="/poultry-calculators" element={<PoultryCalculators />} />
          <Route path="/shed-management" element={<ShedManagement />} />
          <Route path="/posts" element={<PostsAndGuides />} />
          <Route path="/guides" element={<PostsAndGuides />} />
          
          {/* Free Dashboards for Testing - No ProfileGuard */}
          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/dealer-dashboard" element={<DealerDashboard />} />
          
          {/* Farmer Routes */}
          <Route path="/farmer" element={
            <ProfileGuard>
              <FarmerLayout />
            </ProfileGuard>
          }>
            <Route path="dashboard" element={<FarmerDashboard />} />
            <Route path="feed-prices" element={<FarmerFeedView />} />
            <Route path="fcr-calculator" element={<FCRCalculator />} />
            <Route path="vaccines" element={<VaccinesWorking />} />
            <Route path="calculators" element={<PoultryCalculators />} />
            <Route path="shed-management" element={<ShedManagement />} />
            <Route path="posts" element={<PostsAndGuides />} />
          </Route>
          
          {/* Dealer Routes */}
          <Route path="/dealer" element={
            <ProfileGuard>
              <DealerLayout />
            </ProfileGuard>
          }>
            <Route path="dashboard" element={<DealerDashboard />} />
            <Route path="feed-prices" element={<Rates />} />
            <Route path="posts" element={<PostsAndGuides />} />
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
            <Route path="posts" element={<AdminPostsManagement />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
