import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "@/components/Shell";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";

type Row = {
  rank: number;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  modules_completed: number;
  avg_score: number;
  total_attempts: number;
  longest_streak: number;
  composite: number;
};

export default function Ranks() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const { authUser } = useApp();
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("get_leaderboard", { _limit: 100 });
      if (!error) setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  const myRow = useMemo(() => rows.find((r) => r.user_id === authUser?.id), [rows, authUser]);

  return (
    <Shell>
      <div className="pt-6 pb-10 max-w-3xl">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Ranks</div>
        <h1 className="font-display text-5xl text-glow-white">Top 100 learners.</h1>
        <p className="text-muted-foreground mt-3">
          Live ranking, recomputed from completed modules, practice scores and streaks.
          Composite = modules×100 + total practice points + longest streak×10.
        </p>
      </div>

      {myRow && (
        <div className="glass rounded-2xl p-5 mb-6 flex items-center justify-between hover-glow-white animate-pop">
          <div className="flex items-center gap-4">
            <div className="font-display text-3xl text-glow-ocean w-14 text-center">#{myRow.rank}</div>
            <div>
              <div className="font-display text-lg text-glow-white">Your rank</div>
              <div className="text-xs text-muted-foreground">
                {myRow.modules_completed} modules · avg {myRow.avg_score}/30 · 🔥 {myRow.longest_streak}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Composite</div>
            <div className="font-mono text-emerald text-2xl">{myRow.composite}</div>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_80px_80px_80px_80px] text-[10px] uppercase tracking-widest text-muted-foreground px-5 py-3 border-b border-border">
          <div>Rank</div><div>Learner</div>
          <div className="text-right">Modules</div>
          <div className="text-right">Avg</div>
          <div className="text-right">🔥</div>
          <div className="text-right">Score</div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading leaderboard…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No ranked learners yet — be the first.</div>
        ) : (
          rows.map((r) => {
            const isMe = r.user_id === authUser?.id;
            const medal = r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : null;
            return (
              <div
                key={r.user_id}
                className={`grid grid-cols-[60px_1fr_80px_80px_80px_80px] items-center px-5 py-3 border-b border-border/50 text-sm transition-colors ${
                  isMe ? "bg-primary/10" : "hover:bg-foreground/5"
                }`}
              >
                <div className="font-mono text-muted-foreground">
                  {medal ? <span className="text-base">{medal}</span> : `#${r.rank}`}
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  {r.avatar_url ? (
                    <img src={r.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/20 grid place-items-center text-[10px] font-semibold ring-1 ring-white/20">
                      {(r.display_name ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate text-glow-white">{r.display_name || "Learner"}</span>
                  {isMe && <span className="chip text-[9px]">you</span>}
                </div>
                <div className="text-right font-mono text-muted-foreground">{r.modules_completed}</div>
                <div className="text-right font-mono text-muted-foreground">{r.avg_score}</div>
                <div className="text-right font-mono text-muted-foreground">{r.longest_streak}</div>
                <div className="text-right font-mono text-emerald">{r.composite}</div>
              </div>
            );
          })
        )}
      </div>

      <button onClick={() => nav("/dashboard")} className="mt-6 text-xs text-muted-foreground hover:text-foreground">
        ← Back to dashboard
      </button>
    </Shell>
  );
}
