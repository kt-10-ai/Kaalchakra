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

  if (f.gateName) ids.push("the-open-gate", `gate-${f.gateName}`);
  if (f.market) ids.push("the-market", `market-${f.market}`);
  if (f.head) ids.push("the-audience");
  if (f.head === "taken") ids.push("ending-errand");
  if (f.head === "spared" || f.head === "proof") ids.push(`head-${f.head}`, "twist-older-line", "twist-broken-wheel");
  if (f.mother) ids.push("the-reunion", "twist-war-council", `mother-${f.mother}`, "twist-her-road");
  if (f.brother) ids.push("twist-ranadhir", `brother-${f.brother}`);
  if (f.path) ids.push(`path-${f.path}`, "twist-heir");

  return ids;
}
