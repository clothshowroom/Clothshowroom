"use client";

import React, { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  RotateCcw,
  Scissors,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useShowroom } from "@/components/providers/ShowroomProvider";
import type { Product } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";
import { RoyalSectionHeading } from "./BotanicalCornerMotif";
import { GarmentOrderModal, type GarmentModalMode } from "./GarmentOrderModal";
import { playSilkRustle, playGoldClick } from "@/lib/sound";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function CatalogueProductCard({
  product,
  onOpenModal,
}: {
  product: Product;
  onOpenModal: (product: Product, mode: GarmentModalMode) => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [tiltStyle, setTiltStyle] = useState("");

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    el.style.setProperty("--mouse-x", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--mouse-y", `${(y * 100).toFixed(1)}%`);

    // Lively 3D tilt & dynamic float response to cursor position
    const rotX = ((y - 0.5) * -18).toFixed(2);
    const rotY = ((x - 0.5) * 18).toFixed(2);
    const transX = ((x - 0.5) * 12).toFixed(1);
    const transY = (((y - 0.5) * 12) - 10).toFixed(1);

    setTiltStyle(
      `perspective(900px) translate3d(${transX}px, ${transY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.045, 1.045, 1.045)`
    );
  };

  const handleMouseLeave = () => {
    setTiltStyle("");
  };

  return (
    <article
      ref={cardRef}
      data-catalogue-card
      onMouseEnter={() => playSilkRustle()}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: tiltStyle,
        transition: tiltStyle
          ? "transform 0.1s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.2s ease"
          : "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.45s ease",
      }}
      className="royal-glass-card card-specular-glare group flex flex-col justify-between rounded-[24px] p-3.5 cursor-pointer will-change-transform hover:shadow-[0_32px_60px_-16px_rgba(20,53,40,0.48),0_0_28px_rgba(215,183,116,0.25)]"
    >
      <div>
        {/* Heritage Portrait Frame */}
        <button
          type="button"
          onClick={() =>
            onOpenModal(
              product,
              product.same_design_available ? "same_design" : "custom_design"
            )
          }
          className="relative block aspect-[3/4] w-full overflow-hidden rounded-[18px] bg-[#241B15] text-left focus:outline-none"
        >
          <img
            src={product.images[0] || "/images/couture-navy-saree.jpg"}
            alt={product.name}
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-inset ring-brass/35"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/8 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          {/* Top SKU & Availability */}
          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            <span className="rounded-full border border-brass/40 bg-obsidian/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#FBF6EB] backdrop-blur-sm shadow-sm">
              {product.sku}
            </span>
            <span className="rounded-full border border-brass/35 bg-ivory/95 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink backdrop-blur-sm shadow-sm">
              {product.is_customizable
                ? product.same_design_available
                  ? "Same / Custom"
                  : "Bespoke Only"
                : "Archive Ready"}
            </span>
          </div>

          {/* Quick Inspect Hover Pill */}
          <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-brass/40 bg-ivory/95 text-obsidian shadow-md opacity-90 transition-transform duration-300 group-hover:scale-110">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </button>

        {/* Metadata */}
        <div className="mt-4 px-1.5">
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-taupe">
            <span className="truncate">{product.fabric}</span>
            <span className="shrink-0">{product.tailoring_days} Days</span>
          </div>

          <div className="mt-1.5 flex items-baseline justify-between gap-3">
            <h3 className="font-serif text-2xl leading-snug text-ink font-medium transition-colors group-hover:text-obsidian">
              {product.name}
            </h3>
            <span className="shrink-0 font-mono text-sm font-semibold text-obsidian">
              {formatINR(product.price_inr)}
            </span>
          </div>

          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-taupe">
            {product.description}
          </p>
        </div>
      </div>

      {/* Dual Action Footer: Same vs Customize */}
      <div className="mt-5 grid grid-cols-2 gap-2 px-1 pb-1">
        {product.same_design_available ? (
          <button
            type="button"
            onClick={() => {
              playGoldClick();
              onOpenModal(product, "same_design");
            }}
            className="btn-couture rounded-full border border-obsidian/30 bg-[#FFFDF8] py-2.5 px-3 text-xs font-medium text-obsidian hover:bg-obsidian hover:text-ivory"
          >
            Order Same
          </button>
        ) : (
          <span className="flex items-center justify-center rounded-full border border-brass/25 bg-stone/55 py-2.5 px-3 text-[11px] font-mono text-taupe">
            Made to Spec
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            playGoldClick();
            onOpenModal(product, "custom_design");
          }}
          className="btn-royal-gold inline-flex items-center justify-center gap-1.5 rounded-full py-2.5 px-3 text-xs font-semibold"
        >
          <Scissors className="h-3 w-3" />
          <span>Customize</span>
        </button>
      </div>
    </article>
  );
}

