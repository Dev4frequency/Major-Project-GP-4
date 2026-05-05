import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { MODULES, ASSIGNMENTS, TRACKS } from "@/data/content";

function computeStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };
  const set = new Set(dates);
  const sorted = [...set].sort();

  // longest
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const cur = new Date(sorted[i]);
    const diff = Math.round((+cur - +prev) / 86400000);
    if (diff === 1) { run += 1; longest = Math.max(longest, run); }
    else { run = 1; }
  }

  // current (count back from today or yesterday)
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let current = 0;
  let cursor = new Date(today);
  if (!set.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(cursor.toISOString().slice(0, 10))) return { current: 0, longest };
  }
  while (set.has(cursor.toISOString().slice(0, 10))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { current, longest };
}

export default function Dashboard() {
  const { user, progress } = useApp();
  const nav = useNavigate();

  const totalModules = MODULES.length;
  const done = progress.completedModules.length;
  const pct = Math.round((done / totalModules) * 100);
  const scores = Object.entries(progress.practiceScore);
  const avg = scores.length ? Math.round(scores.reduce((s, [, v]) => s + v, 0) / scores.length) : 0;
  const best = scores.length ? Math.max(...scores.map(([, v]) => v)) : 0;
  const { current: streak, longest } = useMemo(() => computeStreak(progress.activityDates), [progress.activityDates]);

  const recommended = useMemo(() => {
    const next = MODULES.find((m) => !progress.completedModules.includes(m.id));
    return next ?? MODULES[0];
  }, [progress.completedModules]);

  // last 14 days activity heatmap row
  const days = useMemo(() => {
    const out: { date: string; active: boolean }[] = [];
    const set = new Set(progress.activityDates);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      out.push({ date: iso, active: set.has(iso) });
    }
    return out;
  }, [progress.activityDates]);

  // per-track progress
  const byTrack = useMemo(() => {
    return TRACKS.map((t) => {
      const total = MODULES.filter((m) => m.track === t).length;
      const completed = MODULES.filter((m) => m.track === t && progress.completedModules.includes(m.id)).length;
      return { track: t, total, completed, pct: total ? Math.round((completed / total) * 100) : 0 };
    });
  }, [progress.completedModules]);

  return (
    <Shell>
      <div className="pt-6 pb-8">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Dashboard</div>
        <h1 className="font-display text-5xl text-gradient">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground mt-2">Your progress at a glance — and where to go next.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Day streak" value={`${streak}`} sub={`${longest} longest`} icon="🔥" />
        <Stat label="Modules done" value={`${done}/${totalModules}`} sub={`${pct}% complete`} icon="◆" />
        <Stat label="Avg MCQ" value={`${avg}/30`} sub={`Best ${best}/30`} icon="✓" />
        <Stat label="Assignments" value={`${progress.assignmentsDone.length}/${ASSIGNMENTS.length}`} sub="Solved" icon="⌘" />
      </div>

      {/* Recommended next + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-2 glass rounded-2xl p-6 hover:glow-ring transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="chip">Next up</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Recommended</span>
          </div>
          <div className="font-display text-3xl mb-1">{recommended.title}</div>
          <p className="text-sm text-muted-foreground leading-relaxed">{recommended.blurb}</p>
          <div className="mt-3 text-[11px] text-muted-foreground">{recommended.track} · {recommended.level} · {recommended.duration}</div>
          <div className="mt-5 flex gap-2">
            <Button onClick={() => nav(`/modules/${recommended.id}`)} className="rounded-full">Continue learning →</Button>
            <Button variant="ghost" onClick={() => nav("/assistant")} className="rounded-full">Ask the assistant</Button>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Last 14 days</span>
            <span className="text-[10px] text-emerald">{days.filter(d => d.active).length} active</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((d) => (
              <div
                key={d.date}
                title={d.date}
                className={`aspect-square rounded-md ${
                  d.active ? "bg-emerald" : "bg-foreground/5 border border-border/60"
                }`}
              />
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Current</span>
            <span className="font-mono text-emerald text-base">🔥 {streak} day{streak === 1 ? "" : "s"}</span>
          </div>
        </div>
      </div>

      {/* Overall + per-track */}
      <div className="glass rounded-2xl p-6 mt-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Overall progress</h2>
          <span className="text-sm text-muted-foreground">{pct}%</span>
        </div>
        <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald to-jade transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {byTrack.map((t) => (
            <div key={t.track} className="glass-soft rounded-xl p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="uppercase tracking-widest text-muted-foreground">{t.track}</span>
                <span className="font-mono text-emerald">{t.completed}/{t.total}</span>
              </div>
              <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald" style={{ width: `${t.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module list with scores */}
      <div className="mt-5">
        <h2 className="font-display text-2xl mb-3">Module breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULES.map((m) => {
            const score = progress.practiceScore[m.id];
            const completed = progress.completedModules.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => nav(`/modules/${m.id}`)}
                className="glass rounded-2xl p-5 text-left hover:-translate-y-0.5 transition-transform flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-emerald">{m.track}</div>
                  <div className="font-display text-lg mt-1">{m.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{m.level} · {m.duration}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-muted-foreground text-xs">{completed ? "✓ Completed" : "Not started"}</div>
                  {score !== undefined && <div className="font-mono mt-1 text-emerald">{score}/30</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}

function Stat({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon?: string }) {
  return (
    <div className="glass rounded-2xl p-5 hover:glow-ring transition-shadow">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="uppercase tracking-widest">{label}</span>
        {icon && <span className="text-emerald text-base leading-none">{icon}</span>}
      </div>
      <div className="font-display text-3xl md:text-4xl mt-2 text-gradient">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}
