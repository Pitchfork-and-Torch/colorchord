import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LumenApp } from "@/components/lumen-wheel/LumenApp";

export const Route = createFileRoute("/")({
  component: Home,
  // Interactive instrument is client-heavy; avoid brittle SSR edge cases
  ssr: false,
});

function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        className="grid min-h-[100dvh] place-items-center bg-[#070709] text-[#f0f0f2]"
        style={{ marginTop: "var(--grok-banner-h, 0px)" }}
      >
        <div className="text-center">
          <p className="text-[0.65rem] font-medium tracking-[0.2em] text-[#6b6b76] uppercase">
            Dual harmonic instrument
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight">Color Chord</p>
          <p className="mt-1 text-xs text-[#9b9ba6]">Loading the wheel...</p>
        </div>
      </div>
    );
  }

  return <LumenApp />;
}
