// ── SceneWeaver — Typed Result Schema ──────────────────────────────────────

export type SceneWeaverPhase = "hero" | "weaving" | "result" | "comparing";

export type RefinementAction =
  | "darker"
  | "more-intimate"
  | "more-surreal"
  | "adapt-music-video"
  | "adapt-short-film"
  | "reweave";

// ── Section interfaces ─────────────────────────────────────────────────────

export interface SceneSummary {
  logline: string;
  emotionalCore: string;
  worldIn2Words: string;
}

export interface EmotionalArc {
  opening: string;
  tension: string;
  peak: string;
  resolution: string;
}

export interface NarrativeTension {
  centralConflict: string;
  subtext: string;
  stakes: string;
}

export interface VisualLanguage {
  dominantImagery: string[];
  motionQuality: string;
  textureNotes: string;
}

export interface CameraDirection {
  style: string;
  keyShots: string[];
  movement: string;
}

/** Merged lighting + colour into a single cinematic look section. */
export interface LightingAndColour {
  mood: string;
  keyLightSources: string[];
  contrast: string;
  palette: string[];
  temperature: string;
  grade: string;
}

export interface SoundTexture {
  ambience: string[];
  musicDirection: string;
  silenceNotes: string;
}

export interface PacingAndRhythm {
  overallTempo: string;
  editStyle: string;
  breathingRoom: string;
}

export interface MotifsAndSymbolism {
  motifs: string[];
  symbolism: string;
  recurringElements: string;
}

export interface AlternateDirection {
  title: string;
  angle: string;
  shift: string;
}

export interface DialogueTone {
  style: string;
  sampleLine: string;
  silenceVsDialogue: string;
}

export interface AdaptationMode {
  format: string;
  description: string;
  twist: string;
}

// ── Full result ────────────────────────────────────────────────────────────

export interface SceneWeaverResult {
  /** Original user prompt — set by the API layer, not the model. */
  prompt: string;
  /** AI-generated evocative title for this scene direction. */
  title: string;
  sceneSummary: SceneSummary;
  emotionalArc: EmotionalArc;
  narrativeTension: NarrativeTension;
  visualLanguage: VisualLanguage;
  cameraDirection: CameraDirection;
  lightingAndColour: LightingAndColour;
  soundTexture: SoundTexture;
  pacingAndRhythm: PacingAndRhythm;
  motifsAndSymbolism: MotifsAndSymbolism;
  dialogueTone: DialogueTone;
  alternateDirections: AlternateDirection[];
  adaptationModes: AdaptationMode[];
  /** Short evocative tags for filtering / quick scanning. */
  tags: string[];
  /** Suggested follow-up prompts to explore further. */
  followUpPrompts: string[];
}

// ── Section metadata for UI rendering ──────────────────────────────────────

export type SceneWeaverSectionId =
  | "sceneSummary"
  | "emotionalArc"
  | "narrativeTension"
  | "visualLanguage"
  | "cameraDirection"
  | "lightingAndColour"
  | "soundTexture"
  | "pacingAndRhythm"
  | "motifsAndSymbolism"
  | "dialogueTone"
  | "alternateDirections"
  | "adaptationModes";

export interface SceneWeaverSection {
  id: SceneWeaverSectionId;
  label: string;
  icon: string;
}

export const SCENEWEAVER_SECTIONS: readonly SceneWeaverSection[] = [
  { id: "sceneSummary",        label: "Scene Summary",        icon: "◎" },
  { id: "emotionalArc",        label: "Emotional Arc",        icon: "◐" },
  { id: "narrativeTension",    label: "Narrative Tension",    icon: "⧖" },
  { id: "visualLanguage",      label: "Visual Language",      icon: "◈" },
  { id: "cameraDirection",     label: "Camera Direction",     icon: "▣" },
  { id: "lightingAndColour",   label: "Lighting & Colour",    icon: "◑" },
  { id: "soundTexture",        label: "Sound Texture",        icon: "≈" },
  { id: "pacingAndRhythm",     label: "Pacing & Rhythm",      icon: "⏤" },
  { id: "motifsAndSymbolism",  label: "Motifs & Symbolism",   icon: "⊘" },
  { id: "dialogueTone",        label: "Dialogue Tone",        icon: "❝" },
  { id: "alternateDirections", label: "Alternate Directions",  icon: "⊷" },
  { id: "adaptationModes",     label: "Adaptation Modes",     icon: "⊞" },
] as const;
