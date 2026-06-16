import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import DoctorProfile from "@/pages/DoctorProfile";
import Dashboard from "@/pages/Dashboard";
import DoctorRegister from "@/pages/DoctorRegister";
import AuthPage from "@/pages/AuthPage";
import DoctorProfileSetup from "@/pages/DoctorProfileSetup";
import PublishContent from "@/pages/PublishContent";
import AboutUs from "@/pages/AboutUs";
import PatientDashboard from "@/pages/PatientDashboard";
import PatientEMR from "@/pages/PatientEMR";
import MedicalCenterDashboard from "@/pages/MedicalCenterDashboard";
import MedicalCenterProfile from "@/pages/MedicalCenterProfile";
import Magazine from "@/pages/Magazine";
import ContactUs from "@/pages/ContactUs";
import Admin from "@/pages/Admin";

export const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/doctor/:id" component={DoctorProfile} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/publish" component={PublishContent} />
      <Route path="/register" component={DoctorRegister} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/profile-setup" component={DoctorProfileSetup} />
      <Route path="/edit-profile" component={DoctorProfileSetup} />
      <Route path="/about" component={AboutUs} />
      <Route path="/patient/dashboard" component={PatientDashboard} />
      <Route path="/patient/emr" component={PatientEMR} />
      <Route path="/medical-center/dashboard" component={MedicalCenterDashboard} />
      <Route path="/medical-center/profile-setup" component={MedicalCenterProfile} />
      <Route path="/magazine" component={Magazine} />
      <Route path="/contact" component={ContactUs} />
      <Route path="/admin" component={Admin} />
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
            <Router />
          </WouterRouter>
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

