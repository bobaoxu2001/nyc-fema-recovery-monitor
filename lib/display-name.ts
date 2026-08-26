const SMALL_WORDS = new Set(["and", "of", "the", "for", "de", "da", "in"]);

function isMostlyUpper(value: string): boolean {
  const letters = value.replace(/[^A-Za-z]/g, "");
  if (letters.length < 4) return false;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length >= 0.7;
}

function titleCaseWord(word: string, index: number): string {
  const stripped = word.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "");
  const lower = stripped.toLowerCase();
  if (index > 0 && SMALL_WORDS.has(lower) && stripped === word) {
    return lower;
  }
  if (!stripped) return word;
  const titled = lower.charAt(0).toUpperCase() + lower.slice(1);
  return word.replace(stripped, titled);
}

export function displayApplicantName(raw: string | null | undefined): string {
  if (!raw) return "";
  let value = raw.replace(/\s+/g, " ").trim();
  value = value.replace(/\bMANAGMENT\b/gi, "Management");
  value = value.replace(/\s*\(\d+\)\s*$/, "");
  if (isMostlyUpper(value)) {
    value = value
      .split(" / ")
      .map((part) =>
        part
          .split(" ")
          .map((word, index) => titleCaseWord(word, index))
          .join(" "),
      )
      .join(" / ");
  }
  return value;
}

export function hasDisplayNormalization(raw: string | null | undefined): boolean {
  const value = (raw || "").trim();
  return Boolean(value) && displayApplicantName(value) !== value;
}
