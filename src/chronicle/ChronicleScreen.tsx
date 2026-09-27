import { useMemo } from "react";
import { CHRONICLE_ENTRIES, GROUP_LABELS, TOTAL_ENTRIES, type ChronicleEntry } from "./entries";
import { getUnlocked } from "./storage";

interface Props {
  onExit: () => void;
}

const GROUPS: ChronicleEntry["group"][] = ["court", "road", "truth"];

export default function ChronicleScreen({ onExit }: Props) {
  const unlocked = useMemo(() => getUnlocked(), []);
  const count = [...unlocked].filter((id) =>
    CHRONICLE_ENTRIES.some((e) => e.id === id)
  ).length;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={onExit}
        className="mb-6 rounded-full bg-stone-900/80 px-4 py-2 text-xs font-semibold text-amber-100 hover:bg-stone-800"
      >
        ← Back
      </button>

      <p className="mb-1 text-xs tracking-widest text-amber-400 uppercase">
        कालचक्र · The Chronicle
      </p>
      <h2 className="mb-2 text-3xl font-bold text-amber-50">
        {count} / {TOTAL_ENTRIES} Discovered
      </h2>
      <p className="mb-6 max-w-xl text-sm text-stone-400">
        No single journey reveals all of this. Different choices open different entries, and what you
        find is kept between visits.
      </p>

      <div className="mb-10 h-2 w-full overflow-hidden rounded-full bg-stone-800">
        <div
          className="h-full bg-amber-500 transition-all"
          style={{ width: `${(count / TOTAL_ENTRIES) * 100}%` }}
        />
      </div>

      {GROUPS.map((g) => (
        <Section
          key={g}
          title={GROUP_LABELS[g]}
          entries={CHRONICLE_ENTRIES.filter((e) => e.group === g)}
          unlocked={unlocked}
        />
      ))}
    </div>
  );
}

function Section({
  title,
  entries,
  unlocked,
}: {
  title: string;
  entries: ChronicleEntry[];
  unlocked: Set<string>;
}) {
  const found = entries.filter((e) => unlocked.has(e.id)).length;
  return (
    <div className="mb-10">
      <h3 className="mb-3 flex items-baseline gap-3 text-sm font-semibold tracking-wide text-stone-300 uppercase">
        {title}
        <span className="text-[11px] font-normal text-stone-600">
          {found} / {entries.length}
        </span>
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {entries.map((e) => {
          const has = unlocked.has(e.id);
          return (
            <div
              key={e.id}
              className={
                has
                  ? "rounded-lg border border-amber-800/50 bg-stone-900/60 p-4"
                  : "rounded-lg border border-stone-800 bg-stone-950/60 p-4"
              }
            >
              <div
                className={`mb-1 text-[10px] font-bold tracking-widest uppercase ${
                  has ? "text-amber-400" : "text-stone-700"
                }`}
              >
                {e.era}
              </div>
              {has ? (
                <>
                  <div className="mb-1 font-semibold text-amber-100">{e.title}</div>
                  <p className="text-sm leading-relaxed text-stone-400">{e.text}</p>
                </>
              ) : (
                <div className="font-semibold text-stone-700">???</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
