import { useEffect } from "react";
import { useFaceMonitor } from "@/hooks/useFaceMonitor";

/**
 * Visible mini camera tile + "face presence" status. Shows a warning state
 * when the user looks away for more than 5s.
 */
export default function CameraMonitor({
  active,
  onAbsence,
}: {
  active: boolean;
  onAbsence?: () => void;
}) {
  const { videoRef, ready, present, error, absenceCount } = useFaceMonitor({
    active,
    thresholdMs: 5000,
    onSustainedAbsence: onAbsence,
  });

  // Attach the hook's video element into the DOM so it actually renders.
  useEffect(() => {
    const v = videoRef.current;
    const slot = document.getElementById("cam-monitor-slot");
    if (v && slot && !slot.contains(v)) {
      v.className = "w-full h-full object-cover";
      v.setAttribute("playsinline", "true");
      v.muted = true;
      slot.appendChild(v);
    }
  }, [ready, videoRef]);

  return (
    <div className={`glass rounded-2xl p-3 text-xs transition-all ${present ? "" : "ring-2 ring-destructive animate-pulse"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${present ? "bg-emerald" : "bg-destructive"}`} />
          <span className="uppercase tracking-widest text-muted-foreground">Proctor cam</span>
        </div>
        <span className={`font-mono ${present ? "text-emerald" : "text-destructive"}`}>
          {error ? "off" : present ? "focused" : "away"}
        </span>
      </div>
      <div id="cam-monitor-slot" className="aspect-[4/3] rounded-lg overflow-hidden bg-black/60 border border-border" />
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Look-aways</span>
        <span className="font-mono">{absenceCount}</span>
      </div>
      {error && <div className="text-[10px] text-destructive mt-1">{error}</div>}
    </div>
  );
}
