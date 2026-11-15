"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PencilRuler } from "lucide-react";
import { useShowroom } from "@/components/providers/ShowroomProvider";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import {
  BotanicalCorner,
  CardFloralWatermark,
} from "./BotanicalCornerMotif";
import { GarmentOrderModal, type GarmentModalMode } from "./GarmentOrderModal";
import { RoyalGoldDust } from "./RoyalGoldDust";
import { playSilkRustle, playGoldClick } from "@/lib/sound";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function HeroGarmentCard({
  product,
  currencyCode,
  onSelect,
}: {
  product: Product;
  currencyCode: string;
  onSelect: (p: Product, mode: GarmentModalMode) => void;
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
    const transX = ((x - 0.5) * 10).toFixed(1);
    const transY = (((y - 0.5) * 10) - 8).toFixed(1);

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
      data-hero-wing
      onMouseEnter={() => playSilkRustle()}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: tiltStyle,
        transition: tiltStyle
          ? "transform 0.1s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.2s ease"
          : "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.45s ease",
      }}
      className="royal-glass-card card-specular-glare group flex flex-col justify-between rounded-[20px] p-2.5 cursor-pointer will-change-transform hover:shadow-[0_28px_50px_-14px_rgba(20,53,40,0.45),0_0_24px_rgba(215,183,116,0.25)]"
    >
      <button
        type="button"
        onClick={() =>
          onSelect(
            product,
            product.same_design_available ? "same_design" : "custom_design"
          )
        }
        className="relative aspect-[3/4] w-full overflow-hidden rounded-[14px] bg-[#261B15] text-left focus:outline-none"
      >
        <img
          src={product.images[0] || "/images/couture-navy-saree.jpg"}
          alt={product.name}
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[#D7B774]/35 rounded-[14px]"
        />
        {/* Subtle glass reflection band on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      </button>

      <div className="mt-2.5 text-center px-1 pb-0.5">
        <h3 className="truncate font-serif text-[15px] sm:text-base font-medium text-ink transition-colors group-hover:text-obsidian">
          {product.name}
        </h3>
        <p className="mt-0.5 font-sans text-[11px] font-medium text-taupe">
          {formatINR(product.price_inr)}{" "}
          <span className="text-[10px] uppercase tracking-wider text-brass">
            {currencyCode || "INR"}
          </span>
        </p>

        <button
          type="button"
          onClick={() => {
            playGoldClick();
            onSelect(
              product,
              product.same_design_available ? "same_design" : "custom_design"
            );
          }}
          className="btn-royal-gold mt-2 w-full rounded-md py-1.5 px-3 text-[11px] font-semibold tracking-wide"
        >
          Shop Couture
        </button>
      </div>
    </article>
  );
}

export function HeroSection() {
  const { settings, products } = useShowroom();
  const containerRef = useRef<HTMLElement>(null);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<GarmentModalMode>("same_design");

  const leftWing = products.slice(0, 4);
  const rightWing = products.slice(4, 8);
  const waHref = buildWhatsAppHref(settings);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-hero-center]", {
          y: 16,
          opacity: 0,
          duration: 0.55,
          ease: "power3.out",
          clearProps: "transform,opacity",
        });

        gsap.from("[data-hero-wing]", {
          y: 14,
          opacity: 0,
          duration: 0.4,
          stagger: 0.025,
          ease: "power2.out",
          clearProps: "transform,opacity",
        });

        // Parallax scroll on the centerpiece palace arch bride image
        gsap.to("[data-hero-arch-img]", {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: containerRef }
  );

  const openModal = (p: Product, mode: GarmentModalMode) => {
    setModalMode(mode);
    setModalProduct(p);
  };

  return (
    <section
      ref={containerRef}
      className="parchment-botanical-bg relative overflow-hidden pt-24 pb-16 sm:pt-28 lg:pt-32 lg:pb-20"
    >
      {/* Floating Palace Zari Gold Dust Particles */}
      <RoyalGoldDust />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* 3-Column Royal Heritage Showcase Grid */}
        <div className="grid gap-5 lg:grid-cols-[minmax(285px,340px)_1fr_minmax(285px,340px)] xl:grid-cols-[360px_1fr_360px] lg:items-start">
          {/* LEFT WING (Desktop Only — 4 Cards) */}
          <div className="hidden lg:grid grid-cols-2 gap-3.5">
            {leftWing.map((product) => (
              <HeroGarmentCard
                key={product.id}
                product={product}
                currencyCode={settings.currency_code}
                onSelect={openModal}
              />
            ))}
          </div>

          {/* CENTER HERO BRIDE / ARCH SHOWCASE */}
          <div data-hero-center className="relative flex flex-col items-center">
            <div className="relative w-full">
              {/* Botanical Vintage Floral Corners with subtle breathe animation */}
              <div className="animate-botanical-breathe">
                <BotanicalCorner position="tl" />
                <BotanicalCorner position="tr" />
                <BotanicalCorner position="bl" />
                <BotanicalCorner position="br" />
              </div>

              {/* Framed Palace Arch Image with Parallax */}
              <div className="relative aspect-[3/4] sm:aspect-[4/3] lg:aspect-[10/9] w-full overflow-hidden rounded-2xl border-2 border-[#C29B53]/65 bg-[#1B2B23] shadow-[0_28px_65px_-22px_rgba(24,62,47,0.48)]">
                <img
                  data-hero-arch-img
                  src={
                    settings.hero_image_url || "/images/royal-bridal-arch.jpg"
                  }
                  alt={`${settings.brand_name} bridal & bespoke couture`}
                  className="h-full w-full object-cover object-top scale-105 will-change-transform"
                />

                {/* Bottom Velvet Scrim for Overlaid Text & Pills */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D1E16]/95 via-[#0D1E16]/45 via-45% to-transparent"
                />

                {/* Overlaid Center Couture Controls */}
                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-3.5 pb-9 sm:px-6 sm:pb-16 text-center">
                  {/* Frosted Emerald Pill with Ambient Breathing Float & Gold Halo */}
                  <div className="royal-glass-emerald animate-royal-float animate-gold-halo inline-flex items-center rounded-xl px-5 py-2 shadow-2xl backdrop-blur-md">
                    <h1 className="font-serif text-lg sm:text-2xl lg:text-[26px] font-normal tracking-wide text-[#FBF6EB]">
                      {settings.hero_eyebrow}
                    </h1>
                  </div>

                  {/* 3 Brushed Antique Gold Action Pills with Sweep Shine */}
                  <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-royal-gold rounded-md px-3.5 py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.08em]"
                    >
                      Book a Consultation
                    </a>
                    <Link
                      href="#catalogue"
                      className="btn-royal-gold rounded-md px-3.5 py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.08em]"
                    >
                      Fabric Selection
                    </Link>
                    <Link
                      href="#process"
                      className="btn-royal-gold rounded-md px-3.5 py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.08em]"
                    >
                      Crafting Your Fit
                    </Link>
                  </div>

                  {/* Poetic Serif Tagline */}
                  <p className="mt-3 font-serif text-lg sm:text-2xl text-[#F7EEDD] drop-shadow-md">
                    {settings.hero_title}{" "}
                    <span className="italic text-[#E4C988]">
                      {settings.hero_accent}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Overlapping Frosted Royal Glass Consultation Feature Cards */}
            <div className="relative z-20 -mt-5 sm:-mt-9 w-[94%] sm:w-[92%] grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="#custom-order"
                onMouseEnter={() => playSilkRustle()}
                onClick={() => playGoldClick()}
                className="royal-glass-card card-specular-glare group relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300 hover:-translate-y-1.5"
              >
                <CardFloralWatermark />
                <div className="relative z-10 flex flex-col items-center">
                  {/* Gold Measuring Tape SVG with subtle hover glow */}
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    <svg
                      viewBox="0 0 40 40"
                      fill="none"
                      aria-hidden="true"
                      className="h-9 w-9 text-brass"
                    >
                      <ellipse
                        cx="18"
                        cy="17"
                        rx="11"
                        ry="7"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        fill="currentColor"
                        fillOpacity="0.14"
                      />
                      <path
                        d="M7 17v6c0 3.8 4.9 7 11 7h15v-6H18"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 26v4m4-4v4m4-4v4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <span className="mt-2 font-serif text-[15px] font-medium leading-tight text-ink group-hover:text-obsidian">
                    Measurements &amp; Consultation
                  </span>
                </div>
              </Link>

              <Link
                href="#catalogue"
                onMouseEnter={() => playSilkRustle()}
                onClick={() => playGoldClick()}
                className="royal-glass-card card-specular-glare group relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300 hover:-translate-y-1.5"
              >
                <CardFloralWatermark />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    <PencilRuler
                      className="h-9 w-9 text-brass stroke-[1.5]"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="mt-2 font-serif text-[15px] font-medium leading-tight text-ink group-hover:text-obsidian">
                    Custom Design &amp; Selection
                  </span>
                </div>
              </Link>

              <Link
                href="#process"
                onMouseEnter={() => playSilkRustle()}
                onClick={() => playGoldClick()}
                className="royal-glass-card card-specular-glare group relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300 hover:-translate-y-1.5"
              >
                <CardFloralWatermark />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    {/* Gold Needle & Silk Thread SVG */}
                    <svg
                      viewBox="0 0 40 40"
                      fill="none"
                      aria-hidden="true"
                      className="h-9 w-9 text-brass"
                    >
                      <path
                        d="M31 8L10 30"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <ellipse
                        cx="28.5"
                        cy="10.5"
                        rx="1.5"
                        ry="2.5"
                        transform="rotate(45 28.5 10.5)"
                        stroke="#FBF6EB"
                        strokeWidth="1"
                      />
                      <path
                        d="M12 14C16 11 22 14 21 20C20 26 27 29 33 25"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeDasharray="2 2"
                      />
                    </svg>
                  </div>
                  <span className="mt-2 font-serif text-[15px] font-medium leading-tight text-ink group-hover:text-obsidian">
                    Exquisite Craftsmanship
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* RIGHT WING (Desktop Only — 4 Cards) */}
          <div className="hidden lg:grid grid-cols-2 gap-3.5">
            {rightWing.map((product) => (
              <HeroGarmentCard
                key={product.id}
                product={product}
                currencyCode={settings.currency_code}
                onSelect={openModal}
              />
            ))}
          </div>
        </div>

        {/* MOBILE FEATURED ROW (< lg) */}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:hidden">
          {leftWing.map((product) => (
            <HeroGarmentCard
              key={product.id}
              product={product}
              currencyCode={settings.currency_code}
              onSelect={openModal}
            />
          ))}
        </div>
      </div>

      {/* Modal triggered from any Hero Wing card */}
      <GarmentOrderModal
        product={modalProduct}
        initialMode={modalMode}
        onClose={() => setModalProduct(null)}
      />
    </section>
  );
}

