import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation"; // ← Add this import
import { Dashboard } from "./pages/Dashboard";
import { MissionDetails } from "./pages/MissionDetails";
import { MyMissions } from "./pages/MyMissions";
import { AdminMissionCreator } from "./pages/AdminMissionCreator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Add the Navigation component here */}
        <div className="min-h-screen bg-background">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/mission/:id" element={<MissionDetails />} />
              <Route path="/my-missions" element={<MyMissions />} />
              <Route path="/admin" element={<AdminMissionCreator />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
