"use client";

import React from "react";

const ATELIER_NOTES = [
  "Same-As-Shown Archive Orders",
  "Custom Silk & Mill Swatches",
  "Direct WhatsApp Tailor Consultations",
  "Hand-Zardozi & Full-Canvas Work",
  "Master-Drafted Individual Patterns",
  "Private Showroom & Video Fittings",
];

export function AtelierMarqueeStrip() {
  const repeated = [...ATELIER_NOTES, ...ATELIER_NOTES];

  return (
    <div className="border-y border-brass/45 bg-obsidian py-3.5 overflow-hidden select-none text-[#FBF6EB]">
      <div className="animate-atelier-marquee items-center gap-8 text-[11px] font-mono uppercase tracking-[0.22em] text-[#F5ECD9]/90">
        {repeated.map((note, idx) => (
          <div
            key={`${note}-${idx}`}
            className="flex items-center gap-8 shrink-0"
          >
            <span>{note}</span>
            <span
              className="h-1.5 w-1.5 rotate-45 bg-[#D7B774]"
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
