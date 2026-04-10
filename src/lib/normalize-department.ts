/**
 * Normalize a department string against the company's existing departments.
 *
 * Behavior:
 * - Empty/whitespace input → empty string.
 * - Always title-cases the output ("marketing" → "Marketing",
 *   "customer success" → "Customer Success"). Known acronyms (HR, IT, QA…)
 *   stay uppercase. Departments are NEVER stored lowercase-first.
 * - If `existing` contains a case-insensitive match, the canonical form of
 *   that existing entry is returned so spellings stay consistent across the
 *   company (even if the DB still has a poorly-cased row — it gets fixed
 *   on the next write).
 *
 * This is the single source of truth for department spelling. Call it
 * anywhere a department string is about to be persisted.
 */
export function normalizeDepartment(
  input: string | null | undefined,
  existing: string[] = []
): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed) return "";

  const canonical = titleCase(trimmed);
  const key = canonical.toLowerCase();

  // If an existing department matches (case-insensitively), use ITS canonical
  // form — but re-title-case it too, so a lingering "marketing" row in the DB
  // still gets emitted as "Marketing".
  for (const dept of existing) {
    if ((dept || "").trim().toLowerCase() === key) {
      return titleCase(dept.trim());
    }
  }

  return canonical;
}

// Departments that should stay uppercase even if the user types them lower.
const ACRONYMS = new Set([
  "HR",
  "IT",
  "QA",
  "PR",
  "UX",
  "UI",
  "RD",
  "R&D",
  "SRE",
  "BI",
  "CX",
  "GTM",
  "IT&S",
]);

// Words that should stay lowercase when not the first word of a department
// name ("Research and Development", "Marketing and Comms").
const LOWER_WORDS = new Set(["and", "of", "the", "for", "to", "in", "&"]);

function titleCase(s: string): string {
  const words = s.split(/\s+/).filter(Boolean);
  return words
    .map((word, i) => {
      const upper = word.toUpperCase();
      if (ACRONYMS.has(upper)) return upper;
      // Preserve user-provided all-caps short tokens (likely acronyms).
      if (word.length <= 4 && word === upper && /^[A-Z&]+$/.test(word)) {
        return word;
      }
      if (i > 0 && LOWER_WORDS.has(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
