import { useState } from "react";
import Landing from "./components/Landing";
import Exile from "./exile/Exile";
import ChronicleScreen from "./chronicle/ChronicleScreen";

type Screen = "landing" | "exile" | "chronicle";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");

  return (
    <div className="min-h-screen bg-stone-950">
      {screen === "landing" && (
        <Landing onStart={() => setScreen("exile")} onChronicle={() => setScreen("chronicle")} />
      )}
      {screen === "exile" && <Exile onExit={() => setScreen("landing")} />}
      {screen === "chronicle" && <ChronicleScreen onExit={() => setScreen("landing")} />}
    </div>
  );
}
