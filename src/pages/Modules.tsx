import { useNavigate } from "react-router-dom";
import Shell from "@/components/Shell";
import { MODULES } from "@/data/content";
import { useApp } from "@/context/AppContext";

export default function Modules() {
  const nav = useNavigate();
  const { progress } = useApp();
  return (
    <Shell>
      <div className="pt-6 pb-10">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Modules</div>
        <h1 className="font-display text-4xl text-gradient">Pick a topic to begin</h1>
        <p className="text-muted-foreground mt-3 max-w-xl">Each module flows: Learn → Practice (30 MCQs) → Assignment (IDE). Monitoring activates when you start a test.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MODULES.map((m, i) => {
          const done = progress.completedModules.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => nav(`/modules/${m.id}`)}
              className="glass rounded-2xl p-6 text-left hover:-translate-y-0.5 transition-transform animate-rise"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-widest text-primary">{m.track}</span>
                {done && <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Completed</span>}
              </div>
              <div className="font-display text-2xl mb-1">{m.title}</div>
              <div className="text-sm text-muted-foreground">{m.blurb}</div>
            </button>
          );
        })}
      </div>
    </Shell>
  );
}
