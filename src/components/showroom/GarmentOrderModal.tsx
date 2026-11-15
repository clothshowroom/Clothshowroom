"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Check,
  Copy,
  MessageCircle,
  Ruler,
  Scissors,
  Sparkles,
  X,
} from "lucide-react";
import { useShowroom } from "@/components/providers/ShowroomProvider";
import type { CustomMeasurements, Product } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";
import { buildOrderWhatsAppMessage, buildWhatsAppHref } from "@/lib/whatsapp";

export type GarmentModalMode = "same_design" | "custom_design";

interface GarmentOrderModalProps {
  product: Product | null;
  initialMode?: GarmentModalMode;
  onClose: () => void;
}

const STANDARD_SIZES = ["36 / S", "38 / M", "40 / L", "42 / XL", "44 / XXL"];
const FIT_PREFERENCES = [
  "Savile Tailored",
  "Relaxed Couture Drape",
  "Slim Structured",
];

export function GarmentOrderModal({
  product,
  initialMode = "same_design",
  onClose,
}: GarmentOrderModalProps) {
  if (!product) return null;

  return (
    <GarmentOrderModalInner
      key={`${product.id}-${initialMode}`}
      product={product}
      initialMode={initialMode}
      onClose={onClose}
    />
  );
}

function GarmentOrderModalInner({
  product,
  initialMode = "same_design",
  onClose,
}: {
  product: Product;
  initialMode: GarmentModalMode;
  onClose: () => void;
}) {
  const { settings, submitInquiry } = useShowroom();

  const resolvedInitialMode: GarmentModalMode =
    !product.same_design_available ? "custom_design" : initialMode;

  const [modeTab, setModeTab] = useState<GarmentModalMode>(resolvedInitialMode);
  const [orderMeasureMode, setOrderMeasureMode] = useState<
    "Standard Size" | "Custom Measurements"
  >("Custom Measurements");
  const [standardSize, setStandardSize] = useState("40 / L");
  const [selectedFabric, setSelectedFabric] = useState(
    product.fabric_options[0] || product.fabric
  );
  const [customFabricInput, setCustomFabricInput] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0] || "Atelier Signature"
  );
  const [customColorInput, setCustomColorInput] = useState("");
  const [fitPreference, setFitPreference] = useState(FIT_PREFERENCES[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [occasionOrDate, setOccasionOrDate] = useState("");
  const [measurements, setMeasurements] = useState<CustomMeasurements>({});
  const [notes, setNotes] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dispatchedNotice, setDispatchedNotice] = useState(false);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const effectiveFabric =
    modeTab === "same_design"
      ? product.fabric
      : customFabricInput.trim() || selectedFabric || product.fabric;

  const effectiveColor =
    modeTab === "same_design"
      ? "Exact Archive Colour"
      : customColorInput.trim() || selectedColor || "Atelier Signature";

  const whatsappMessage = useMemo(() => {
    return buildOrderWhatsAppMessage({
      inquiryType: modeTab,
      brandName: settings.brand_name,
      productName: product.name,
      sku: product.sku,
      orderMode: orderMeasureMode,
      standardSize:
        orderMeasureMode === "Standard Size" ? standardSize : undefined,
      preferredFabric: effectiveFabric,
      preferredColor: effectiveColor,
      fitPreference: modeTab === "custom_design" ? fitPreference : undefined,
      customerName: customerName.trim() || "Atelier Client",
      customerPhone: customerPhone.trim(),
      customerCity: customerCity.trim(),
      occasionOrDate: occasionOrDate.trim(),
      measurements:
        orderMeasureMode === "Custom Measurements" ? measurements : undefined,
      notes,
    });
  }, [
    product,
    modeTab,
    settings.brand_name,
    orderMeasureMode,
    standardSize,
    effectiveFabric,
    effectiveColor,
    fitPreference,
    customerName,
    customerPhone,
    customerCity,
    occasionOrDate,
    measurements,
    notes,
  ]);

  const waHref = buildWhatsAppHref(settings, whatsappMessage);

  const handleDispatchWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await submitInquiry({
      inquiry_type: modeTab,
      product_id: product.id.startsWith("prod-") ? null : product.id,
      product_name: `${product.name} (${product.sku})`,
      customer_name: customerName.trim() || "Atelier Client",
      customer_phone: customerPhone.trim() || "Shared via WhatsApp",
      customer_city: customerCity.trim(),
      order_mode: orderMeasureMode,
      standard_size:
        orderMeasureMode === "Standard Size" ? standardSize : "",
      preferred_fabric: effectiveFabric,
      preferred_color: effectiveColor,
      fit_preference: modeTab === "custom_design" ? fitPreference : "Standard",
      measurements,
      notes: [occasionOrDate ? `Occasion/Date: ${occasionOrDate}` : "", notes]
        .filter(Boolean)
        .join(" | "),
      whatsapp_message: whatsappMessage,
    });
    setSubmitting(false);
    setDispatchedNotice(true);
    window.open(waHref, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors cleanly
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#091B12]/80 p-3 sm:p-6 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={`Order or Customize ${product.name}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="royal-glass-card relative grid w-full max-w-5xl max-h-[92dvh] overflow-hidden rounded-[28px] border-2 border-brass/45 bg-[#FAF6EE]/96 text-ink shadow-[0_35px_100px_-15px_rgba(10,26,19,0.7)] lg:grid-cols-[0.92fr_1.08fr]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close garment drawer"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-brass/35 bg-ivory/95 text-ink backdrop-blur hover:bg-obsidian hover:text-ivory transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Garment Showcase Panel */}
        <div className="hidden lg:flex flex-col justify-between bg-stone p-7 overflow-y-auto border-r border-brass/25">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-taupe mb-4">
              <span>{product.sku}</span>
              <span>{product.tailoring_days} Days Tailoring</span>
            </div>
            <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl border border-brass/30 bg-[#241B15]">
              <img
                src={product.images[0] || "/images/couture-navy-saree.jpg"}
                alt={product.name}
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>

          <div className="mt-5 space-y-2.5 border-t border-brass/25 pt-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-serif text-2xl text-ink">{product.name}</h3>
              <span className="font-mono text-sm font-semibold text-obsidian">
                {formatINR(product.price_inr)}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-taupe">
              {product.description}
            </p>
            {product.craft_notes && (
              <p className="font-mono text-[11px] text-ink/75 pt-1">
                {product.craft_notes}
              </p>
            )}
          </div>
        </div>

        {/* Right Interactive Order / Customizer Form */}
        <div className="flex flex-col overflow-y-auto p-5 sm:p-8">
          {/* Mobile Mini Header */}
          <div className="flex items-center gap-3 pb-4 pr-10 lg:hidden border-b border-brass/25 mb-4">
            <img
              src={product.images[0] || "/images/couture-navy-saree.jpg"}
              alt={product.name}
              className="h-16 w-14 rounded-xl object-cover object-top border border-brass/30 bg-stone"
            />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-taupe">
                {product.sku} · {product.tailoring_days} Days
              </p>
              <h3 className="font-serif text-xl leading-tight">{product.name}</h3>
              <p className="text-xs font-medium text-brass">
                {formatINR(product.price_inr)}
              </p>
            </div>
          </div>

          <div className="mb-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
              Direct Tailor Dispatch · {settings.brand_name}
            </span>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-normal">
              Configure Your Commission
            </h2>
          </div>

          {/* Mode Toggle: Order Same vs Customize with Smooth Gliding Pill */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-stone/70 p-1.5 mb-6 border border-brass/25">
            {product.same_design_available && (
              <button
                type="button"
                onClick={() => setModeTab("same_design")}
                className="relative flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none"
              >
                {modeTab === "same_design" && (
                  <motion.span
                    layoutId="modalModePill"
                    className="absolute inset-0 rounded-xl bg-obsidian shadow-sm border border-brass/40"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex items-center gap-2 transition-colors duration-200",
                    modeTab === "same_design" ? "text-ivory" : "text-ink/75 hover:text-ink"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5 text-brass" />
                  Order Same Design
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setModeTab("custom_design")}
              className={cn(
                "relative flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none",
                !product.same_design_available && "col-span-2"
              )}
            >
              {modeTab === "custom_design" && (
                <motion.span
                  layoutId="modalModePill"
                  className="absolute inset-0 rounded-xl bg-obsidian shadow-sm border border-brass/40"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex items-center gap-2 transition-colors duration-200",
                  modeTab === "custom_design" ? "text-ivory" : "text-ink/75 hover:text-ink"
                )}
              >
                <Scissors className="h-3.5 w-3.5 text-brass" />
                Customize Cloth & Fit
              </span>
            </button>
          </div>

          <form onSubmit={handleDispatchWhatsApp} className="space-y-5">
            {/* Customization Controls */}
            {modeTab === "custom_design" && (
              <div className="space-y-4 rounded-2xl border border-ink/10 bg-stone/40 p-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-taupe mb-2">
                    Preferred Cloth / Mill Swatch
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {product.fabric_options.map((fab) => (
                      <button
                        key={fab}
                        type="button"
                        onClick={() => {
                          setSelectedFabric(fab);
                          setCustomFabricInput("");
                        }}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs border transition-colors",
                          selectedFabric === fab && !customFabricInput
                            ? "border-obsidian bg-obsidian text-ivory"
                            : "border-ink/15 bg-ivory text-ink/80 hover:border-ink/40"
                        )}
                      >
                        {fab}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customFabricInput}
                    onChange={(e) => setCustomFabricInput(e.target.value)}
                    placeholder="Or type custom fabric request (e.g. Velvet, Cashmere blend)..."
                    className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2 text-xs text-ink placeholder:text-taupe/70 focus:border-brass focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-taupe mb-2">
                    Shade / Dye Preference
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {product.colors.map((clr) => (
                      <button
                        key={clr}
                        type="button"
                        onClick={() => {
                          setSelectedColor(clr);
                          setCustomColorInput("");
                        }}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs border transition-colors",
                          selectedColor === clr && !customColorInput
                            ? "border-obsidian bg-obsidian text-ivory"
                            : "border-ink/15 bg-ivory text-ink/80 hover:border-ink/40"
                        )}
                      >
                        {clr}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    placeholder="Or specify custom shade / reference color..."
                    className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2 text-xs text-ink placeholder:text-taupe/70 focus:border-brass focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-taupe mb-2">
                    Silhouette & Fit
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FIT_PREFERENCES.map((fit) => (
                      <button
                        key={fit}
                        type="button"
                        onClick={() => setFitPreference(fit)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs border transition-colors",
                          fitPreference === fit
                            ? "border-brass bg-brass/15 text-ink font-medium"
                            : "border-ink/15 bg-ivory text-ink/75"
                        )}
                      >
                        {fit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sizing Choice */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-taupe">
                  Sizing & Measurements
                </label>
                <div className="inline-flex rounded-full border border-ink/15 p-0.5 text-[11px]">
                  {(["Custom Measurements", "Standard Size"] as const).map(
                    (opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setOrderMeasureMode(opt)}
                        className={cn(
                          "rounded-full px-3 py-1 transition-colors",
                          orderMeasureMode === opt
                            ? "bg-obsidian text-ivory"
                            : "text-taupe hover:text-ink"
                        )}
                      >
                        {opt}
                      </button>
                    )
                  )}
                </div>
              </div>

              {orderMeasureMode === "Standard Size" ? (
                <div className="flex flex-wrap gap-2">
                  {STANDARD_SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setStandardSize(sz)}
                      className={cn(
                        "rounded-xl border px-3.5 py-2 text-xs font-mono transition-colors",
                        standardSize === sz
                          ? "border-obsidian bg-obsidian text-ivory"
                          : "border-ink/15 bg-stone/40 text-ink hover:border-ink/40"
                      )}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { key: "chest", label: "Chest (in)", ph: "e.g. 40" },
                    { key: "shoulder", label: "Shoulder (in)", ph: "e.g. 18" },
                    { key: "waist", label: "Waist (in)", ph: "e.g. 34" },
                    { key: "sleeve", label: "Sleeve (in)", ph: "e.g. 25" },
                    { key: "length", label: "Length (in)", ph: "e.g. 29.5" },
                    {
                      key: "trouserLength",
                      label: "Trouser (in)",
                      ph: "e.g. 41",
                    },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-taupe mb-1">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={
                          measurements[
                            field.key as keyof CustomMeasurements
                          ] || ""
                        }
                        onChange={(e) =>
                          setMeasurements((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        placeholder={field.ph}
                        className="w-full rounded-xl border border-ink/15 bg-stone/35 px-3 py-2 text-xs font-mono text-ink placeholder:text-taupe/60 focus:border-brass focus:outline-none"
                      />
                    </div>
                  ))}
                  <p className="col-span-full flex items-center gap-1.5 text-[11px] text-taupe mt-0.5">
                    <Ruler className="h-3.5 w-3.5 text-brass shrink-0" />
                    Leave blank if you prefer a guided WhatsApp / video measurement call with our master tailor.
                  </p>
                </div>
              )}
            </div>

            {/* Client Identity & Notes */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-taupe mb-1">
                  Your Name *
                </label>
                <input
                  required
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-ink/15 bg-stone/35 px-3.5 py-2.5 text-sm text-ink placeholder:text-taupe/60 focus:border-brass focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-taupe mb-1">
                  WhatsApp / Mobile *
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
                <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-taupe mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="e.g. Mumbai, Delhi, Jaipur"
                  className="w-full rounded-xl border border-ink/15 bg-stone/35 px-3.5 py-2.5 text-sm text-ink placeholder:text-taupe/60 focus:border-brass focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-taupe mb-1">
                  Event Date (Optional)
                </label>
                <input
                  type="text"
                  value={occasionOrDate}
                  onChange={(e) => setOccasionOrDate(e.target.value)}
                  placeholder="e.g. Reception · 18 Dec"
                  className="w-full rounded-xl border border-ink/15 bg-stone/35 px-3.5 py-2.5 text-sm text-ink placeholder:text-taupe/60 focus:border-brass focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-taupe mb-1">
                Custom Tailoring Instructions (Lapels, Buttons, Monogram, Changes)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share lapel style, button finish, hidden monogram initials, or alterations..."
                className="w-full rounded-xl border border-ink/15 bg-stone/35 px-3.5 py-2 text-sm text-ink placeholder:text-taupe/60 focus:border-brass focus:outline-none resize-none"
              />
            </div>

            {/* Live Message Preview Toggle */}
            <div className="rounded-xl border border-ink/10 bg-stone/30 p-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/80 hover:text-ink"
                >
                  {showPreview
                    ? "Hide WhatsApp Brief Preview"
                    : "Preview WhatsApp Message"}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-taupe hover:text-ink"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-700" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Text
                    </>
                  )}
                </button>
              </div>
              {showPreview && (
                <pre className="mt-2.5 whitespace-pre-wrap rounded-lg bg-ivory p-3 font-mono text-[11px] leading-relaxed text-ink/85 border border-ink/10">
                  {whatsappMessage}
                </pre>
              )}
            </div>

            {dispatchedNotice && (
              <div className="rounded-xl border border-emerald-700/25 bg-emerald-50/70 px-4 py-2.5 text-xs text-emerald-950">
                Inquiry recorded and WhatsApp brief opened with {settings.brand_name}. If a new tab didn&apos;t open automatically,{" "}
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  tap here to open WhatsApp
                </a>
                .
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-royal-gold flex w-full items-center justify-center gap-2.5 rounded-full py-3.5 px-6 text-sm font-semibold disabled:opacity-60"
            >
              <MessageCircle className="h-4 w-4" />
              <span>
                {submitting
                  ? "Preparing Atelier Brief..."
                  : modeTab === "same_design"
                    ? "Order Same Design on WhatsApp"
                    : "Send Customized Brief on WhatsApp"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
