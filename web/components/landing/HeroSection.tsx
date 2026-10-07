"use client";

import Link from "next/link";
import { InteractiveProblemsPanel } from "./InteractiveProblemsPanel";
import { MagneticButton } from "./MagneticButton";
import { useScrollReveal } from "./useScrollReveal";

import Image from "next/image";

export function HeroSection() {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <section className="landing-section relative pt-24 md:pt-[180px] pb-10">
      {/* Backdrop image */}
      <div className="hero-backdrop" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100vw", bottom: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <Image
          src="/hero-backdrop.png"
          alt="Hero background"
          fill
          style={{ objectFit: "cover", objectPosition: "top center", opacity: 0.7 }}
          priority
        />
        {/* Gradient overlay to blend it into the dark background */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,5,5,0) 0%, rgba(5,5,5,1) 100%)" }} />
      </div>

      <div
        ref={ref}
        className={`landing-fade-in ${visible ? "is-visible" : ""}`}
        style={{ maxWidth: 960, position: "relative", zIndex: 1 }}
      >
        <h1 className="landing-h1 md:whitespace-nowrap" style={{ fontFamily: "var(--font-jakarta-sans)", letterSpacing: "-0.02em" }}>
          Practice system design
          <br />
          the way interviews work.
        </h1>
        <p className="landing-body landing-body--lg mt-5 text-sm md:text-base" style={{ maxWidth: 640, fontFamily: "var(--landing-font-mono)", lineHeight: "1.6" }}>
          100 canonical problems. Guided multi-step workflow. Instant
          evaluation on architecture, trade-offs, and code. No hand-waving.
        </p>
        <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 28 }}>
          <MagneticButton>
            <Link href="/signup" className="landing-btn landing-btn--primary no-underline" style={{ borderRadius: 0, fontFamily: "var(--landing-font-mono)" }}>
              Start free →
            </Link>
          </MagneticButton>
          <MagneticButton>
            <Link href="/problems" className="landing-btn landing-btn--secondary no-underline" style={{ borderRadius: 0, fontFamily: "var(--landing-font-mono)" }}>
              Browse problems
            </Link>
          </MagneticButton>
        </div>
      </div>

      {/* Hero panel — full-width problems list */}
      <div
        className={`landing-fade-in mt-10 md:mt-14 ${visible ? "is-visible" : ""}`}
        style={{
          transitionDelay: "200ms",
          position: "relative",
          zIndex: 1,
          width: "100%"
        }}
      >
        <InteractiveProblemsPanel />
      </div>
    </section>
  );
}
