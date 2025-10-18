import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RecordingPreferences from "./pages/RecordingPreferences";
import CameraView from "./pages/CameraView";
import DataAnalysis from "./pages/DataAnalysis";
import RootLayout from "./components/RootLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}> 
            <Route path="/" element={<Index />} />
            <Route path="/recording-preferences" element={<RecordingPreferences />} />
            <Route path="/camera-view" element={<CameraView />} />
            <Route path="/data-analysis" element={<DataAnalysis />} />
          </Route>
          {/* catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
