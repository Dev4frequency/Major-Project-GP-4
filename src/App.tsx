import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import Protected from "@/components/Protected";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Intro from "./pages/Intro";
import Assistant from "./pages/Assistant";
import Modules from "./pages/Modules";
import Learning from "./pages/Learning";
import Practice from "./pages/Practice";
import Assignment from "./pages/Assignment";
import IDE from "./pages/IDE";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner theme="dark" position="top-center" />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/team" element={<Team />} />
            <Route path="/intro" element={<Protected><Intro /></Protected>} />
            <Route path="/assistant" element={<Protected><Assistant /></Protected>} />
            <Route path="/modules" element={<Protected><Modules /></Protected>} />
            <Route path="/modules/:id" element={<Protected><Learning /></Protected>} />
            <Route path="/practice/:id" element={<Protected><Practice /></Protected>} />
            <Route path="/assignment/:id" element={<Protected><Assignment /></Protected>} />
            <Route path="/ide/:id/:problemId" element={<Protected><IDE /></Protected>} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
