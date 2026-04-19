"use client";

import { useSceneWeaver } from "@/hooks/useSceneWeaver";
import SceneWeaverBackground from "./SceneWeaverBackground";
import SceneWeaverHero from "./SceneWeaverHero";
import SceneWeaverLoading from "./SceneWeaverLoading";
import SceneWeaverResultView from "./SceneWeaverResult";
import SceneWeaverCompare from "./SceneWeaverCompare";

export default function SceneWeaverApp() {
  const {
    phase,
    result,
    compareResult,
    history,
    isLoading,
    error,
    provider,
    meta,
    activeRefinement,
    pendingRefinement,
    resultVersion,
    setProvider,
    weaveScene,
    refineScene,
    compareDirections,
    exitCompare,
    reset,
  } = useSceneWeaver();

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "var(--sw-void)",
      }}
    >
      <SceneWeaverBackground phase={phase} />

      {/* Phase content — each phase fades in via sw-anim classes */}
      {phase === "hero" && (
        <SceneWeaverHero
          onSubmit={weaveScene}
          aiProvider={provider}
          onProviderChange={setProvider}
        />
      )}

      {phase === "weaving" && <SceneWeaverLoading />}

      {phase === "result" && result && (
        <SceneWeaverResultView
          result={result}
          isLoading={isLoading}
          canCompare={history.length >= 2}
          onRefine={refineScene}
          onCompare={compareDirections}
          onNewScene={reset}
          meta={meta}
          activeRefinement={activeRefinement}
          pendingRefinement={pendingRefinement}
          resultVersion={resultVersion}
        />
      )}

      {phase === "comparing" && result && compareResult && (
        <SceneWeaverCompare
          current={result}
          previous={compareResult}
          onExit={exitCompare}
        />
      )}

      {/* Error toast */}
      {error && (
        <div
          className="sw-anim-rise"
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            padding: "14px 28px",
            borderRadius: "var(--r-md)",
            background: "rgba(224, 88, 86, 0.08)",
            border: "1px solid rgba(224, 88, 86, 0.25)",
            color: "var(--danger)",
            fontSize: "0.8125rem",
            maxWidth: 480,
            textAlign: "center" as const,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
