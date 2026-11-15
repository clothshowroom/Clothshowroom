"use client";

import React, { useState, useRef } from "react";

interface GarmentLoupeProps {
  src: string;
  alt: string;
  zoomLevel?: number;
  className?: string;
  aspectRatio?: string;
}

export function GarmentLoupe({
  src,
  alt,
  zoomLevel = 2.4,
  className = "",
  aspectRatio = "aspect-[3/4]",
}: GarmentLoupeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0, bgX: 0, bgY: 0 });

  const LENS_SIZE = 120; // Diameter of the loupe in px

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Constrain lens within container
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const clampedY = Math.max(0, Math.min(y, rect.height));

    const bgX = (clampedX / rect.width) * 100;
    const bgY = (clampedY / rect.height) * 100;

    setLensPos({
      x: clampedX,
      y: clampedY,
      bgX,
      bgY,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden cursor-crosshair ${aspectRatio} ${className}`}
    >
      {/* Base Garment Image */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover object-top transition-transform duration-500 will-change-transform"
      />

      {/* Loupe Lens (Desktop only) */}
      {active && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute hidden sm:block rounded-full border-2 border-[#D7B774] shadow-[0_12px_28px_rgba(0,0,0,0.65),inset_0_1px_2px_rgba(255,255,255,0.7)] z-30"
          style={{
            width: `${LENS_SIZE}px`,
            height: `${LENS_SIZE}px`,
            left: `${lensPos.x - LENS_SIZE / 2}px`,
            top: `${lensPos.y - LENS_SIZE / 2}px`,
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${zoomLevel * 100}%`,
            backgroundPosition: `${lensPos.bgX}% ${lensPos.bgY}%`,
          }}
        >
          {/* Subtle crosshair & gold badge on loupe */}
          <div className="absolute inset-x-0 bottom-1 flex justify-center">
            <span className="rounded-full bg-[#0F261C]/90 px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-[#D7B774] border border-[#D7B774]/40">
              {zoomLevel}x Craft
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
