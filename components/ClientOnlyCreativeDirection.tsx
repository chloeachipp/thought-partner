"use client";

import { useEffect, useState } from "react";
import CreativeDirectionView from "./CreativeDirectionView";

export default function ClientOnlyCreativeDirection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ minHeight: "100vh", background: "var(--bg-void)" }} />;
  }

  return <CreativeDirectionView />;
}
