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
      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <main>
        <HeroSection />
        <StatsStrip />
        <BentoSection />
        <FeatureShowcase />
        <TrustSection />
        <FeatureResources />
        <TryItSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
