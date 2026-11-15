"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Menu,
  MessageCircle,
  RotateCcw,
  Settings2,
  ShoppingBag,
  Sparkles,
  User,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useShowroom } from "@/components/providers/ShowroomProvider";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { RoyalBrandCrest } from "./BotanicalCornerMotif";
import {
  isSoundEnabled,
  setSoundEnabled,
  playGoldClick,
  playRoyalChime,
} from "@/lib/sound";

const LEFT_LINKS = [
  { label: "Weaves", href: "/#fabrics" },
  { label: "About Us", href: "/#process" },
  { label: "Custom Fit", href: "/#custom-order" },
  { label: "Couture", href: "/#catalogue", hasCaret: true },
];

const RIGHT_LINKS = [
  { label: "Home", href: "/" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const { settings } = useShowroom();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playGoldClick();
      playRoyalChime();
    }
  };

  const triggerReplayUnveiling = () => {
    playGoldClick();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("replay-atelier-unveiling"));
    }
  };

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [mobileOpen]);

  const waHref = buildWhatsAppHref(settings);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-400",
          scrolled
            ? "backdrop-blur-2xl bg-[#FBF6EB]/90 border-b border-[#D7B774]/35 shadow-[0_12px_32px_-12px_rgba(20,53,40,0.18)] py-2.5"
            : "bg-gradient-to-b from-[#FBF6EB]/95 via-[#FBF6EB]/80 to-transparent py-3.5"
        )}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          {/* Left Emerald Capsule Navigation (Desktop) */}
          <nav
            aria-label="Primary couture sections"
            className="royal-glass-emerald hidden lg:flex items-center rounded-full px-2 py-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_24px_-6px_rgba(15,38,28,0.45)] border border-[#D7B774]/50"
          >
            {LEFT_LINKS.map((item, idx) => (
              <React.Fragment key={item.href}>
                {idx > 0 && (
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-px bg-brass/35 mx-0.5"
                  />
                )}
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[12px] font-medium tracking-[0.04em] text-[#FBF6EB]/90 transition-all duration-200 hover:bg-white/12 hover:text-white"
                >
                  <span>{item.label}</span>
                  {item.hasCaret && (
                    <ChevronDown className="h-3 w-3 text-[#D7B774]" />
                  )}
                </Link>
              </React.Fragment>
            ))}
          </nav>

          {/* Center Royal Crest & Dynamic Atelier Wordmark */}
          <Link
            href="/"
            className="flex flex-col items-center text-center group min-w-0 lg:mx-auto"
            aria-label={settings.brand_name}
          >
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.brand_name}
                className="mb-1 h-8 w-8 rounded-full object-cover border border-brass/55 shadow-sm"
              />
            ) : (
              <RoyalBrandCrest className="h-6 w-11 text-brass transition-transform duration-400 group-hover:scale-110" />
            )}
            <span className="truncate font-display text-lg sm:text-[22px] tracking-[0.18em] text-ink font-medium leading-none uppercase transition-colors group-hover:text-obsidian">
              {settings.brand_name}
            </span>
            <span className="mt-0.5 truncate font-serif text-[12px] sm:text-[13px] italic tracking-wide text-obsidian/85">
              {settings.tagline}
            </span>
          </Link>

          {/* Right Emerald Capsule + Audio & Unveil Actions (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Audio Ambiance Synthesizer Pill */}
                        <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.removeItem("atelier_unveiled_v4");
                } catch {}
                window.dispatchEvent(new CustomEvent("atelier:reopen_gates"));
              }}
              title="Reopen Royal Palace Gates"
              aria-label="Reopen Royal Palace Gates"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brass/45 bg-obsidian text-[#D7B774]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggleSound}
              title={soundOn ? "Mute Royal Sound" : "Enable Royal Harmonic Sound"}
              className="royal-glass-emerald flex items-center gap-2 rounded-full px-3 py-1.5 border border-[#D7B774]/50 text-xs font-mono tracking-wider text-[#E6CA85] transition-all hover:scale-105 hover:border-[#D7B774]"
            >
              {soundOn ? (
                <>
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-[#D7B774] rounded-full h-3 animate-pulse" />
                    <span className="w-0.5 bg-[#D7B774] rounded-full h-2 animate-pulse [animation-delay:150ms]" />
                    <span className="w-0.5 bg-[#D7B774] rounded-full h-3.5 animate-pulse [animation-delay:300ms]" />
                  </div>
                  <span className="text-[11px] uppercase">Audio</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3 w-3 text-[#D7B774]/60" />
                  <span className="text-[11px] uppercase text-[#FBF6EB]/60">Mute</span>
                </>
              )}
            </button>

            {/* Replay Grand Unveiling Pill */}
            <button
              type="button"
              onClick={triggerReplayUnveiling}
              title="Replay Royal Welcoming Ceremony"
              className="royal-glass-emerald flex h-8 w-8 items-center justify-center rounded-full border border-brass/50 text-[#D7B774] shadow-sm transition-all hover:scale-110 hover:border-brass hover:shadow-[0_0_14px_rgba(215,183,116,0.4)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Nav Links Capsule */}
            <nav
              aria-label="Home and contact links"
              className="royal-glass-emerald flex items-center rounded-full px-2 py-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_24px_-6px_rgba(15,38,28,0.45)] border border-[#D7B774]/50"
            >
              {RIGHT_LINKS.map((item, idx) => (
                <React.Fragment key={item.href}>
                  {idx > 0 && (
                    <span
                      aria-hidden="true"
                      className="h-3.5 w-px bg-brass/35 mx-0.5"
                    />
                  )}
                  <Link
                    href={item.href}
                    className="rounded-full px-3.5 py-1.5 text-[12px] font-medium tracking-[0.04em] text-[#FBF6EB]/90 transition-all duration-200 hover:bg-white/12 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>

                        {/* Replay Palace Welcome Gates */}
            <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.removeItem("atelier_unveiled_v4");
                } catch {}
                window.dispatchEvent(new CustomEvent("atelier:reopen_gates"));
              }}
              title="Reopen Royal Palace Gates"
              aria-label="Reopen Royal Palace Gates"
              className="royal-glass-emerald flex h-8 w-8 items-center justify-center rounded-full border border-brass/50 text-[#D7B774] shadow-sm transition-all duration-300 hover:scale-110 hover:border-brass hover:shadow-[0_0_16px_rgba(215,183,116,0.45)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Admin Studio */}
            <Link
              href="/admin"
              title="Atelier Admin Studio"
              aria-label="Atelier Admin Studio"
              className="royal-glass-emerald flex h-8 w-8 items-center justify-center rounded-full border border-brass/50 text-[#FBF6EB] shadow-sm transition-all duration-300 hover:scale-110 hover:border-brass hover:shadow-[0_0_16px_rgba(215,183,116,0.45)]"
            >
              <User className="h-3.5 w-3.5 text-[#D7B774]" />
            </Link>

            {/* Direct WhatsApp Bag */}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              title="Direct WhatsApp Atelier"
              aria-label="Direct WhatsApp Atelier"
              className="royal-glass-emerald flex h-8 w-8 items-center justify-center rounded-full border border-brass/50 text-[#FBF6EB] shadow-sm transition-all duration-300 hover:scale-110 hover:border-brass hover:shadow-[0_0_16px_rgba(215,183,116,0.45)]"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-[#D7B774]" />
            </a>
          </div>

          {/* Mobile Quick Actions */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleSound}
              aria-label="Toggle Sound"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brass/45 bg-obsidian text-[#D7B774]"
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <Link
              href="/admin"
              aria-label="Atelier Admin Studio"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brass/45 bg-obsidian text-[#D7B774]"
            >
              <Settings2 className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brass/55 bg-obsidian text-[#FBF6EB]"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0F261C]/97 text-[#FBF6EB] backdrop-blur-xl flex flex-col justify-between p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex items-center justify-between border-b border-brass/25 pb-4">
            <div className="flex items-center gap-2.5">
              <RoyalBrandCrest className="h-5 w-9 text-[#D7B774]" />
              <span className="font-display text-base tracking-[0.16em] uppercase">
                {settings.brand_name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brass/35 text-[#FBF6EB]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex flex-col gap-4 my-auto">
            {[
              { label: "Four Royal Weaves", href: "/#fabrics" },
              { label: "Signature Collections", href: "/#catalogue" },
              { label: "Editorial Lookbook", href: "/#lookbook" },
              { label: "Craftsmanship & Fit", href: "/#process" },
              { label: "Custom Design Brief", href: "/#custom-order" },
              { label: "Showroom & Contact", href: "/#contact" },
            ].map((item, idx) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-baseline justify-between border-b border-brass/18 pb-2.5 font-serif text-2xl text-[#FBF6EB]"
              >
                <span>{item.label}</span>
                <span className="font-mono text-xs text-[#D7B774]">
                  0{idx + 1}
                </span>
              </Link>
            ))}

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                triggerReplayUnveiling();
              }}
              className="flex items-center gap-2 pt-2 font-mono text-xs uppercase tracking-[0.18em] text-[#D7B774]"
            >
              <Sparkles className="h-4 w-4" />
              Replay Royal Welcoming Ceremony
            </button>

            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 pt-1 font-mono text-xs uppercase tracking-[0.18em] text-white/70"
            >
              <Settings2 className="h-4 w-4 text-[#D7B774]" />
              Open Atelier Admin Studio
            </Link>
          </nav>

          <div className="space-y-3 border-t border-brass/25 pt-4">
            <p className="text-xs text-[#FBF6EB]/70">
              {settings.address} · {settings.city}
            </p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="btn-royal-gold flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-medium"
            >
              <MessageCircle className="h-4 w-4" />
              Direct WhatsApp Consultation
            </a>
          </div>
        </div>
      )}
    </>
  );
}
