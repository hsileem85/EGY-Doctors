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
import DoctorAuth from "@/pages/DoctorAuth";
import PatientAuth from "@/pages/PatientAuth";
import DoctorProfileSetup from "@/pages/DoctorProfileSetup";
import PublishContent from "@/pages/PublishContent";
import AboutUs from "@/pages/AboutUs";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/doctor/:id" component={DoctorProfile} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/publish" component={PublishContent} />
      <Route path="/register" component={DoctorRegister} />
      <Route path="/doctor-login" component={DoctorAuth} />
      <Route path="/patient-auth" component={PatientAuth} />
      <Route path="/profile-setup" component={DoctorProfileSetup} />
      <Route path="/edit-profile" component={DoctorProfileSetup} />
      <Route path="/about" component={AboutUs} />
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

