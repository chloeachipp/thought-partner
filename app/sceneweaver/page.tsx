"use client";

import dynamic from "next/dynamic";

const SceneWeaverApp = dynamic(
  () => import("@/components/sceneweaver/SceneWeaverApp"),
  { ssr: false },
);

export default function SceneWeaverPage() {
  return <SceneWeaverApp />;
}
