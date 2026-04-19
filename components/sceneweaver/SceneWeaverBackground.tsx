"use client";

interface Props {
  phase: string;
}

export default function SceneWeaverBackground({ phase }: Props) {
  const isWeaving = phase === "weaving";
  const isResult = phase === "result" || phase === "comparing";
  const isHero = phase === "hero";

  return (
    <div
      aria-hidden="true"
      className="sw-bg-root"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* ── L1: Deep cinematic void ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--sw-void)",
        }}
      />

      {/* ── L2: Vertical depth gradient ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(8,5,20,0.6) 0%, transparent 30%, transparent 70%, rgba(4,2,10,0.8) 100%)",
        }}
      />

      {/* ── L3: Radial warmth centre — shifts per phase ── */}
      <div
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          top: 0,
          left: 0,
          background: isResult
            ? "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(16,12,28,1) 0%, transparent 70%)"
            : "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(12,8,24,1) 0%, transparent 65%)",
          transition: "background 2s ease",
        }}
      />

      {/* ── L4: Film grain ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.024,
          mixBlendMode: "overlay" as const,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
          animation: "sw-flicker 8s ease-in-out infinite",
        }}
      />

      {/* ── L5: Horizontal scan lines ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.007) 2px, rgba(255,255,255,0.007) 4px)",
          opacity: 0.5,
        }}
      />

      {/* ── L6: Atmospheric washes ── */}

      {/* Deep violet — upper left */}
      <div
        style={{
          position: "absolute",
          width: "80vw",
          height: "80vw",
          borderRadius: "50%",
          top: "-35vw",
          left: "-15vw",
          background:
            "radial-gradient(ellipse, rgba(45,15,90,0.05) 0%, transparent 55%)",
          animation: "drift-a 58s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* Warm amber — lower right */}
      <div
        style={{
          position: "absolute",
          width: "65vw",
          height: "65vw",
          borderRadius: "50%",
          bottom: "-22vw",
          right: "-12vw",
          background:
            "radial-gradient(ellipse, rgba(160,110,40,0.03) 0%, transparent 55%)",
          animation: "drift-b 66s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* Cool blue — mid left */}
      <div
        style={{
          position: "absolute",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          top: "35%",
          left: "-18vw",
          background:
            "radial-gradient(ellipse, rgba(30,50,110,0.03) 0%, transparent 50%)",
          animation: "drift-c 72s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* ── L7: Phase atmosphere ── */}

      {/* Hero — warm glow */}
      <div
        style={{
          position: "absolute",
          width: "55vw",
          height: "35vw",
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, rgba(200,160,100,0.018) 0%, transparent 60%)",
          opacity: isHero ? 1 : 0,
          transition: "opacity 1.5s ease",
        }}
      />

      {/* Weaving — pulsing golden */}
      <div
        style={{
          position: "absolute",
          width: "45vw",
          height: "45vw",
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, rgba(200,150,80,0.05) 0%, transparent 55%)",
          opacity: isWeaving ? 1 : 0,
          transition: "opacity 1.5s ease",
          animation: isWeaving ? "sw-glow-pulse 3.5s ease-in-out infinite" : "none",
        }}
      />

      {/* Result — anamorphic streak */}
      <div
        style={{
          position: "absolute",
          width: "140vw",
          height: "1.5px",
          top: "32%",
          left: "-20vw",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(200,160,100,0.02) 15%, rgba(200,160,100,0.055) 50%, rgba(200,160,100,0.02) 85%, transparent 100%)",
          opacity: isResult ? 1 : 0,
          transition: "opacity 2.5s ease",
          filter: "blur(0.5px)",
        }}
      />

      {/* Result — cool secondary flare */}
      <div
        style={{
          position: "absolute",
          width: "120vw",
          height: "1px",
          top: "68%",
          left: "-10vw",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(100,120,200,0.015) 20%, rgba(100,120,200,0.03) 50%, rgba(100,120,200,0.015) 80%, transparent 100%)",
          opacity: isResult ? 0.7 : 0,
          transition: "opacity 3s ease 0.5s",
          filter: "blur(0.5px)",
        }}
      />

      {/* ── L8: Cinematic vignette ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 85% 80% at 50% 48%, transparent 30%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* ── L9: Letterbox bars ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: isResult ? "2.5vh" : 0,
          background: "rgba(0,0,0,0.45)",
          transition: "height 1.5s var(--ease-smooth)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: isResult ? "2.5vh" : 0,
          background: "rgba(0,0,0,0.45)",
          transition: "height 1.5s var(--ease-smooth)",
        }}
      />
    </div>
  );
}
