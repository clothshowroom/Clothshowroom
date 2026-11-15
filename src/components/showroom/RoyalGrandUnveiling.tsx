"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Sparkles, Volume2, VolumeX, ArrowRight } from "lucide-react";
import { useShowroom } from "@/components/providers/ShowroomProvider";
import { RoyalBrandCrest } from "./BotanicalCornerMotif";
import {
  isSoundEnabled,
  setSoundEnabled,
  playRoyalChime,
  playGoldClick,
} from "@/lib/sound";

const SESSION_KEY = "atelier_unveiled_v2";

export function RoyalGrandUnveiling() {
  const { settings } = useShowroom();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [opening, setOpening] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [progress, setProgress] = useState(15);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = useCallback(() => {
    if (opening) return;
    setOpening(true);

    if (soundOn) {
      playRoyalChime();
    }

    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Ignore in private browsing
    }

    // Allow door slide animation (850ms) to complete before unmounting
    setTimeout(() => {
      setVisible(false);
      setOpening(false);
    }, 950);
  }, [opening, soundOn]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playGoldClick();
  };

  useEffect(() => {
    setMounted(true);
    setSoundOn(isSoundEnabled());

    let hasSeen = false;
    try {
      hasSeen = sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      hasSeen = false;
    }

    if (!hasSeen) {
      setVisible(true);

      // Smooth progress animation 15% -> 100%
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 12;
        });
      }, 160);

      // Auto-reveal after 2.8s so user is never blocked or irritated
      autoTimerRef.current = setTimeout(() => {
        handleOpen();
      }, 2900);

      return () => {
        clearInterval(interval);
        if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      };
    }
  }, [handleOpen]);

  // Replay event listener for Navbar & Footer "Replay Grand Unveiling" buttons
  useEffect(() => {
    const onReplay = () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      setProgress(100);
      setOpening(false);
      setVisible(true);
    };

    window.addEventListener("replay-atelier-unveiling", onReplay);
    return () => window.removeEventListener("replay-atelier-unveiling", onReplay);
  }, []);

  // Keyboard shortcut: Press Enter or Space to unveil
  useEffect(() => {
    if (!visible || opening) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
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
      aria-label="Atelier Welcoming Unveiling"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden select-none"
    >
      {/* LEFT VELVET GRAND PORTAL DOOR */}
      <div
        className={`absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#0A1A13] via-[#0F261C] to-[#153528] border-r border-[#D7B774]/60 transition-transform duration-900 ease-[cubic-bezier(0.85,0,0.15,1)] ${
          opening ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Subtle Mughal Damask Watermark */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#d7b774_1.2px,transparent_1.2px)] [background-size:24px_24px]"
        />
        {/* Inner Gold Filigree Trim Line */}
        <div
          aria-hidden="true"
          className="absolute inset-y-6 right-6 w-px bg-gradient-to-b from-transparent via-[#D7B774]/40 to-transparent"
        />
      </div>

      {/* RIGHT VELVET GRAND PORTAL DOOR */}
      <div
        className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#0A1A13] via-[#0F261C] to-[#153528] border-l border-[#D7B774]/60 transition-transform duration-900 ease-[cubic-bezier(0.85,0,0.15,1)] ${
          opening ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Subtle Mughal Damask Watermark */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#d7b774_1.2px,transparent_1.2px)] [background-size:24px_24px]"
        />
        {/* Inner Gold Filigree Trim Line */}
        <div
          aria-hidden="true"
          className="absolute inset-y-6 left-6 w-px bg-gradient-to-b from-transparent via-[#D7B774]/40 to-transparent"
        />
      </div>

      {/* CENTER WELCOMING COUTURE MEDALLION & GREETING */}
      <div
        className={`relative z-20 flex h-full w-full flex-col items-center justify-center px-6 text-center transition-all duration-700 ${
          opening ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        {/* Sound Toggle Pill (Top Right) */}
        <button
          type="button"
          onClick={toggleSound}
          className="absolute top-6 right-6 inline-flex items-center gap-2 rounded-full border border-[#D7B774]/45 bg-[#0F261C]/80 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#E6CA85] backdrop-blur-md transition-all hover:border-[#D7B774] hover:bg-[#153528]"
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

        {/* Embossed Royal Medallion */}
        <div className="relative mb-6 flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center">
          {/* Rotating dashed antique gold halo */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-dashed border-[#D7B774]/40 animate-[spin_35s_linear_infinite]"
          />
          {/* Frosted Gold Seal Disc */}
          <div className="royal-glass-emerald flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full border-2 border-[#D7B774] shadow-[0_0_35px_rgba(215,183,116,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)]">
            <RoyalBrandCrest className="h-10 w-16 text-[#E6CA85]" />
          </div>
          {/* Subtle sparkle accent */}
          <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-[#FFE9AD] animate-pulse" />
        </div>

        {/* Royal Salutation & Invitation */}
        <span className="font-mono text-xs sm:text-[13px] uppercase tracking-[0.32em] text-[#D7B774]">
          Shubh Aagaman · Private Invitation
        </span>

        <h1 className="mt-3 font-display text-3xl sm:text-5xl lg:text-6xl uppercase tracking-[0.16em] text-[#FBF6EB] font-normal drop-shadow-md">
          {settings.brand_name}
        </h1>

        <p className="mt-2 font-serif text-lg sm:text-xl italic text-[#D7B774]/95 max-w-lg">
          {settings.tagline || "Heritage of Indian Craftsmanship & Bespoke Couture"}
        </p>

        <p className="mt-3 font-sans text-xs sm:text-sm text-[#FBF6EB]/70 max-w-md leading-relaxed">
          Step into a private sanctuary of hand-knotted zari silks, hand-carved
          zardozi lehengas, and master-tailored royal silhouettes.
        </p>

        {/* Couture Unveil Progress Bar */}
        <div className="mt-8 w-56 sm:w-64">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10 border border-[#D7B774]/30">
            <div
              className="h-full bg-gradient-to-r from-[#B99149] via-[#E6CA85] to-[#FFFDF8] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="mt-2 block font-mono text-[10px] uppercase tracking-widest text-[#D7B774]/75">
            Unveiling Archive {progress}%
          </span>
        </div>

        {/* Primary Welcoming Action */}
        <button
          type="button"
          onClick={handleOpen}
          className="btn-royal-gold mt-6 inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-xs sm:text-sm font-semibold tracking-wider text-[#14261D] shadow-[0_12px_28px_-6px_rgba(215,183,116,0.5)] transition-all hover:scale-105 active:scale-95"
        >
          <span>Enter Private Atelier</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <span className="mt-4 font-mono text-[11px] text-[#FBF6EB]/40">
          Press [Space] or [Enter] to enter immediately
        </span>
      </div>
    </div>
  );
}
