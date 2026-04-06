import { CreativeDirectionSnapshot } from "@/lib/export/direction-export";

const STORAGE_KEY = "creative-direction-engine:drafts";
const MAX_DRAFTS = 12;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadDrafts(): CreativeDirectionSnapshot[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CreativeDirectionSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDrafts(drafts: CreativeDirectionSnapshot[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts.slice(0, MAX_DRAFTS)));
}

export function saveDraft(snapshot: CreativeDirectionSnapshot): CreativeDirectionSnapshot[] {
  const drafts = [snapshot, ...loadDrafts().filter((draft) => draft.id !== snapshot.id)];
  writeDrafts(drafts);
  return drafts;
}

export function duplicateDraft(snapshot: CreativeDirectionSnapshot): CreativeDirectionSnapshot[] {
  const drafts = [snapshot, ...loadDrafts()];
  writeDrafts(drafts);
  return drafts;
}

export function getLatestDraft(): CreativeDirectionSnapshot | null {
  return loadDrafts()[0] ?? null;
}