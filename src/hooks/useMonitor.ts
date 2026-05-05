import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Opts = {
  active: boolean;
  onTerminate: () => void;
};

export function useMonitor({ active, onTerminate }: Opts) {
  const [violations, setViolations] = useState(0);
  const violationsRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    const bump = (reason: string) => {
      violationsRef.current += 1;
      const v = violationsRef.current;
      setViolations(v);
      if (v === 1) toast.warning(`Warning: ${reason}`, { description: "1st violation. Stay focused." });
      else if (v === 2) toast.error(`Strong warning: ${reason}`, { description: "2nd violation. Next one ends the test." });
      else if (v >= 3) {
        toast.error("Test terminated", { description: `${reason} — 3 violations reached.` });
        onTerminate();
      }
    };

    const onVisibility = () => { if (document.hidden) bump("Tab switch detected"); };
    const onCopy = () => bump("Copy detected");
    const onPaste = () => bump("Paste detected");
    const onFs = () => { if (!document.fullscreenElement) bump("Fullscreen exited"); };

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("fullscreenchange", onFs);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [active, onTerminate]);

  return { violations };
}

export async function enterFullscreen() {
  try {
    await document.documentElement.requestFullscreen();
  } catch {}
}
export async function exitFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch {}
}
