/**
 * Decorative background for the onboarding 2.0 flow: a warm radial glow plus the
 * row of ad-platform logos along the bottom edge, exported directly from the
 * Figma design (`public/onboarding-logos.png`). Purely presentational and hidden
 * from assistive tech.
 */
export function FloatingLogos() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Warm radial glow, anchored toward the lower-right like the Figma ellipse */}
      <div
        className="absolute -right-40 bottom-[-20%] h-[900px] w-[900px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,233,92,0.35) 0%, rgba(255,248,206,0.18) 45%, rgba(248,248,248,0) 70%)",
        }}
      />

      {/* Brand logo row from the Figma design */}
      <img
        src="/onboarding-logos.png"
        alt=""
        className="absolute bottom-0 left-1/2 w-[125%] max-w-none -translate-x-1/2 select-none opacity-40"
      />
    </div>
  );
}