export function CatalogueSection() {
  const { products } = useShowroom();
  const sectionRef = useRef<HTMLElement>(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFabric, setSelectedFabric] = useState("All");
  const [selectedOccasion, setSelectedOccasion] = useState("All");
  const [customizableOnly, setCustomizableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<GarmentModalMode>("same_design");

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    ],
    [products]
  );

  const fabrics = useMemo(
    () => [
      "All",
      ...Array.from(new Set(products.map((p) => p.fabric).filter(Boolean))),
    ],
    [products]
  );

  const occasions = useMemo(
    () => [
      "All",
      ...Array.from(new Set(products.map((p) => p.occasion).filter(Boolean))),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory)
        return false;
      if (selectedFabric !== "All" && item.fabric !== selectedFabric)
        return false;
      if (selectedOccasion !== "All" && item.occasion !== selectedOccasion)
        return false;
      if (customizableOnly && !item.is_customizable) return false;
      if (q) {
        const hay = `${item.name} ${item.sku} ${item.fabric} ${item.occasion} ${item.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    products,
    selectedCategory,
    selectedFabric,
    selectedOccasion,
    customizableOnly,
    searchQuery,
  ]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-catalogue-card]", {
          y: 16,
          opacity: 0,
          duration: 0.38,
          stagger: 0.03,
          ease: "power2.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 94%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [products.length] }
  );

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedFabric !== "All" ||
    selectedOccasion !== "All" ||
    customizableOnly ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedFabric("All");
    setSelectedOccasion("All");
    setCustomizableOnly(false);
    setSearchQuery("");
  };

  const openModal = (product: Product, mode: GarmentModalMode) => {
    setModalMode(mode);
    setActiveProduct(product);
  };

  return (
    <section
      id="catalogue"
      ref={sectionRef}
      className="parchment-botanical-bg border-t border-brass/25 py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Royal Heritage Centered Section Header */}
        <div className="border-b border-brass/25 pb-8">
          <RoyalSectionHeading
            eyebrow="[ 01 ] The Ready & Tailored Archive"
            title="Signature"
            accent="Collections"
            subtitle="Commission any showcase piece as photographed in standard or bespoke measurements, or customize mill silks, embroidery, shade, and tailoring structure."
          />
        </div>

        {/* Multi-Filter Studio Bar */}
        <div className="mt-8 space-y-4">
          {/* Animated Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-full bg-stone/40 max-w-fit mx-auto border border-brass/25">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    playGoldClick();
                    setSelectedCategory(cat);
                  }}
                  className="relative rounded-full px-4 py-2 text-xs sm:text-[13px] font-medium transition-colors cursor-pointer select-none"
                >
                  {isSelected && (
                    <motion.span
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 rounded-full bg-obsidian shadow-sm border border-brass/40"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 transition-colors duration-200",
                      isSelected ? "text-[#FBF6EB]" : "text-ink/80 hover:text-ink"
                    )}
                  >
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Filters & Search (Royal Frosted Glass) */}
          <div className="royal-glass-card grid gap-3 rounded-2xl p-3.5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-taupe" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saree, lehenga, kurta, SKU, fabric..."
                className="w-full rounded-xl border border-brass/25 bg-ivory/80 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-taupe/70 focus:border-brass focus:outline-none"
              />
            </div>

            <div className="relative flex items-center">
              <SlidersHorizontal className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-taupe" />
              <select
                aria-label="Filter by fabric"
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                className="w-full appearance-none rounded-xl border border-brass/25 bg-ivory/80 py-2.5 pl-9 pr-8 text-xs sm:text-sm text-ink focus:border-brass focus:outline-none"
              >
                {fabrics.map((fab) => (
                  <option key={fab} value={fab}>
                    {fab === "All" ? "Fabric: All Mills" : fab}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex items-center">
              <Sparkles className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-taupe" />
              <select
                aria-label="Filter by occasion"
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="w-full appearance-none rounded-xl border border-brass/25 bg-ivory/80 py-2.5 pl-9 pr-8 text-xs sm:text-sm text-ink focus:border-brass focus:outline-none"
              >
                {occasions.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ === "All" ? "Occasion: All Events" : occ}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCustomizableOnly((v) => !v)}
                className={cn(
                  "flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap",
                  customizableOnly
                    ? "border-obsidian bg-obsidian text-ivory"
                    : "border-brass/25 bg-ivory/80 text-taupe hover:text-ink"
                )}
              >
                <Scissors className="h-3.5 w-3.5 text-brass" />
                Customizable
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  aria-label="Reset filters"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brass/25 bg-ivory/80 text-taupe hover:text-ink"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="royal-glass-card mt-12 rounded-3xl p-12 text-center">
            <p className="font-serif text-2xl text-ink">
              No archive pieces match those filters.
            </p>
            <p className="mt-2 text-sm text-taupe">
              Reset your filters or commission a custom outfit directly via our Bespoke Brief below.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="btn-royal-gold mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold"
            >
              Reset Archive Filters
            </button>
          </div>
        ) : (
          <div className="mt-10 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <CatalogueProductCard
                key={product.id}
                product={product}
                onOpenModal={openModal}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        <GarmentOrderModal
          product={activeProduct}
          initialMode={modalMode}
          onClose={() => setActiveProduct(null)}
        />
      </div>
    </section>
  );
}
