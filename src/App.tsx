import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CameraView from "./pages/CameraView";
import AudioRecording from "./pages/AudioRecording";
import DataAnalysis from "./pages/DataAnalysis";
import RootLayout from "./components/RootLayout";
import DebatePreferences from "./pages/DebatePreferences";
import PresentationPreferences from "./pages/PresentationPreferences";
import SpeechPreferences from "./pages/SpeechPreferences";
import FeedbackPage from "./pages/FeedbackPage";
import ChatAnalysis from "./pages/ChatAnalysis";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route element={<RootLayout />}> 
            <Route path="/" element={<Index />} />
            <Route path="/debate-preferences" element={<DebatePreferences />} />
            <Route path="/presentation-preferences" element={<PresentationPreferences />} />
            <Route path="/speech-preferences" element={<SpeechPreferences />} />
            <Route path="/camera-view" element={<CameraView />} />
            <Route path="/audio-recording" element={<AudioRecording />} />
            <Route path="/data-analysis" element={<DataAnalysis />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/chat-analysis" element={<ChatAnalysis />} />
          </Route>
          {/* catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
