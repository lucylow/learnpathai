import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Lazy load pages for better code splitting and performance
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const About = lazy(() => import("./pages/About"));
const LearningPath = lazy(() => import("./pages/LearningPath"));
const LearningPathViewer = lazy(() => import("./pages/LearningPathViewer"));
const Impact = lazy(() => import("./pages/Impact"));
const Features = lazy(() => import("./pages/Features"));
const Team = lazy(() => import("./pages/Team"));
const Docs = lazy(() => import("./pages/Docs"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learning-path" element={<LearningPath />} />
            <Route path="/learning-path-viewer" element={<LearningPathViewer />} />
            <Route path="/features" element={<Features />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/team" element={<Team />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
