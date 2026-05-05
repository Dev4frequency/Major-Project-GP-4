import { ViolationEvent } from "@/hooks/useMonitor";

export default function MonitorHUD({
  violations,
  maxStrikes,
  events,
}: {
  violations: number;
  maxStrikes: number;
  events: ViolationEvent[];
}) {
  const remaining = Math.max(0, maxStrikes - violations);
  const status =
    violations === 0 ? { color: "text-emerald", dot: "bg-emerald", label: "Clean session" }
    : remaining === 0 ? { color: "text-destructive", dot: "bg-destructive", label: "Terminated" }
    : remaining === 1 ? { color: "text-destructive", dot: "bg-destructive animate-pulse", label: "Final warning" }
    : { color: "text-yellow-400", dot: "bg-yellow-400", label: "Warning" };

  return (
    <div className="glass rounded-2xl p-4 text-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
          <span className="uppercase tracking-widest text-muted-foreground">Monitor</span>
        </div>
        <span className={`font-mono ${status.color}`}>{status.label}</span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground">Strikes</span>
        <span className="font-mono">{violations} / {maxStrikes}</span>
      </div>
      <div className="flex gap-1.5 mb-4">
        {Array.from({ length: maxStrikes }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < violations ? "bg-destructive" : "bg-foreground/10"
            }`}
          />
        ))}
      </div>

      {events.length > 0 ? (
        <>
          <div className="text-muted-foreground uppercase tracking-widest text-[10px] mb-2">Recent</div>
          <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {events.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate">{e.label}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{e.detail}</div>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground shrink-0">#{e.count}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="text-muted-foreground">No violations detected. Stay focused.</div>
      )}
    </div>
  );
}
