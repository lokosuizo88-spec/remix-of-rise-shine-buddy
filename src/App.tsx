import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import CreateAlarm from "./pages/CreateAlarm.tsx";
import AlarmRinging from "./pages/AlarmRinging.tsx";
import Victory from "./pages/Victory.tsx";
import Stats from "./pages/Stats.tsx";
import SleepMode from "./pages/SleepMode.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<CreateAlarm />} />
          <Route path="/alarm" element={<AlarmRinging />} />
          <Route path="/victory" element={<Victory />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/sleep" element={<SleepMode />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
