"use client";

import React from "react";

interface DottedBackgroundProps {
  className?: string;
  dotSize?: number; // dot radius in px
  gap?: number; // spacing between dots in px
  color?: string; // rgb triple like "0,0,0"
  opacity?: number; // dot opacity, 0 to 1
  /** Soft gradient wash over the dots (matches the campaign screen look). */
  fade?: boolean;
  fadeColor?: string; // rgb triple the dots fade into, defaults to white
}

export function DottedBackground({
  className = "",
  dotSize = 2,
  gap = 24,
  color = "100,116,139",
  opacity = 0.2,
  fade = false,
  fadeColor = "255,255,255",
}: DottedBackgroundProps) {
  const dots = `radial-gradient(circle, rgba(${color}, ${opacity}) ${dotSize}px, transparent ${dotSize}px)`;
  // Listed first so it paints on top of the dots and softens only the very top.
  const wash = `linear-gradient(to bottom, rgba(${fadeColor}, 0.85) 0%, rgba(${fadeColor}, 0) 18%)`;

  const backgroundImage = fade ? `${wash}, ${dots}` : dots;
  const backgroundSize = fade ? `100% 100%, ${gap}px ${gap}px` : `${gap}px ${gap}px`;

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage,
        backgroundSize,
        backgroundPosition: "0 0",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

export default DottedBackground;
