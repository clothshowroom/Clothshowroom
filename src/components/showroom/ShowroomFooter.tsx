"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useShowroom } from "@/components/providers/ShowroomProvider";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { playGoldClick } from "@/lib/sound";

export function ShowroomFooter() {
  const { settings } = useShowroom();
  const waHref = buildWhatsAppHref(settings);

  const triggerReplay = () => {
    playGoldClick();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("replay-atelier-unveiling"));
    }
  };

  return (
    <footer
      id="contact"
      className="border-t border-[#D7B774]/30 bg-[#0F261C] text-[#FBF6EB]"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">
          {/* Dynamic Brand Identity */}
          <div>
            <div className="flex items-center gap-3">
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.brand_name}
                  className="h-10 w-10 rounded-full object-cover border border-brass/40"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brass/50 bg-white/5 font-serif text-sm text-[#D7B774]">
                  {settings.short_mark || "AV"}
                </span>
              )}
              <div>
                <h2 className="font-serif text-2xl tracking-[0.14em] uppercase text-[#FFFDF8]">
                  {settings.brand_name}
                </h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D7B774]">
                  {settings.tagline}
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-[#FBF6EB]/70 font-light">
              Private haveli showroom curating authentic Indian haute couture.
              Every lehenga, saree drape, bandhgala, and anarkali is individually
              hand-chalked, cut, and tailored to bespoke posture.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-royal-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-[#0F261C]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Private Consultation</span>
              </a>

              <button
                type="button"
                onClick={triggerReplay}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#D7B774]/40 bg-white/5 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#D7B774] hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Replay Welcoming Ceremony</span>
              </button>
            </div>
          </div>

          {/* Atelier Salon Address */}
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D7B774]">
              Haveli Salon & Lounge
            </span>
            <div className="mt-4 space-y-3.5 text-sm text-[#FBF6EB]/80 font-light">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#D7B774] shrink-0 mt-0.5" />
                <span>
                  {settings.address}, {settings.city}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-[#D7B774] shrink-0 mt-0.5" />
                <span>{settings.opening_hours}</span>
              </div>
              <p className="border-l-2 border-[#D7B774]/60 pl-3 font-mono text-xs text-[#D7B774]">
                {settings.turnaround_note}
              </p>
            </div>
          </div>

          {/* Direct Concierge Contact */}
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D7B774]">
              Direct Haute Concierge
            </span>
            <div className="mt-4 space-y-3 text-sm text-[#FBF6EB]/80 font-light">
              <a
                href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-3 hover:text-[#E4C988] transition-colors"
              >
                <Phone className="h-4 w-4 text-[#D7B774]" />
                <span>{settings.phone}</span>
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-3 hover:text-[#E4C988] transition-colors"
              >
                <Mail className="h-4 w-4 text-[#D7B774]" />
                <span>{settings.email}</span>
              </a>
              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      sessionStorage.removeItem("atelier_unveiled_v4");
                    } catch {}
                    window.dispatchEvent(new CustomEvent("atelier:reopen_gates"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-brass/35 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#FBF6EB]/80 hover:border-[#D7B774] hover:text-[#E4C988] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-[#D7B774]" />
                  Reopen Palace Gates
                </button>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-full border border-brass/35 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#FBF6EB]/80 hover:border-[#D7B774] hover:text-[#E4C988] transition-colors"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  Atelier Admin Studio
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Navigation Strip */}
        <div className="mt-14 flex flex-col gap-4 border-t border-brass/25 pt-6 text-xs text-[#FBF6EB]/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.brand_name}. All details managed live via Atelier Admin.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link href="/#fabrics" className="hover:text-white transition-colors">
              Royal Weaves
            </Link>
            <Link href="/#catalogue" className="hover:text-white transition-colors">
              Archive
            </Link>
            <Link href="/#lookbook" className="hover:text-white transition-colors">
              Lookbook
            </Link>
            <Link href="/#custom-order" className="hover:text-white transition-colors">
              Custom Brief
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
