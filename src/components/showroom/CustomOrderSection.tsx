"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  MessageCircle,
  Ruler,
  Scissors,
} from "lucide-react";
import { useShowroom } from "@/components/providers/ShowroomProvider";
import Magnet from "@/components/react-bits/Magnet/Magnet";
import type { CustomMeasurements } from "@/lib/types";
import { cn } from "@/lib/utils";
import { buildOrderWhatsAppMessage, buildWhatsAppHref } from "@/lib/whatsapp";

const SILHOUETTES = [
  "Bespoke Suit / Tuxedo",
  "Bandhgala / Sherwani",
  "Couture Saree-Gown / Drape",
  "Custom Kurta & Jacket Set",
  "Resort Linen Co-ord",
  "Your Own Reference Design",
];

const FABRICS = [
  "Super 150s Italian Wool",
  "Handloom Raw Silk",
  "Irish Linen (340gsm)",
  "Silk Crepe / Organza",
  "Velvet & Jacquard",
  "Recommend Fabric Swatches",
];

export function CustomOrderSection() {
  const { settings, submitInquiry } = useShowroom();

  const [garmentType, setGarmentType] = useState(SILHOUETTES[0]);
  const [fabric, setFabric] = useState(FABRICS[0]);
  const [colorPreference, setColorPreference] = useState("");
  const [occasionDate, setOccasionDate] = useState("");
  const [fitPreference, setFitPreference] = useState("Savile Tailored");
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [measurements, setMeasurements] = useState<CustomMeasurements>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const briefMessage = useMemo(() => {
    return buildOrderWhatsAppMessage({
      inquiryType: "bespoke_request",
      brandName: settings.brand_name,
      productName: garmentType,
      orderMode: "Custom Measurements",
      preferredFabric: fabric,
      preferredColor: colorPreference.trim() || "Suggest Best Swatches",
      fitPreference,
      occasionOrDate: occasionDate.trim(),
      customerName: customerName.trim() || "Atelier Client",
      customerPhone: customerPhone.trim(),
      customerCity: customerCity.trim(),
      measurements,
      notes,
    });
  }, [
    settings.brand_name,
    garmentType,
    fabric,
    colorPreference,
    fitPreference,
    occasionDate,
    customerName,
    customerPhone,
    customerCity,
    measurements,
    notes,
  ]);

  const waHref = buildWhatsAppHref(settings, briefMessage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await submitInquiry({
      inquiry_type: "bespoke_request",
      product_id: null,
      product_name: garmentType,
      customer_name: customerName.trim() || "Atelier Client",
      customer_phone: customerPhone.trim() || "Shared via WhatsApp",
      customer_city: customerCity.trim(),
      order_mode: "Custom Measurements",
      standard_size: "",
      preferred_fabric: fabric,
      preferred_color: colorPreference.trim() || "To discuss",
      fit_preference: fitPreference,
      measurements,
      notes: [occasionDate ? `Occasion/Date: ${occasionDate}` : "", notes]
        .filter(Boolean)
        .join(" | "),
      whatsapp_message: briefMessage,
    });
    setSending(false);
    setSent(true);
    window.open(waHref, "_blank", "noopener,noreferrer");
  };

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(briefMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors cleanly
    }
  };

  return (
    <section
      id="custom-order"
      className="parchment-botanical-bg py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          {/* Left Editorial Column */}
          <div className="lg:sticky lg:top-28">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
              [ 04 ] Commission From Scratch
            </span>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl leading-[0.98] tracking-[-0.02em] font-normal text-ink">
              Describe the outfit.{" "}
              <span className="italic text-obsidian">We draft the pattern.</span>
            </h2>
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-taupe">
              Already have a reference image, wedding moodboard, or specific tailoring vision? Share your brief and optional measurements below—your request routes straight to {settings.brand_name}&apos;s WhatsApp desk.
            </p>

            {/* How Custom Orders Work */}
            <div className="card-royal-parchment mt-8 space-y-4 rounded-[24px] p-6">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-obsidian">
                What Happens Next on WhatsApp
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-ink/85">
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-brass">01</span>
                  <span>
                    You can immediately attach reference photos, Pinterest inspirations, or invitation themes inside WhatsApp chat.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-brass">02</span>
                  <span>
                    Our master cutter replies with curated fabric mill swatch videos, weave weights, and exact pricing.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-brass">03</span>
                  <span>
                    Book an in-showroom fitting in {settings.city} or complete measurements over guided WhatsApp video.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Bespoke Requirement Form */}
          <form
            onSubmit={handleSubmit}
            className="card-royal-parchment rounded-[28px] p-6 sm:p-9 space-y-6"
          >
          {/* Silhouette Picker */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-[0.18em] text-taupe mb-3">
              1 · Choose Silhouette or Garment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SILHOUETTES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setGarmentType(item)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-xs sm:text-sm transition-all",
                    garmentType === item
                      ? "border-obsidian bg-obsidian text-ivory"
                      : "border-ink/15 bg-stone/35 text-ink hover:border-ink/35"
                  )}
                >
                  <span>{item}</span>
                  <Scissors
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      garmentType === item ? "text-brass" : "text-taupe/60"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Fabric Chips */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-[0.18em] text-taupe mb-3">
              2 · Cloth & Mill Direction
            </label>
            <div className="flex flex-wrap gap-2">
              {FABRICS.map((fab) => (
                <button
                  key={fab}
                  type="button"
                  onClick={() => setFabric(fab)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                    fabric === fab
                      ? "border-obsidian bg-obsidian text-ivory"
                      : "border-ink/15 bg-stone/40 text-ink/80 hover:border-ink/40"
                  )}
                >
                  {fab}
                </button>
              ))}
            </div>
          </div>

          {/* Color, Fit, Occasion */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1.5">
                Preferred Shade
              </label>
              <input
                type="text"
                value={colorPreference}
                onChange={(e) => setColorPreference(e.target.value)}
                placeholder="e.g. Champagne / Midnight"
                className="w-full rounded-xl border border-ink/15 bg-stone/35 px-3.5 py-2.5 text-sm text-ink placeholder:text-taupe/60 focus:border-brass focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1.5">
                Silhouette Fit
              </label>
              <select
                value={fitPreference}
                onChange={(e) => setFitPreference(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-stone/35 px-3.5 py-2.5 text-sm text-ink focus:border-brass focus:outline-none"
              >
                <option value="Savile Tailored">Savile Tailored</option>
                <option value="Slim Structured">Slim Structured</option>
                <option value="Relaxed Couture Drape">
                  Relaxed Couture Drape
                </option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1.5">
                Event / Target Date
              </label>
              <input
                type="text"
                value={occasionDate}
                onChange={(e) => setOccasionDate(e.target.value)}
                placeholder="e.g. Reception · 20 Dec"
                className="w-full rounded-xl border border-ink/15 bg-stone/35 px-3.5 py-2.5 text-sm text-ink placeholder:text-taupe/60 focus:border-brass focus:outline-none"
              />
            </div>
          </div>

          {/* Collapsible Measurements Panel */}
          <div className="rounded-2xl border border-ink/12 bg-stone/40 p-4">
            <button
              type="button"
              onClick={() => setShowMeasurements((s) => !s)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
                <Ruler className="h-4 w-4 text-brass" />
                3 · Optional Measurements (Inches)
              </span>
              {showMeasurements ? (
                <ChevronUp className="h-4 w-4 text-taupe" />
              ) : (
                <ChevronDown className="h-4 w-4 text-taupe" />
              )}
            </button>

            {showMeasurements && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: "chest", label: "Chest", ph: "40" },
                  { key: "shoulder", label: "Shoulder", ph: "18" },
                  { key: "waist", label: "Waist", ph: "34" },
                  { key: "sleeve", label: "Sleeve", ph: "25" },
                  { key: "length", label: "Jacket/Kurta", ph: "29.5" },
                  { key: "trouserWaist", label: "Trouser Waist", ph: "34" },
                  { key: "trouserLength", label: "Outseam", ph: "41" },
                  { key: "collar", label: "Collar", ph: "15.5" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block font-mono text-[10px] text-taupe mb-1">
                      {f.label}
                    </label>
                    <input
                      type="text"
                      value={
                        measurements[f.key as keyof CustomMeasurements] || ""
                      }
                      onChange={(e) =>
                        setMeasurements((prev) => ({
                          ...prev,
                          [f.key]: e.target.value,
                        }))
                      }
                      placeholder={f.ph}
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3 py-2 text-xs font-mono text-ink placeholder:text-taupe/55 focus:border-brass focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Client Info & Notes */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1.5">
                Client Name *
              </label>
              <input
                required
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-ink/15 bg-stone/35 px-3.5 py-2.5 text-sm text-ink placeholder:text-taupe/60 focus:border-brass focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1.5">
                WhatsApp Number *
              </label>
              <input
                required
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98..."
                className="w-full rounded-xl border border-ink/15 bg-stone/35 px-3.5 py-2.5 text-sm text-ink placeholder:text-taupe/60 focus:border-brass focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1.5">
                City
              </label>
              <input
                type="text"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                placeholder="City / Country"
                className="w-full rounded-xl border border-ink/15 bg-stone/35 px-3.5 py-2.5 text-sm text-ink placeholder:text-taupe/60 focus:border-brass focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1.5">
              Design Vision / Changes / Inspiration Details
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe lapel width, embroidery placement, pleat style, pocket square pairing, or budget range..."
              className="w-full rounded-xl border border-ink/15 bg-stone/35 px-4 py-3 text-sm text-ink placeholder:text-taupe/60 focus:border-brass focus:outline-none resize-none"
            />
          </div>

          {sent && (
            <div className="rounded-xl border border-emerald-700/25 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-950">
              Bespoke brief saved! WhatsApp chat opened with {settings.brand_name}. If it did not open,{" "}
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                click here to message directly
              </a>
              .
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <Magnet padding={40} magnetStrength={4} wrapperClassName="flex-1">
              <button
                type="submit"
                disabled={sending}
                className="btn-royal-gold flex w-full items-center justify-center gap-2.5 rounded-full py-4 px-7 text-sm font-semibold"
              >
                <MessageCircle className="h-4 w-4" />
                <span>
                  {sending
                    ? "Formatting Brief..."
                    : "Send Custom Brief via WhatsApp"}
                </span>
              </button>
            </Magnet>

            <button
              type="button"
              onClick={copyBrief}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brass/35 bg-[#FFFDF8] px-5 py-4 text-xs font-mono uppercase tracking-[0.14em] text-ink hover:bg-stone/70"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-700" />
                  Copied Brief
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Brief
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </section>
  );
}
