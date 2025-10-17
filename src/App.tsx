import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { queryClient } from "@/lib/queryClient";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { AccessibilityToolbar } from "./components/accessibility/AccessibilityToolbar";
import "./styles/accessibility.css";

// Lazy load pages for better code splitting and performance
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AgeDashboard = lazy(() => import("./pages/AgeDashboard"));
const AgeSelection = lazy(() => import("./pages/AgeSelection"));
const About = lazy(() => import("./pages/About"));
const LearningPath = lazy(() => import("./pages/LearningPath"));
const LearningPathViewer = lazy(() => import("./pages/LearningPathViewer"));
const Impact = lazy(() => import("./pages/Impact"));
const Features = lazy(() => import("./pages/Features"));
const Team = lazy(() => import("./pages/Team"));
const Docs = lazy(() => import("./pages/Docs"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AccessibilitySettingsPage = lazy(() => import("./pages/AccessibilitySettings"));
const JudgeDemo = lazy(() => import("./pages/JudgeDemo"));
const CollaborativeLearning = lazy(() => import("./pages/CollaborativeLearning"));
const AIFeaturesDemo = lazy(() => import("./pages/AIFeaturesDemo"));
const EngagingDemo = lazy(() => import("./pages/EngagingDemo"));
const GamificationDemo = lazy(() => import("./pages/GamificationDemo"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AccessibilityProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/age-selection" element={<AgeSelection />} />
              <Route path="/age-dashboard" element={<AgeDashboard />} />
              <Route path="/learning-path" element={<LearningPath />} />
              <Route path="/learning-path-viewer" element={<LearningPathViewer />} />
              <Route path="/features" element={<Features />} />
              <Route path="/impact" element={<Impact />} />
              <Route path="/team" element={<Team />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/accessibility-settings" element={<AccessibilitySettingsPage />} />
              <Route path="/judge-demo" element={<JudgeDemo />} />
              <Route path="/collaborative-learning" element={<CollaborativeLearning />} />
              <Route path="/ai-features-demo" element={<AIFeaturesDemo />} />
              <Route path="/engaging-demo" element={<EngagingDemo />} />
              <Route path="/gamification-demo" element={<GamificationDemo />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          {/* Floating Accessibility Toolbar - Available on all pages */}
          <AccessibilityToolbar />
        </BrowserRouter>
      </TooltipProvider>
      {/* React Query DevTools - only visible in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </AccessibilityProvider>
  </QueryClientProvider>
);

export default App;
