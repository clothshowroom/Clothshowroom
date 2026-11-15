"use client";

import React from "react";
import { Ruler, Scissors, Sparkles } from "lucide-react";
import { useShowroom } from "@/components/providers/ShowroomProvider";
import CountUp from "@/components/react-bits/CountUp/CountUp";
import SpotlightCard from "@/components/react-bits/SpotlightCard/SpotlightCard";

const ATELIER_PILLARS = [
  {
    index: "01",
    title: "Archive Same-As-Shown or Re-Clothed",
    body: "Select an exact showroom creation in standard sizing or switch fabrics, shades, lapels, buttons, and embroidery notes before cutting begins.",
    icon: Sparkles,
  },
  {
    index: "02",
    title: "Hand-Chalked Pattern Per Posture",
    body: "Every custom silhouette is drafted individually onto kraft pattern paper with full-canvas chest structure, adjustable inlays, and breathability.",
    icon: Scissors,
  },
  {
    index: "03",
    title: "Direct WhatsApp Tailor Consultation",
    body: "Skip rigid checkout carts. Your structured garment brief lands straight in the master tailor’s WhatsApp for fabric swatches and video/in-studio fitting.",
    icon: Ruler,
  },
];

export function BespokeProcessSection() {
  const { settings } = useShowroom();

  return (
    <section
      id="process"
      className="relative overflow-hidden bg-obsidian text-[#FBF6EB] border-y border-brass/30 py-20 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="atelier-grain pointer-events-none absolute inset-0 opacity-[0.06]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Top Asymmetric Craft Editorial Row */}
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#D7B774]">
              [ 03 ] Master Tailoring Discipline
            </span>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-[3.4rem] leading-[0.98] tracking-[-0.02em] font-normal text-[#FBF6EB]">
              Every client pattern is drafted{" "}
              <span className="italic text-[#E4C988]">once for you.</span>
            </h2>
            <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-[#FBF6EB]/75 font-light">
              Whether you choose a photographed showroom garment or describe a fresh custom creation from scratch, {settings.brand_name} cuts, canvases, and finishes each garment in-house under master supervision.
            </p>

            {/* CountUp Stats Row */}
            <div className="mt-10 grid grid-cols-3 gap-5 border-t border-brass/30 pt-8">
              <div>
                <div className="font-serif text-3xl sm:text-4xl text-[#FBF6EB]">
                  <CountUp to={14} duration={1.4} suffix="d" />
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#FBF6EB]/60">
                  Avg Tailoring
                </p>
              </div>
              <div>
                <div className="font-serif text-3xl sm:text-4xl text-[#FBF6EB]">
                  <CountUp to={120} duration={1.8} suffix="+" />
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#FBF6EB]/60">
                  Mill Swatches
                </p>
              </div>
              <div>
                <div className="font-serif text-3xl sm:text-4xl text-[#E4C988]">
                  <CountUp to={100} duration={1.6} suffix="%" />
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#FBF6EB]/60">
                  In-House Cut
                </p>
              </div>
            </div>
          </div>

          {/* Cutting Table Workshop Photography */}
          <div className="relative overflow-hidden rounded-[28px] border border-brass/35 bg-charcoal shadow-2xl">
            <img
              src={settings.craft_image_url || "/images/atelier-craft.jpg"}
              alt="Master tailor chalking wool fabric on cutting table"
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="flex items-center justify-between border-t border-brass/25 px-5 py-3.5 text-xs text-[#FBF6EB]/80">
              <span className="font-mono uppercase tracking-[0.16em] text-[10px] text-[#D7B774]">
                Cutting Bench · {settings.city}
              </span>
              <span>Floating canvas · Hand-picked lapels</span>
            </div>
          </div>
        </div>

        {/* 3 React Bits Spotlight Cards */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {ATELIER_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <SpotlightCard
                key={pillar.index}
                theme="dark"
                spotlightColor="rgba(215, 183, 116, 0.25)"
                intensity={0.32}
                spotlightSize={260}
                borderGlow={0.75}
                className="flex flex-col justify-between rounded-[24px] border border-brass/25 bg-[#10291F]/85 p-7 min-h-[250px]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-[0.18em] text-[#D7B774]">
                    {pillar.index}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brass/35 bg-white/5 text-[#E4C988]">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="font-serif text-2xl font-normal text-[#FBF6EB]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#FBF6EB]/72">
                    {pillar.body}
                  </p>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
