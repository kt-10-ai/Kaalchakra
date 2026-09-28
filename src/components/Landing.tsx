import { useEffect, useState } from "react";
import { getUnlocked } from "../chronicle/storage";
import { CHRONICLE_ENTRIES, TOTAL_ENTRIES } from "../chronicle/entries";
import { loadSave } from "../court/engine";
import { EPISODES } from "../court/episodes";

interface Props {
  onCourt: () => void;
  onContinue: () => void;
  onRoad: () => void;
  onChronicle: () => void;
}

export default function Landing({ onCourt, onContinue, onRoad, onChronicle }: Props) {
  const [count, setCount] = useState(0);
  const [saved] = useState(() => loadSave());

  useEffect(() => {
    const unlocked = getUnlocked();
    setCount(CHRONICLE_ENTRIES.filter((e) => unlocked.has(e.id)).length);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-5 text-[11px] tracking-[0.3em] text-amber-400/80 uppercase">
        Smart India Hackathon · Student Innovation
      </p>

      <h1 className="mb-1 text-6xl font-bold text-amber-50">कालचक्र</h1>
      <h2 className="mb-5 text-xl font-semibold tracking-[0.35em] text-amber-500/80 uppercase">
        Kaalchakra
      </h2>

      {/* Sanskrit epigraph — the argument the whole story is having */}
      <div className="mb-8 max-w-xl border-y border-amber-900/40 py-4">
        <p className="mb-2 text-lg leading-relaxed text-amber-100/90">
          क्षमा बलमशक्तानां शक्तानां भूषणं क्षमा
        </p>
        <p className="text-xs leading-relaxed text-stone-500 italic">
          Forgiveness is the strength of the weak; in the strong, forgiveness is an ornament.
        </p>
      </div>

      {/* Devanagari must not get `uppercase` or wide tracking — it breaks conjuncts. */}
      <p className="mb-2 text-xs text-stone-500">
        <span className="text-sm text-stone-400">निर्वासितकुमारः</span>
        <span className="tracking-[0.25em] text-stone-600 uppercase">
          {"  ·  The Exile's Crown"}
        </span>
      </p>

      {/* Hindi primary, English beneath */}
      <p className="mb-4 max-w-2xl text-lg leading-loose text-stone-200">
        एक राजकुमार एक निहत्थी स्त्री का वध करने से अस्वीकार कर देता है — और इसी “दुर्बलता” के
        दंडस्वरूप निर्वासित कर दिया जाता है। न सेना, न स्वर्ण, न उपाधि। केवल एक अश्व, और एक
        आदेश: शत्रु नरेश का शीश ले आओ।
      </p>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-stone-500">
        A prince refuses to execute a bound, unarmed woman, and is banished for it &mdash; sent to
        bring back the head of a rival king with nothing but a horse.
      </p>

      <p className="mb-3 max-w-xl text-sm leading-loose text-stone-400">
        ग्यारह दिवस पश्चिम। प्रत्येक पड़ाव पर यह आदेश एक असत्य के भीतर छिपा दूसरा असत्य सिद्ध
        होता है। और करुणा का वही एक क्षण — जिसे उसके पिता ने दुर्बलता कहा था — अंततः सत्य के
        जीवित रहने का एकमात्र कारण बनता है।
      </p>
      <p className="mb-10 max-w-xl text-xs leading-relaxed text-stone-600">
        Eleven days west, every step reveals the errand is a lie inside a lie &mdash; and the one act
        of mercy his father called weakness turns out to be the only reason the truth survived.
      </p>

      <div className="mb-5 flex flex-col items-center gap-3">
        {saved && saved.episode > 0 && saved.episode < EPISODES.length && (
          <button
            onClick={onContinue}
            className="rounded-full bg-amber-500 px-10 py-3.5 font-semibold text-stone-900 transition hover:bg-amber-400"
          >
            जारी रखें &middot; Continue — Episode {EPISODES[saved.episode]?.n ?? saved.episode + 1} of {EPISODES.length}
          </button>
        )}
        <button
          onClick={onCourt}
          className={
            saved && saved.episode > 0
              ? "rounded-full border border-amber-600 px-8 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-950/40"
              : "rounded-full bg-amber-500 px-10 py-3.5 font-semibold text-stone-900 transition hover:bg-amber-400"
          }
        >
          वज्रगढ़ का दरबार &middot; {saved && saved.episode > 0 ? "Begin the Court Again" : "Begin — The Court of Vajragarh"}
        </button>
        <p className="text-xs text-stone-600">Part One · one day · {EPISODES.length} episodes</p>
        <button onClick={onRoad} className="text-xs text-stone-500 underline-offset-4 hover:text-amber-200 hover:underline">
          or skip ahead to the road west (Acts One &amp; Two)
        </button>
      </div>

      <button
        onClick={onChronicle}
        className="rounded-full border border-stone-700 px-5 py-2 text-xs font-semibold text-stone-400 transition hover:border-amber-600 hover:text-amber-200"
      >
        {count === 0
          ? "कालचक्र · The Chronicle — nothing discovered yet"
          : `कालचक्र · The Chronicle — ${count} / ${TOTAL_ENTRIES} discovered`}
      </button>
    </div>
  );
}
