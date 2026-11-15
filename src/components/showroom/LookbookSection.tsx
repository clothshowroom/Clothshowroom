"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, MessageCircle, Scissors } from "lucide-react";
import { useShowroom } from "@/components/providers/ShowroomProvider";
import type { LookbookEntry, Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { buildOrderWhatsAppMessage, buildWhatsAppHref } from "@/lib/whatsapp";
import { playSilkRustle } from "@/lib/sound";
import { GarmentOrderModal } from "./GarmentOrderModal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function LookbookCard({
  entry,
  idx,
  onOpenLook,
}: {
  entry: LookbookEntry;
  idx: number;
  onOpenLook: (entry: LookbookEntry) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState("");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    el.style.setProperty("--mouse-x", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--mouse-y", `${(y * 100).toFixed(1)}%`);

    const rotX = ((y - 0.5) * -16).toFixed(2);
    const rotY = ((x - 0.5) * 16).toFixed(2);
    const transX = ((x - 0.5) * 10).toFixed(1);
    const transY = (((y - 0.5) * 10) - 8).toFixed(1);

    setTiltStyle(
      `perspective(900px) translate3d(${transX}px, ${transY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.035, 1.035, 1.035)`
    );
  };

  const handleMouseLeave = () => {
    setTiltStyle("");
  };

  return (
    <article
      data-look-card
      className={cn("group flex flex-col", idx % 2 === 1 && "md:mt-14")}
    >
      <div
        ref={cardRef}
        onMouseEnter={() => playSilkRustle()}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: tiltStyle,
          transition: tiltStyle
            ? "transform 0.1s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.2s ease"
            : "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.45s ease",
        }}
        className="royal-glass-card card-specular-glare relative aspect-[3/4] overflow-hidden rounded-[28px] p-2.5 cursor-pointer will-change-transform hover:shadow-[0_28px_56px_-18px_rgba(20,53,40,0.45),0_0_24px_rgba(215,183,116,0.25)]"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-[#241B15]">
          <img
            src={entry.image_url || "/images/couture-navy-saree.jpg"}
            alt={entry.title}
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          <div className="royal-glass-emerald absolute left-4 top-4 rounded-full border border-brass/45 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#FBF6EB] shadow-lg backdrop-blur-md">
            {entry.season}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 px-1">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-ink transition-colors group-hover:text-obsidian">
            {entry.title}
          </h3>
          <span className="font-mono text-[11px] text-brass">
            LOOK 0{idx + 1}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-taupe max-w-lg">
          {entry.story}
        </p>

        {entry.fabric_notes && (
          <p className="font-mono text-[11px] text-ink/80 border-l-2 border-brass pl-3">
            {entry.fabric_notes}
          </p>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={() => onOpenLook(entry)}
            className="btn-royal-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold"
          >
            {entry.product_id ? (
              <>
                <Scissors className="h-3.5 w-3.5" />
                <span>Order or Customize Look</span>
              </>
            ) : (
              <>
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Inquire About Look</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export function LookbookSection() {
  const { lookbook, products, settings } = useShowroom();
  const containerRef = useRef<HTMLElement>(null);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-look-card]", {
          y: 26,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 88%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [lookbook.length] }
  );

  const handleOpenLook = (entry: LookbookEntry) => {
    const linked = entry.product_id
      ? products.find((p) => p.id === entry.product_id)
      : undefined;
    if (linked) {
      setModalProduct(linked);
      return;
    }
    const msg = buildOrderWhatsAppMessage({
      inquiryType: "custom_design",
      brandName: settings.brand_name,
      productName: `${entry.title} (${entry.season})`,
      orderMode: "Custom Measurements",
      preferredFabric: entry.fabric_notes,
      customerName: "Lookbook Visitor",
      customerPhone: "",
      notes: `Commission request inspired by Lookbook ${entry.title}.`,
    });
    window.open(buildWhatsAppHref(settings, msg), "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="lookbook"
      ref={containerRef}
      className="border-t border-brass/25 bg-stone/75 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-12 sm:mb-16 border-b border-brass/25 pb-8">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
              [ 02 ] Editorial Lookbook
            </span>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl lg:text-[3.35rem] leading-[0.98] tracking-[-0.02em] text-ink font-normal">
              Drapes built for{" "}
              <span className="italic text-obsidian">quiet ceremony.</span>
            </h2>
          </div>

          <a
            href="#custom-order"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-obsidian hover:text-brass transition-colors"
          >
            <span>Have Your Own Reference?</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Staggered Asymmetric Lookbook Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {lookbook.map((entry, idx) => (
            <LookbookCard
              key={entry.id}
              entry={entry}
              idx={idx}
              onOpenLook={handleOpenLook}
            />
          ))}
        </div>
      </div>

      <GarmentOrderModal
        product={modalProduct}
        initialMode="custom_design"
        onClose={() => setModalProduct(null)}
      />
    </section>
  );
}
