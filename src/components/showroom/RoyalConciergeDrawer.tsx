"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  Scissors,
  Sparkles,
  User,
  Video,
  X,
} from "lucide-react";
import { useShowroom } from "@/components/providers/ShowroomProvider";
import { RoyalBrandCrest } from "./BotanicalCornerMotif";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { playRoyalChime, playGoldClick } from "@/lib/sound";

type AppointmentType =
  | "In-Studio Salon Fitting"
  | "Virtual HD Video Consultation"
  | "Bridal Trousseau Curation";

export function RoyalConciergeDrawer() {
  const { settings } = useShowroom();
  const [isOpen, setIsOpen] = useState(false);

  const [appointmentType, setAppointmentType] =
    useState<AppointmentType>("In-Studio Salon Fitting");
  const [preferredCity, setPreferredCity] = useState("Jaipur Haveli Atelier");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredSlot, setPreferredSlot] = useState("Afternoon (2 PM – 5 PM)");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleOpen = () => {
    setIsOpen(true);
    playRoyalChime();
  };

  const handleClose = () => {
    setIsOpen(false);
    playGoldClick();
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    playRoyalChime();

    const briefLines = [
      `⚜️ *VIP PRIVATE SALON APPOINTMENT BRIEF* ⚜️`,
      `Brand: ${settings.brand_name}`,
      `----------------------------------------`,
      `• *Experience:* ${appointmentType}`,
      `• *Location/Mode:* ${appointmentType === "Virtual HD Video Consultation" ? "Virtual Video Drape" : preferredCity}`,
      `• *Date Requested:* ${preferredDate || "Earliest Available"}`,
      `• *Preferred Time:* ${preferredSlot}`,
      `• *Guest Name:* ${guestName || "VIP Patron"}`,
      guestPhone ? `• *Phone:* ${guestPhone}` : "",
      notes ? `• *Patron Requirements:* ${notes}` : "",
      `----------------------------------------`,
      `_Submitted via ${settings.brand_name} Digital Atelier VIP Concierge._`,
    ].filter(Boolean);

    const message = briefLines.join("\n");
    const href = `${buildWhatsAppHref(settings)}&text=${encodeURIComponent(message)}`;
    window.open(href, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Concierge Pill (Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={handleOpen}
          data-cursor="couture"
          aria-label="Open VIP Private Fitting Concierge"
          className="royal-glass-emerald group flex items-center gap-3 rounded-full border border-[#D7B774] px-4 py-2.5 sm:px-5 sm:py-3 shadow-[0_12px_32px_-8px_rgba(15,38,28,0.65),0_0_18px_rgba(215,183,116,0.35)] transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {/* Pulsating Gold Crown Icon */}
          <span className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D7B774] to-[#B99149] text-[#14261D] shadow-inner">
            <Sparkles className="h-4 w-4 text-[#14261D]" />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-white/60 animate-ping opacity-40"
            />
          </span>

          <div className="text-left">
            <span className="block font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#D7B774]">
              VIP Concierge
            </span>
            <span className="block font-serif text-xs sm:text-sm font-medium text-[#FFFDF8]">
              Private Studio Fitting
            </span>
          </div>
        </button>
      </div>

      {/* Slide-over Drawer / Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-label="VIP Atelier Concierge Appointment"
        >
          {/* Backdrop Click */}
          <div
            className="absolute inset-0"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Drawer Body */}
          <aside className="relative z-10 h-full w-full max-w-lg overflow-y-auto bg-gradient-to-b from-[#0F261C] to-[#0A1A13] text-[#FBF6EB] border-l border-[#D7B774]/50 shadow-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#D7B774]/25 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D7B774]/50 bg-[#153528]">
                    <RoyalBrandCrest className="h-5 w-8 text-[#D7B774]" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#D7B774]">
                      Private Atelier Salon
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl text-[#FFFDF8]">
                      Book a Private Trial
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close VIP Concierge"
                  className="rounded-full border border-white/15 p-2 text-white/70 hover:border-white hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-[#FBF6EB]/75 leading-relaxed">
                Experience bespoke garments draped in person with our master
                tailor over Darjeeling tea, or schedule a high-definition video
                consultation with custom fabric swatches shipped to your door.
              </p>

              {/* Form */}
              <form onSubmit={handleBook} className="mt-6 space-y-4">
                {/* 1. Appointment Type */}
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#D7B774] mb-2">
                    1. Consultation Format
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {(
                      [
                        "In-Studio Salon Fitting",
                        "Virtual HD Video Consultation",
                        "Bridal Trousseau Curation",
                      ] as AppointmentType[]
                    ).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAppointmentType(type)}
                        className={`flex items-center justify-between rounded-xl border p-3 text-xs sm:text-sm transition-all ${
                          appointmentType === type
                            ? "border-[#D7B774] bg-[#1B3E2F] text-white font-medium"
                            : "border-white/10 bg-white/5 text-[#FBF6EB]/75 hover:bg-white/10"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {type.includes("Video") ? (
                            <Video className="h-4 w-4 text-[#D7B774]" />
                          ) : type.includes("Bridal") ? (
                            <Sparkles className="h-4 w-4 text-[#D7B774]" />
                          ) : (
                            <Scissors className="h-4 w-4 text-[#D7B774]" />
                          )}
                          {type}
                        </span>
                        {appointmentType === type && (
                          <span className="font-mono text-[10px] text-[#D7B774]">
                            Selected
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Location (if in-studio) */}
                {appointmentType !== "Virtual HD Video Consultation" && (
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-[#D7B774] mb-1.5">
                      Atelier Lounge
                    </label>
                    <select
                      value={preferredCity}
                      onChange={(e) => setPreferredCity(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-[#FBF6EB] focus:border-[#D7B774] focus:outline-none"
                    >
                      <option value="Jaipur Haveli Atelier" className="bg-[#0F261C]">
                        Jaipur Haveli Atelier (Main Showroom)
                      </option>
                      <option value="Mumbai South Salon" className="bg-[#0F261C]">
                        Mumbai South Salon (Kala Ghoda)
                      </option>
                      <option value="Delhi Heritage Suite" className="bg-[#0F261C]">
                        Delhi Heritage Suite (Mehrauli)
                      </option>
                    </select>
                  </div>
                )}

                {/* 3. Preferred Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-[#D7B774] mb-1.5">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-[#FBF6EB] focus:border-[#D7B774] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-[#D7B774] mb-1.5">
                      Time Slot
                    </label>
                    <select
                      value={preferredSlot}
                      onChange={(e) => setPreferredSlot(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-[#FBF6EB] focus:border-[#D7B774] focus:outline-none"
                    >
                      <option value="Morning (11 AM – 2 PM)" className="bg-[#0F261C]">
                        11 AM – 2 PM
                      </option>
                      <option value="Afternoon (2 PM – 5 PM)" className="bg-[#0F261C]">
                        2 PM – 5 PM
                      </option>
                      <option value="Evening (5 PM – 8 PM)" className="bg-[#0F261C]">
                        5 PM – 8 PM
                      </option>
                    </select>
                  </div>
                </div>

                {/* 4. Guest Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-[#D7B774] mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maharani Gayatri"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs text-[#FBF6EB] focus:border-[#D7B774] focus:outline-none placeholder:text-white/30"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-[#D7B774] mb-1.5">
                      WhatsApp Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98000 00000"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs text-[#FBF6EB] focus:border-[#D7B774] focus:outline-none placeholder:text-white/30"
                    />
                  </div>
                </div>

                {/* 5. Notes */}
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#D7B774] mb-1.5">
                    Silhouettes or Occasion (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Looking for a bridal lehenga for November reception, interested in navy silk or saffron raw silk..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-[#FBF6EB] focus:border-[#D7B774] focus:outline-none placeholder:text-white/30"
                  />
                </div>

                {/* Submit to WhatsApp */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-royal-gold flex w-full items-center justify-center gap-2 rounded-full py-3.5 px-6 text-xs sm:text-sm font-semibold text-[#0F261C] shadow-lg transition-transform hover:scale-[1.02]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Confirm Salon Booking on WhatsApp</span>
                  </button>
                  <span className="mt-2 block text-center font-mono text-[10px] text-white/50">
                    Complimentary VIP consultation · Direct connection with Master Tailor
                  </span>
                </div>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
