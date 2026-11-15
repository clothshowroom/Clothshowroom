"use client";

import React, { useState } from "react";
import { Sparkles, MessageCircle, Layers, CheckCircle2, ArrowUpRight } from "lucide-react";
import { useShowroom } from "@/components/providers/ShowroomProvider";
import { RoyalSectionHeading } from "./BotanicalCornerMotif";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { playSilkRustle, playGoldClick } from "@/lib/sound";

interface FabricSpec {
  id: string;
  name: string;
  subname: string;
  origin: string;
  weightGsm: string;
  loomCycle: string;
  selvedge: string;
  recommendedFor: string;
  description: string;
  accentColor: string;
  bgGradient: string;
  sampleImg: string;
}

const FABRIC_ARCHIVE: FabricSpec[] = [
  {
    id: "banarasi-katan",
    name: "24k Gold Zari Banarasi Katan",
    subname: "Varanasi Heritage Handloom",
    origin: "Ghats of Varanasi, UP",
    weightGsm: "320 GSM · Heavy Silk",
    loomCycle: "42–48 Days Hand-Woven",
    selvedge: "Real-tested 24k gold electroplated silver zari with kadhua bootis",
    recommendedFor: "Royal Bridal Sarees, Reception Drapes, Heirloom Shawls",
    description:
      "Mulberry silk warp paired with a dense gold zari weft, woven on traditional draw-looms. Exhibits a majestic dual-tone luster under candlelit chandeliers.",
    accentColor: "#D7B774",
    bgGradient: "from-[#11241C] via-[#1B3B2E] to-[#122B21]",
    sampleImg: "/images/couture-navy-saree.jpg",
  },
  {
    id: "chanderi-tissue",
    name: "Handloom Raw Chanderi Tissue",
    subname: "Air-Weight Saffron Silk",
    origin: "Chanderi, Madhya Pradesh",
    weightGsm: "115 GSM · Featherweight",
    loomCycle: "26 Days Pit Loom",
    selvedge: "Fine silver-plated copper gota with delicate scalloped selvedge",
    recommendedFor: "Saffron Haldi Lehengas, Summer Soirees, Breezy Anarkalis",
    description:
      "Spun from degummed raw silk and fine mercerized cotton yarn, producing an ethereal translucent sheen that breathes effortlessly in tropical celebrations.",
    accentColor: "#E4B056",
    bgGradient: "from-[#2C2114] via-[#42311C] to-[#2B1F13]",
    sampleImg: "/images/couture-mustard-lehenga.jpg",
  },
  {
    id: "plum-velvet",
    name: "Imperial Velvet & Zardozi Dabka",
    subname: "Hand-Beaded Royal Velvet",
    origin: "Lucknow & Srinagar Workshops",
    weightGsm: "490 GSM · Structured Velvet",
    loomCycle: "60+ Days Multi-Artisan Craft",
    selvedge: "Micro-dabka coiled gold wires, sequins, seed pearls & kasab stitch",
    recommendedFor: "Winter Wedding Lehengas, Velvet Sherwanis, Royal Blouses",
    description:
      "Deep plush silk-blend velvet providing rich light absorption and supreme structural hold for heavy multi-layered zardozi and antique dabka embroidery.",
    accentColor: "#E293A6",
    bgGradient: "from-[#28131B] via-[#3E1C29] to-[#250F18]",
    sampleImg: "/images/couture-wine-lehenga.jpg",
  },
  {
    id: "savile-wool",
    name: "Super 150s Worsted Suiting",
    subname: "Italian Wool with Floating Canvas",
    origin: "Biella Mills, Northern Italy",
    weightGsm: "285 GSM · Year-Round Wear",
    loomCycle: "Precision Italian Milling",
    selvedge: "Natural elastane memory weave with hand-stitched horsehair canvas",
    recommendedFor: "Black Tie Tuxedos, Jodhpuri Bandhgalas, Bespoke Trousers",
    description:
      "Extra-fine 16-micron merino wool worsted into high-twist double yarn. Offers unmatched drape recovery, sharp crease retention, and breathable comfort.",
    accentColor: "#C9BA9B",
    bgGradient: "from-[#192429] via-[#24353E] to-[#182329]",
    sampleImg: "/images/suit-charcoal.jpg",
  },
];

