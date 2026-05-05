import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "@/components/Shell";
import { MODULES, TRACKS } from "@/data/content";
import { useApp } from "@/context/AppContext";

export default function Modules() {
  const nav = useNavigate();
  const { progress } = useApp();
  const [track, setTrack] = useState<string>("All");

  const visible = useMemo(
    () => (track === "All" ? MODULES : MODULES.filter((m) => m.track === track)),
    [track]
  );

  return (
    <Shell>
      <div className="pt-6 pb-8">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Modules</div>
        <h1 className="font-display text-5xl text-gradient">Pick a topic to begin</h1>
        <p className="text-muted-foreground mt-3 max-w-xl">
          Each module flows: Learn → Practice (30 MCQs) → Assignment (IDE). Monitoring activates when you start a test.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["All", ...TRACKS].map((t) => (
          <button
            key={t}
            onClick={() => setTrack(t)}
            className={`text-xs px-4 py-2 rounded-full border transition-all ${
              track === t
                ? "bg-primary text-primary-foreground border-primary"
                : "glass-soft border-border hover:border-primary/40"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((m, i) => {
          const done = progress.completedModules.includes(m.id);
          const score = progress.practiceScore[m.id];
          return (
            <button
              key={m.id}
              onClick={() => nav(`/modules/${m.id}`)}
              className="group glass rounded-2xl p-6 text-left hover:-translate-y-1 hover:glow-ring transition-all animate-rise"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="chip">{m.track}</span>
                {done && <span className="text-[10px] uppercase tracking-widest text-emerald">✓ Completed</span>}
              </div>
              <div className="font-display text-2xl mb-1.5 group-hover:text-emerald transition-colors">{m.title}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{m.blurb}</div>
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/60 text-[11px] text-muted-foreground">
                <span>{m.level} · {m.duration}</span>
                {score !== undefined && <span className="font-mono text-emerald">{score}/30</span>}
              </div>
            </button>
          );
        })}
      </div>
    </Shell>
  );
}
