import React from "react";
import { Layout } from "@/components/Layout";
import HeroSection from "@/components/landing/HeroSection";
import ValueProps from "@/components/landing/ValueProps";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import Testimonials from "@/components/landing/Testimonials";
import CTASection from "@/components/landing/CTASection";
import "@/styles/animations.css";

const Index = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <HeroSection />
        <ValueProps />
        <InteractiveDemo />
        <FeaturesGrid />
        <Testimonials />
        <CTASection />
        </div>
    </Layout>
  );
};

export default Index;
