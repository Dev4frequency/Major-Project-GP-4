import Shell from "@/components/Shell";
import { useApp } from "@/context/AppContext";
import { MODULES, ASSIGNMENTS } from "@/data/content";

export default function Dashboard() {
  const { user, progress } = useApp();
  const totalModules = MODULES.length;
  const done = progress.completedModules.length;
  const pct = Math.round((done / totalModules) * 100);
  const scores = Object.entries(progress.practiceScore);
  const avg = scores.length ? Math.round(scores.reduce((s, [, v]) => s + v, 0) / scores.length) : 0;

  return (
    <Shell>
      <div className="pt-6 pb-10">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Dashboard</div>
        <h1 className="font-display text-4xl text-gradient">Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}</h1>
        <p className="text-muted-foreground mt-2">Your progress, at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Stat label="Modules completed" value={`${done} / ${totalModules}`} />
        <Stat label="Average MCQ score" value={`${avg} / 30`} />
        <Stat label="Assignments solved" value={`${progress.assignmentsDone.length} / ${ASSIGNMENTS.length}`} />
      </div>

      <div className="glass rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-2xl">Overall progress</h2>
          <span className="text-sm text-muted-foreground">{pct}%</span>
        </div>
        <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {MODULES.map((m) => {
          const score = progress.practiceScore[m.id];
          const completed = progress.completedModules.includes(m.id);
          return (
            <div key={m.id} className="glass rounded-2xl p-5 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-primary">{m.track}</div>
                <div className="font-display text-xl mt-1">{m.title}</div>
              </div>
              <div className="text-right text-sm">
                <div className="text-muted-foreground text-xs">{completed ? "Completed" : "Not started"}</div>
                {score !== undefined && <div className="font-mono mt-1">{score}/30</div>}
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-4xl mt-2 text-gradient">{value}</div>
    </div>
  );
}
