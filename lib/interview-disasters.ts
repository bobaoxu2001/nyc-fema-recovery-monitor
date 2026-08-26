import type { NamedTotal } from "./types";

const SHORTCUTS = [
  { label: "Hurricane Sandy", pattern: /hurricane sandy/i },
  { label: "Hurricane Ida", pattern: /hurricane ida/i },
  { label: "COVID-19", pattern: /covid/i },
] as const;

export function interviewDisasterShortcuts(disasters: NamedTotal[]): Array<{
  key: string;
  label: string;
  name: string;
  declaration: string;
}> {
  const found: Array<{ key: string; label: string; name: string; declaration: string }> = [];
  for (const shortcut of SHORTCUTS) {
    const match = disasters.find((row) => shortcut.pattern.test(row.name));
    if (match) {
      found.push({
        key: match.key,
        label: shortcut.label,
        name: match.name,
        declaration: match.name.split(":")[0]?.trim() || `DR-${match.key}-NY`,
      });
    }
  }
  return found;
}
