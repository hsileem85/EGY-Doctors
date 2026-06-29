import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import DoctorProfile from "@/pages/DoctorProfile";
import DoctorPublicProfile from "@/pages/DoctorPublicProfile";
import Dashboard from "@/pages/Dashboard";
import DoctorRegister from "@/pages/DoctorRegister";
import AuthPage from "@/pages/AuthPage";
import DoctorProfileSetup from "@/pages/DoctorProfileSetup";
import AboutUs from "@/pages/AboutUs";
import PatientDashboard from "@/pages/PatientDashboard";
import PatientEMR from "@/pages/PatientEMR";
import MedicalCenterDashboard from "@/pages/MedicalCenterDashboard";
import MedicalCenterProfile from "@/pages/MedicalCenterProfile";
import Magazine from "@/pages/Magazine";
import ContactUs from "@/pages/ContactUs";
import Admin from "@/pages/Admin";
import AssistantDashboard from "@/pages/AssistantDashboard";
import PaymentResult from "@/pages/PaymentResult";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect to="/" />;
  return <Component />;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/doctor/:id" component={DoctorProfile} />
      <Route path="/profile/:id" component={DoctorPublicProfile} />
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/register" component={DoctorRegister} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/profile-setup">{() => <ProtectedRoute component={DoctorProfileSetup} />}</Route>
      <Route path="/edit-profile">{() => <ProtectedRoute component={DoctorProfileSetup} />}</Route>
      <Route path="/about" component={AboutUs} />
      <Route path="/patient/dashboard">{() => <ProtectedRoute component={PatientDashboard} />}</Route>
      <Route path="/patient/emr">{() => <ProtectedRoute component={PatientEMR} />}</Route>
      <Route path="/medical-center/dashboard">{() => <ProtectedRoute component={MedicalCenterDashboard} />}</Route>
      <Route path="/medical-center/profile-setup">{() => <ProtectedRoute component={MedicalCenterProfile} />}</Route>
      <Route path="/magazine" component={Magazine} />
      <Route path="/contact" component={ContactUs} />
      <Route path="/admin" component={Admin} />
      <Route path="/assistant/dashboard">{() => <ProtectedRoute component={AssistantDashboard} />}</Route>
      <Route path="/billing/payment-result" component={PaymentResult} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthProvider>
              <Router />
              <Toaster />
            </AuthProvider>
          </WouterRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

