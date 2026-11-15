"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Sparkles, Volume2, VolumeX, ArrowRight, X } from "lucide-react";
import { useShowroom } from "@/components/providers/ShowroomProvider";
import { RoyalBrandCrest } from "./BotanicalCornerMotif";
import {
  isSoundEnabled,
  setSoundEnabled,
  playRoyalChime,
  playGoldClick,
} from "@/lib/sound";

const SESSION_KEY = "atelier_unveiled_v4";

/**
 * Antique Brass Door Knocker / Haveli Ring SVG
 */
function BrassDoorKnocker({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 flex flex-col items-center ${
        side === "left" ? "right-7 sm:right-12" : "left-7 sm:left-12"
      }`}
    >
      {/* Decorative brass backplate */}
      <svg
        viewBox="0 0 60 90"
        fill="none"
        aria-hidden="true"
        className="h-20 w-14 sm:h-28 sm:w-20 text-[#D7B774] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
      >
        {/* Scalloped rosette base */}
        <circle cx="30" cy="24" r="16" fill="#1C140E" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="30" cy="24" r="11" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
        <circle cx="30" cy="24" r="5" fill="currentColor" />

        {/* Heavy hinged ring knocker */}
        <path
          d="M17 28 C17 50, 43 50, 43 28 C43 22, 17 22, 17 28 Z"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Bottom brass strike stud */}
        <circle cx="30" cy="68" r="4.5" fill="currentColor" stroke="#FFF" strokeWidth="0.8" />
        <line x1="30" y1="73" x2="30" y2="82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-[#D7B774]/70 hidden sm:block">
        {side === "left" ? "Pull" : "Enter"}
      </span>
    </div>
  );
}

export function RoyalGrandUnveiling() {
  const { settings } = useShowroom();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [opening, setOpening] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback(() => {
    if (opening) return;
    setOpening(true);

    // Immediately restore body scroll so page becomes interactive
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }

    if (soundOn) {
      playRoyalChime();
    }

    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Ignore private browsing error
    }

    // Allow door swing animation (1.35s) to complete before unmounting from DOM
    setTimeout(() => {
      setVisible(false);
      setOpening(false);
    }, 1400);
  }, [opening, soundOn]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playGoldClick();
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpen();
  };

  useEffect(() => {
    setMounted(true);
    setSoundOn(isSoundEnabled());

    const handleReopen = () => {
      setVisible(true);
      setOpening(false);
      if (typeof document !== "undefined") {
        document.body.style.overflow = "hidden";
      }
    };
    window.addEventListener("atelier:reopen_gates", handleReopen);

    let hasSeen = false;
    try {
      hasSeen = sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      hasSeen = false;
    }

    if (!hasSeen) {
      setVisible(true);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Replay event listener for Navbar & Footer buttons
  useEffect(() => {
    const onReplay = () => {
      setOpening(false);
      setVisible(true);
      document.body.style.overflow = "hidden";
    };

    window.addEventListener("replay-atelier-unveiling", onReplay);
    return () => window.removeEventListener("replay-atelier-unveiling", onReplay);
  }, []);

  // Keyboard shortcut: Any key (Space, Enter, Esc, Down arrow) unlocks doors
  useEffect(() => {
    if (!visible || opening) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "Enter" ||
        e.key === " " ||
        e.key === "Escape" ||
        e.key === "ArrowDown"
      ) {
        e.preventDefault();
        handleOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, opening, handleOpen]);

  if (!mounted || !visible) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Royal Palace Gate Unveiling"
      onClick={handleOpen}
      className={`fixed inset-0 z-50 overflow-hidden cursor-pointer select-none pointer-events-auto ${
        opening ? "pointer-events-none" : ""
      }`}
      style={{ perspective: "1500px" }}
    >
      {/* Background Radiance that shines through the door seam when opening */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,244,214,0.45)_0%,rgba(215,183,116,0.18)_40%,transparent_75%)] transition-opacity duration-1000 ${
          opening ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* ============================================================== */}
      {/* LEFT ROYAL PALACE HAVELI GATE (Swings open on left hinge)      */}
      {/* ============================================================== */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 border-r-2 border-[#D7B774]"
        style={{
          transformOrigin: "left center",
          transform: opening
            ? "perspective(1400px) rotateY(-88deg) translateX(-14%)"
            : "perspective(1400px) rotateY(0deg) translateX(0%)",
          transition: "transform 1.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 1.35s ease",
          background:
            "linear-gradient(135deg, #091710 0%, #11261B 45%, #183829 80%, #0F241A 100%)",
          boxShadow: opening
            ? "none"
            : "inset -8px 0 35px rgba(0,0,0,0.85), 0 0 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Carved Mughal Arch Inset Panels */}
        <div
          aria-hidden="true"
          className="absolute inset-4 sm:inset-8 border border-[#D7B774]/40 rounded-xl bg-gradient-to-r from-transparent to-[#D7B774]/5"
        >
          <div className="absolute inset-3 sm:inset-5 border border-dashed border-[#D7B774]/25 rounded-lg" />
        </div>

        {/* Golden Studs / Gulmekh on Door Plank */}
        <div
          aria-hidden="true"
          className="absolute inset-y-8 right-3 flex flex-col justify-between py-4"
        >
          {[...Array(9)].map((_, i) => (
            <span
              key={i}
              className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-gradient-to-br from-[#FFE9AD] via-[#D7B774] to-[#8C6B28] shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
            />
          ))}
        </div>

        {/* Left Heavy Brass Ring Knocker */}
        <BrassDoorKnocker side="left" />
      </div>

      {/* ============================================================== */}
      {/* RIGHT ROYAL PALACE HAVELI GATE (Swings open on right hinge)    */}
      {/* ============================================================== */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 border-l-2 border-[#D7B774]"
        style={{
          transformOrigin: "right center",
          transform: opening
            ? "perspective(1400px) rotateY(88deg) translateX(14%)"
            : "perspective(1400px) rotateY(0deg) translateX(0%)",
          transition: "transform 1.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 1.35s ease",
          background:
            "linear-gradient(225deg, #091710 0%, #11261B 45%, #183829 80%, #0F241A 100%)",
          boxShadow: opening
            ? "none"
            : "inset 8px 0 35px rgba(0,0,0,0.85), 0 0 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Carved Mughal Arch Inset Panels */}
        <div
          aria-hidden="true"
          className="absolute inset-4 sm:inset-8 border border-[#D7B774]/40 rounded-xl bg-gradient-to-l from-transparent to-[#D7B774]/5"
        >
          <div className="absolute inset-3 sm:inset-5 border border-dashed border-[#D7B774]/25 rounded-lg" />
        </div>

        {/* Golden Studs / Gulmekh on Door Plank */}
        <div
          aria-hidden="true"
          className="absolute inset-y-8 left-3 flex flex-col justify-between py-4"
        >
          {[...Array(9)].map((_, i) => (
            <span
              key={i}
              className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-gradient-to-br from-[#FFE9AD] via-[#D7B774] to-[#8C6B28] shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
            />
          ))}
        </div>

        {/* Right Heavy Brass Ring Knocker */}
        <BrassDoorKnocker side="right" />
      </div>

      {/* ============================================================== */}
      {/* CENTER ORNATE ROYAL CREST & GREETING OVERLAY                   */}
      {/* ============================================================== */}
      <div
        className={`relative z-30 flex h-full w-full flex-col items-center justify-center px-4 sm:px-6 text-center transition-all duration-700 ${
          opening ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        {/* Top Controls: Sound Toggle & Quick Skip */}
        <div className="absolute top-5 inset-x-5 flex items-center justify-between z-40">
          <button
            type="button"
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="inline-flex items-center gap-2 rounded-full border border-[#D7B774]/50 bg-[#0F261C]/85 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#E6CA85] backdrop-blur-md transition-all hover:border-[#D7B774] hover:bg-[#153528]"
          >
            {soundOn ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-[#D7B774]" />
                <span>Sound: On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-[#D7B774]/60" />
                <span>Sound: Off</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            aria-label="Skip Welcoming Gate"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white/70 hover:text-white hover:border-[#D7B774] transition-colors"
          >
            <span>Skip to Storefront</span>
            <X className="h-3.5 w-3.5 text-[#D7B774]" />
          </button>
        </div>

        {/* Central Royal Medallion on the Gate Seam */}
        <div className="relative mb-5 flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center">
          {/* Animated Gold Ring Halo */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-dashed border-[#D7B774]/50 animate-[spin_40s_linear_infinite]"
          />
          {/* Frosted Gold Seal Core */}
          <div className="royal-glass-emerald flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full border-2 border-[#D7B774] shadow-[0_0_40px_rgba(215,183,116,0.5),inset_0_1px_3px_rgba(255,255,255,0.6)]">
            <RoyalBrandCrest className="h-10 w-16 text-[#FFE4A3]" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-[#FFE9AD] animate-pulse" />
        </div>

        {/* Welcoming Salutation */}
        <span className="font-mono text-xs sm:text-[13px] uppercase tracking-[0.32em] text-[#D7B774] drop-shadow">
          Shubh Aagaman · शुभ आगमन
        </span>

        <h1 className="mt-3 font-display text-3xl sm:text-5xl lg:text-6xl uppercase tracking-[0.16em] text-[#FFFDF8] font-normal drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          {settings.brand_name}
        </h1>

        <p className="mt-2 font-serif text-lg sm:text-2xl italic text-[#D7B774] max-w-lg drop-shadow">
          {settings.tagline || "Heritage of Indian Craftsmanship & Bespoke Couture"}
        </p>

        <p className="mt-3 font-sans text-xs sm:text-sm text-[#FBF6EB]/80 max-w-md leading-relaxed">
          Step into a private sanctuary of hand-knotted zari silks, hand-carved
          zardozi lehengas, and master-tailored royal silhouettes.
        </p>

        {/* Big Tactile Open Button */}
        <div className="mt-7 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleOpen}
            className="btn-royal-gold inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-xs sm:text-sm font-semibold tracking-wider text-[#14261D] shadow-[0_12px_32px_rgba(215,183,116,0.55)] transition-all hover:scale-105 active:scale-95"
          >
            <span>Open Palace Gates</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D7B774]/80 animate-pulse">
            ✨ Tap anywhere on the gates to enter ✨
          </span>
        </div>
      </div>
    </div>
  );
}
