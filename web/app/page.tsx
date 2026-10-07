"use client";

import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsStrip } from "@/components/landing/StatsStrip";
import { BentoSection } from "@/components/landing/BentoSection";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { TrustSection } from "@/components/landing/TrustSection";
import { FeatureResources } from "@/components/landing/FeatureResources";
import { TryItSection } from "@/components/landing/TryItSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";
import "./landing.css";

export default function Home() {
  return (
    <div className="landing-page">
      <div className="landing-noise" />
      <div className="landing-dots" />
      <div className="landing-v-lines" />
      
      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      
      <main>
        <HeroSection />
        <div className="landing-h-line" />
        <StatsStrip />
        <div className="landing-h-line" />
        <BentoSection />
        <div className="landing-h-line" />
        <FeatureShowcase />
        <div className="landing-h-line" />
        <TrustSection />
        <div className="landing-h-line" />
        <FeatureResources />
        <div className="landing-h-line" />
        <TryItSection />
        <div className="landing-h-line" />
        <FinalCTA />
        <div className="landing-h-line" />
      </main>
      
      <LandingFooter />
    </div>
  );
}
