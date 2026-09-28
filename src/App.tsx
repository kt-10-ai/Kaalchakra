import { useState } from "react";
import Landing from "./components/Landing";
import Exile from "./exile/Exile";
import ChronicleScreen from "./chronicle/ChronicleScreen";
import Court, { type Carry } from "./court/Court";
import { clearSave, loadSave } from "./court/engine";
import { INITIAL_EXILE_FLAGS, type ExileFlags } from "./exile/story";
import type { CourtState } from "./court/types";

type Screen = "landing" | "court" | "exile" | "chronicle";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [courtStart, setCourtStart] = useState<CourtState | null>(null);
  const [courtRun, setCourtRun] = useState(0);
  const [carried, setCarried] = useState<ExileFlags | null>(null);

  const beginCourt = (resume: boolean) => {
    if (!resume) clearSave();
    setCourtStart(resume ? loadSave() : null);
    setCourtRun((r) => r + 1);
    setScreen("court");
  };

  const rideWest = (c: Carry) => {
    setCarried({ ...INITIAL_EXILE_FLAGS, stats: c.stats, supplies: c.supplies });
    setScreen("exile");
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {screen === "landing" && (
        <Landing
          onCourt={() => beginCourt(false)}
          onContinue={() => beginCourt(true)}
          onRoad={() => {
            setCarried(null);
            setScreen("exile");
          }}
          onChronicle={() => setScreen("chronicle")}
        />
      )}
      {screen === "court" && (
        <Court key={courtRun} initial={courtStart} onExit={() => setScreen("landing")} onRestart={() => beginCourt(false)} onComplete={rideWest} />
      )}
      {screen === "exile" && <Exile onExit={() => setScreen("landing")} initialFlags={carried ?? undefined} fromCourt={carried !== null} />}
      {screen === "chronicle" && <ChronicleScreen onExit={() => setScreen("landing")} />}
    </div>
  );
}
