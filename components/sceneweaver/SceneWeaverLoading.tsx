"use client";

import { useEffect, useState } from "react";

const WEAVING_PHASES = [
  "Reading the scene",
  "Mapping the emotional landscape",
  "Composing the visual language",
  "Setting the light",
  "Tuning the sound design",
  "Weaving the threads together",
];

export default function SceneWeaverLoading() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((i) => (i + 1) % WEAVING_PHASES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 2.5 + 0.3, 90));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
      }}
    >
      {/* Concentric rings */}
      <div
        style={{
          position: "relative",
          width: 140,
          height: 140,
        }}
      >
        {/* Outer ring — slow breathe */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1px solid rgba(200,160,100,0.08)",
            animation: "sw-breathe 4s ease-in-out infinite",
          }}
        />

        {/* Mid ring */}
        <div
          style={{
            position: "absolute",
            inset: 18,
            borderRadius: "50%",
            border: "1px solid rgba(200,160,100,0.14)",
            animation: "sw-breathe 4s ease-in-out infinite 0.6s",
          }}
        />

        {/* Inner ring */}
        <div
          style={{
            position: "absolute",
            inset: 36,
            borderRadius: "50%",
            border: "1px solid rgba(200,160,100,0.2)",
            animation: "sw-breathe 4s ease-in-out infinite 1.2s",
          }}
        />

        {/* Centre dot */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--sw-accent-muted)",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 24px rgba(200,160,100,0.25)",
            animation: "sw-breathe 2.5s ease-in-out infinite",
          }}
        />

        {/* Rotating arc */}
        <svg
          viewBox="0 0 140 140"
          style={{
            position: "absolute",
            inset: 0,
            width: 140,
            height: 140,
            animation: "spin-slow 5s linear infinite",
          }}
        >
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke="rgba(200,160,100,0.3)"
            strokeWidth="0.75"
            strokeDasharray="35 342"
            strokeLinecap="round"
          />
        </svg>

        {/* Counter-rotating arc */}
        <svg
          viewBox="0 0 140 140"
          style={{
            position: "absolute",
            inset: 0,
            width: 140,
            height: 140,
            animation: "spin-slow 7s linear infinite reverse",
          }}
        >
          <circle
            cx="70"
            cy="70"
            r="42"
            fill="none"
            stroke="rgba(200,160,100,0.18)"
            strokeWidth="0.5"
            strokeDasharray="20 244"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Phase text */}
      <div style={{ textAlign: "center", minHeight: 28 }}>
        <p
          key={phaseIndex}
          className="sw-anim-fade"
          style={{
            fontSize: "0.9375rem",
            fontWeight: 300,
            letterSpacing: "-0.01em",
            color: "var(--sw-accent-muted)",
            margin: 0,
          }}
        >
          {WEAVING_PHASES[phaseIndex]}
        </p>
      </div>

      {/* Progress line */}
      <div
        style={{
          width: 180,
          height: 1,
          background: "var(--sw-border-faint)",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, rgba(200,160,100,0.45), rgba(200,160,100,0.15))",
            transition: "width 0.5s var(--ease-smooth)",
          }}
        />
      </div>
    </div>
  );
}
