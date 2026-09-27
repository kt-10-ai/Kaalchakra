import type { ExileFlags } from "../exile/story";

/** Which chronicle entries the current run has earned. Idempotent. */
export function deriveChronicleIds(f: ExileFlags): string[] {
  const ids = ["the-hall", "the-condemned", "the-refusal", "the-sentence", "ranadhir"];

  if (f.firstMeal) ids.push(`meal-${f.firstMeal}`);
  if (f.firstMeal) ids.push("burned-country");
  if (f.chaya) ids.push("chaya", `chaya-${f.chaya}`);
  if (f.heardTheRumour) ids.push("twist-quiet-country");
  if (f.crossing) ids.push(`crossing-${f.crossing}`, "meghadurg");
  if (f.letter) ids.push("twist-the-letter", `letter-${f.letter}`, "the-name");

  return ids;
}
