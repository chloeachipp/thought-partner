import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SceneWeaver — Cinematic Scene Interpreter",
  description:
    "Turn a cinematic idea into a complete scene interpretation. Emotional arc, visual language, camera direction, sound design, and more.",
};

export default function SceneWeaverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
