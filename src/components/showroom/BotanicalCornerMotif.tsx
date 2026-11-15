"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Heirloom lotus & scalloped arch crest rendered above the dynamic brand title.
 */
export function RoyalBrandCrest({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 36"
      fill="none"
      aria-hidden="true"
      className={cn("h-7 w-12 text-brass", className)}
    >
      <path
        d="M32 4C34.5 9.5 39 12.5 39 16.8C39 20.4 35.8 23 32 23C28.2 23 25 20.4 25 16.8C25 12.5 29.5 9.5 32 4Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M32 9C33.4 12.2 35.5 14 35.5 16.5C35.5 18.6 33.9 20 32 20C30.1 20 28.5 18.6 28.5 16.5C28.5 14 30.6 12.2 32 9Z"
        fill="currentColor"
        fillOpacity="0.22"
      />
      <path
        d="M19 20C22.2 15.2 25.5 14 27 17.8C24.5 21.8 21.5 23.2 17.5 23.2C18 21.8 18.4 20.9 19 20Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M45 20C41.8 15.2 38.5 14 37 17.8C39.5 21.8 42.5 23.2 46.5 23.2C46 21.8 45.6 20.9 45 20Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M10 29H25.5M38.5 29H54"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.7"
        strokeLinecap="round"
      />
      <circle cx="32" cy="29" r="2.2" fill="currentColor" />
    </svg>
  );
}

/**
 * Botanical Mughal lotus & rose corner ornament framing the centerpiece courtyard arch.
 */
export function BotanicalCorner({
  position,
}: {
  position: "tl" | "tr" | "bl" | "br";
}) {
  const transformClass = {
    tl: "-top-4 -left-4",
    tr: "-top-4 -right-4 scale-x-[-1]",
    bl: "-bottom-4 -left-4 scale-y-[-1]",
    br: "-bottom-4 -right-4 scale-[-1]",
  }[position];

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-20 h-24 w-24 sm:h-28 sm:w-28 drop-shadow-sm",
        transformClass
      )}
    >
      {/* Delicate gold filigree vine stem */}
      <path
        d="M12 96C14 58 34 28 88 14"
        stroke="#B99149"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />
      <path
        d="M22 68C28 48 45 34 68 25"
        stroke="#4D725F"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />
      {/* Ivory-emerald rose blooms */}
      <circle cx="28" cy="30" r="14" fill="#FBF6EB" stroke="#B99149" strokeWidth="1.2" />
      <circle cx="28" cy="30" r="8" fill="#E9EFE7" stroke="#5A7A68" strokeWidth="0.9" />
      <circle cx="28" cy="30" r="3.2" fill="#B99149" fillOpacity="0.7" />
      <circle cx="56" cy="20" r="9.5" fill="#FBF6EB" stroke="#B99149" strokeWidth="1.1" />
      <circle cx="56" cy="20" r="4.5" fill="#EDE3CC" />
      <circle cx="19" cy="58" r="9" fill="#FBF6EB" stroke="#B99149" strokeWidth="1.1" />
      <circle cx="19" cy="58" r="4" fill="#E7EFE9" />
      {/* Botanical sage leaves */}
      <path
        d="M40 42C48 40 54 46 53 54C45 54 40 49 40 42Z"
        fill="#DCE6DC"
        stroke="#5C7C68"
        strokeWidth="0.9"
      />
      <path
        d="M68 15C76 11 84 13 88 20C80 23 73 21 68 15Z"
        fill="#DCE6DC"
        stroke="#5C7C68"
        strokeWidth="0.9"
      />
      <path
        d="M13 74C19 72 25 76 26 84C19 84 14 80 13 74Z"
        fill="#DCE6DC"
        stroke="#5C7C68"
        strokeWidth="0.9"
      />
    </svg>
  );
}

/**
 * Subtle watermark ornament used on the three floating Hero consultation cards.
 */
export function CardFloralWatermark() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute right-0 bottom-0 h-16 w-16 opacity-35"
    >
      <path
        d="M78 16C62 24 44 42 26 78"
        stroke="#B99149"
        strokeWidth="1"
        strokeOpacity="0.55"
      />
      <circle cx="62" cy="54" r="10" fill="#EFE4CE" stroke="#B99149" strokeWidth="0.8" />
      <circle cx="62" cy="54" r="4" fill="#D5DEC8" />
      <path
        d="M44 64C48 56 54 53 60 56C56 62 50 66 44 64Z"
        fill="#E1E8DB"
        stroke="#708A77"
        strokeWidth="0.7"
      />
    </svg>
  );
}

/**
 * Symmetrical gold divider flanking centered editorial section titles like "Signature Collections".
 */
export function RoyalSectionHeading({
  eyebrow,
  title,
  accent,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      {eyebrow && (
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-brass">
          {eyebrow}
        </span>
      )}
      <div className="mt-2.5 flex items-center justify-center gap-4 sm:gap-6">
        <span
          aria-hidden="true"
          className="hidden sm:block h-px flex-1 max-w-[110px] bg-gradient-to-r from-transparent via-brass/60 to-brass"
        />
        <span
          aria-hidden="true"
          className="hidden sm:block h-1.5 w-1.5 rotate-45 bg-brass"
        />
        <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] tracking-[0.04em] text-ink font-normal">
          {title}{" "}
          {accent && <span className="font-serif italic text-obsidian">{accent}</span>}
        </h2>
        <span
          aria-hidden="true"
          className="hidden sm:block h-1.5 w-1.5 rotate-45 bg-brass"
        />
        <span
          aria-hidden="true"
          className="hidden sm:block h-px flex-1 max-w-[110px] bg-gradient-to-l from-transparent via-brass/60 to-brass"
        />
      </div>
      {subtitle && (
        <p className="mt-3 text-sm leading-relaxed text-taupe max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
