import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

const ADMIN_PASS = "yash@123";
const ADMIN_KEY = "263645";
const SESSION_FLAG = "dev-assistant.admin.unlocked";

type Tab = "overview" | "modules" | "practice" | "assignments" | "monitoring" | "ai";

export default function Admin() {
  const { authUser, profile } = useApp();
  const [unlocked, setUnlocked] = useState(false);
  const [pass, setPass] = useState("");
  const [key, setKey] = useState("");
  const [tab, setTab] = useState<Tab>("overview");

  const [progress, setProgress] = useState<any[]>([]);
  const [practice, setPractice] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [monitor, setMonitor] = useState<any[]>([]);
  const [convos, setConvos] = useState<any[]>([]);
  const [streak, setStreak] = useState<any | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_FLAG) === "1") setUnlocked(true);
  }, []);

  useEffect(() => {
    if (!unlocked || !authUser) return;
    (async () => {
      const [mp, pa, asg, me, cv, st] = await Promise.all([
        supabase.from("module_progress").select("*").order("updated_at", { ascending: false }),
        supabase.from("practice_attempts").select("*").order("created_at", { ascending: false }),
        supabase.from("assignment_submissions").select("*").order("created_at", { ascending: false }),
        supabase.from("monitor_events").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("conversations").select("*").order("last_message_at", { ascending: false }),
        supabase.from("user_streaks").select("*").eq("user_id", authUser.id).maybeSingle(),
      ]);
      setProgress(mp.data ?? []);
      setPractice(pa.data ?? []);
      setAssignments(asg.data ?? []);
      setMonitor(me.data ?? []);
      setConvos(cv.data ?? []);
      setStreak(st.data ?? null);
    })();
  }, [unlocked, authUser]);

  const tryUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === ADMIN_PASS && key === ADMIN_KEY) {
      sessionStorage.setItem(SESSION_FLAG, "1");
      setUnlocked(true);
      toast.success("Admin panel unlocked");
    } else {
      toast.error("Invalid pass or key");
    }
  };

  const lock = () => {
    sessionStorage.removeItem(SESSION_FLAG);
    setUnlocked(false);
    setPass(""); setKey("");
  };

  if (!unlocked) {
    return (
      <Shell>
        <div className="max-w-md mx-auto pt-16">
          <div className="glass rounded-3xl p-8 animate-pop">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Restricted</div>
            <h1 className="font-display text-3xl text-glow-white">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-2">Enter the team pass and key to continue.</p>
            <form className="mt-6 space-y-4" onSubmit={tryUnlock}>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Pass</Label>
                <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Key</Label>
                <Input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="••••••" />
              </div>
              <Button type="submit" className="w-full rounded-full">Unlock</Button>
            </form>
          </div>
        </div>
      </Shell>
    );
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "overview", label: "Overview", count: 0 },
    { id: "modules", label: "Modules", count: progress.length },
    { id: "practice", label: "Practice", count: practice.length },
    { id: "assignments", label: "Assignments", count: assignments.length },
    { id: "monitoring", label: "Monitoring", count: monitor.length },
    { id: "ai", label: "AI Conversations", count: convos.length },
  ];

  return (
    <Shell>
      <div className="pt-6 pb-10">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Admin · demo</div>
            <h1 className="font-display text-4xl text-glow-white">Operations panel</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              Demo view scoped to your account (database RLS protects every other user). A multi-tenant view
              would route through a service-role edge function with a verified admin role.
            </p>
          </div>
          <Button variant="ghost" onClick={lock} className="rounded-full">Lock panel</Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`text-xs px-4 py-2 rounded-full border transition ${
                tab === t.id ? "bg-primary text-primary-foreground border-primary" : "glass-soft border-border hover:border-primary/40"
              }`}>
              {t.label} {t.count ? <span className="opacity-70">({t.count})</span> : null}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Stat label="Display name" value={profile?.display_name ?? "—"} />
            <Stat label="Email" value={profile?.email ?? "—"} />
            <Stat label="Track" value={profile?.selected_track ?? "—"} />
            <Stat label="Modules touched" value={progress.length} />
            <Stat label="Practice attempts" value={practice.length} />
            <Stat label="Assignments" value={assignments.length} />
            <Stat label="Current streak" value={streak?.current_streak ?? 0} />
            <Stat label="Longest streak" value={streak?.longest_streak ?? 0} />
            <Stat label="Monitor events" value={monitor.length} />
          </div>
        )}

        {tab === "modules" && (
          <Table headers={["Module", "Status", "Percent", "Updated"]} rows={progress.map((r) => [
            r.module_id, r.status, `${r.percent}%`, new Date(r.updated_at).toLocaleString(),
          ])} />
        )}
        {tab === "practice" && (
          <Table headers={["Module", "Score", "Violations", "Terminated", "When"]} rows={practice.map((r) => [
            r.module_id, `${r.score}/${r.total}`, r.violations, r.terminated ? "Yes" : "No",
            new Date(r.created_at).toLocaleString(),
          ])} />
        )}
        {tab === "assignments" && (
          <Table headers={["Module", "Problem", "Language", "Status", "When"]} rows={assignments.map((r) => [
            r.module_id, r.problem_id, r.language, r.status, new Date(r.created_at).toLocaleString(),
          ])} />
        )}
        {tab === "monitoring" && (
          <Table headers={["Kind", "Session", "Module", "Detail", "When"]} rows={monitor.map((r) => [
            r.kind, r.session_kind, r.module_id ?? "—", r.detail ?? "—", new Date(r.created_at).toLocaleString(),
          ])} />
        )}
        {tab === "ai" && (
          <Table headers={["Title", "Pinned", "Last message"]} rows={convos.map((r) => [
            r.title, r.pinned ? "★" : "—", new Date(r.last_message_at).toLocaleString(),
          ])} />
        )}
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="glass rounded-2xl p-5 hover-glow-white">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-2xl text-glow-white mt-1 truncate">{String(value)}</div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: any[][] }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>{headers.map((h) => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={headers.length} className="px-4 py-6 text-center text-muted-foreground italic">No data yet.</td></tr>
            )}
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border/40 hover:bg-foreground/5">
                {r.map((c, j) => <td key={j} className="px-4 py-2.5 align-top">{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
