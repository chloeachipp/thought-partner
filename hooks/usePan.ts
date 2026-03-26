"use client";

import { useState, useRef, useCallback } from "react";

export interface PanOffset {
  x: number;
  y: number;
}

export function usePan() {
  const [offset, setOffset] = useState<PanOffset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Track drag origin in refs to avoid stale closures
  const pointerOrigin = useRef<PanOffset>({ x: 0, y: 0 });
  const offsetAtDown  = useRef<PanOffset>({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only pan on primary button and plain background (not interactive children)
    if (e.button !== 0) return;
    setIsDragging(true);
    pointerOrigin.current  = { x: e.clientX, y: e.clientY };
    offsetAtDown.current   = { x: offset.x,  y: offset.y  };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [offset]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - pointerOrigin.current.x;
    const dy = e.clientY - pointerOrigin.current.y;
    setOffset({ x: offsetAtDown.current.x + dx, y: offsetAtDown.current.y + dy });
  }, [isDragging]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const recenter = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return {
    offset,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    recenter,
  };
}