export function FabricLoomSection() {
  const { settings } = useShowroom();
  const [activeFabric, setActiveFabric] = useState<FabricSpec>(FABRIC_ARCHIVE[0]);

  const selectFabric = (fab: FabricSpec) => {
    setActiveFabric(fab);
    playSilkRustle();
    playGoldClick();
  };

  const swatchWaHref = `${buildWhatsAppHref(settings)}&text=${encodeURIComponent(
    `Namaste ${settings.brand_name}, I am admiring the "${activeFabric.name}" (${activeFabric.subname}) on your atelier showroom. Could you share swatch videos and drape recommendations for this fabric?`
  )}`;

  return (
    <section
      id="fabrics"
      className="relative overflow-hidden bg-[#0D2017] text-[#FBF6EB] py-20 sm:py-28"
    >
      {/* Background Subtle Damask Grain */}
      <div
        aria-hidden="true"
        className="atelier-grain pointer-events-none absolute inset-0 opacity-[0.08]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#D7B774]/10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <RoyalSectionHeading
          eyebrow="The Atelier Weaver’s Loom"
          title="Touch the"
          accent="Four Royal Weaves"
          subtitle="Before any needle punctures fabric, our master tailors inspect every selvedge. Explore the touch, density, and origin of our signature couture textiles."
        />

        {/* 4 Fabric Selector Tabs */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
          {FABRIC_ARCHIVE.map((fab) => {
            const isSelected = activeFabric.id === fab.id;
            return (
              <button
                key={fab.id}
                type="button"
                onClick={() => selectFabric(fab)}
                className={`group relative flex items-center gap-2.5 rounded-full px-5 py-3 text-xs sm:text-sm font-medium transition-all duration-300 ${
                  isSelected
                    ? "royal-glass-emerald border-[#D7B774] text-[#FFFDF8] shadow-[0_0_24px_rgba(215,183,116,0.32)] scale-[1.03]"
                    : "border border-white/15 bg-white/5 text-[#FBF6EB]/75 hover:border-[#D7B774]/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full transition-transform duration-300 group-hover:scale-125"
                  style={{ backgroundColor: fab.accentColor }}
                />
                <span>{fab.name.split(" ")[0]} {fab.name.split(" ")[1]}</span>
                {isSelected && (
                  <Sparkles className="h-3.5 w-3.5 text-[#D7B774] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Interactive Fabric Showcase Card */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-[#D7B774]/40 bg-gradient-to-br from-[#122A1F] to-[#0A1811] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] items-stretch">
            {/* Left: Textile Editorial Specifications */}
            <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#D7B774]">
                    {activeFabric.origin}
                  </span>
                  <span className="text-white/30">·</span>
                  <span className="font-mono text-xs text-white/60">
                    {activeFabric.loomCycle}
                  </span>
                </div>

                <h3 className="mt-3 font-serif text-3xl sm:text-4xl text-[#FFFDF8] font-normal">
                  {activeFabric.name}
                </h3>
                <p className="font-sans text-xs uppercase tracking-wider text-[#D7B774]/90 mt-1">
                  {activeFabric.subname}
                </p>

                <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#FBF6EB]/80 font-light">
                  {activeFabric.description}
                </p>

                {/* 4 Detail Grid Pills */}
                <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-[#D7B774]">
                      Weight & Hand-Feel
                    </span>
                    <span className="mt-1 block font-medium text-xs sm:text-sm text-[#FBF6EB]">
                      {activeFabric.weightGsm}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-[#D7B774]">
                      Selvedge & Zari
                    </span>
                    <span className="mt-1 block font-medium text-xs sm:text-sm text-[#FBF6EB] line-clamp-2">
                      {activeFabric.selvedge}
                    </span>
                  </div>

                  <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-[#D7B774]">
                      Recommended Silhouettes
                    </span>
                    <span className="mt-1 block font-medium text-xs sm:text-sm text-[#FBF6EB]">
                      {activeFabric.recommendedFor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                <a
                  href={swatchWaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-royal-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs sm:text-sm font-semibold text-[#122A1F] shadow-lg transition-transform hover:scale-105"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Request Fabric Video / Swatch</span>
                </a>

                <a
                  href="#custom-order"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-xs sm:text-sm font-medium text-white hover:border-[#D7B774] hover:bg-white/10 transition-colors"
                >
                  <span>Commission in This Fabric</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#D7B774]" />
                </a>
              </div>
            </div>

            {/* Right: Fabric Visual Drape Frame */}
            <div className="relative min-h-[340px] lg:min-h-[500px] overflow-hidden bg-black/40">
              <img
                key={activeFabric.id}
                src={activeFabric.sampleImg}
                alt={activeFabric.name}
                className="h-full w-full object-cover object-center transition-all duration-700 ease-out hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A1811] via-transparent to-transparent opacity-80"
              />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-xl border border-white/20 bg-[#0F261C]/85 px-4 py-3 backdrop-blur-md">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#D7B774]">
                    Atelier Swatch Archive
                  </span>
                  <p className="font-serif text-sm text-white">
                    {activeFabric.name}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#D7B774]">
                  <CheckCircle2 className="h-4 w-4 text-[#D7B774]" />
                  <span>Authentic Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
