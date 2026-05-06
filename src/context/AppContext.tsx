import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User as SbUser } from "@supabase/supabase-js";

export type Profile = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  linkedin: string | null;
  leetcode: string | null;
  avatar_url: string | null;
  selected_track: string | null;
  onboarded: boolean;
};

export type Progress = {
  completedModules: string[];
  practiceScore: Record<string, number>;
  assignmentsDone: string[];
  activityDates: string[];
};

type AppCtx = {
  session: Session | null;
  authUser: SbUser | null;
  user: { name: string; email: string; linkedin?: string; leetcode?: string } | null;
  profile: Profile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  progress: Progress;
  completeModule: (id: string) => Promise<void>;
  setPracticeScore: (id: string, score: number, total?: number, answers?: number[], durationSec?: number, violations?: number, terminated?: boolean) => Promise<void>;
  completeAssignment: (id: string, problemId: string, code?: string, language?: string) => Promise<void>;
  selectedTrack: string | null;
  setSelectedTrack: (t: string | null) => Promise<void>;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<SbUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Progress>({
    completedModules: [], practiceScore: {}, assignmentsDone: [], activityDates: [],
  });

  const loadAll = useCallback(async (uid: string) => {
    const [{ data: prof }, { data: mp }, { data: pa }, { data: asg }, { data: act }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("module_progress").select("module_id,status").eq("user_id", uid),
      supabase.from("practice_attempts").select("module_id,score,created_at").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("assignment_submissions").select("problem_id").eq("user_id", uid),
      supabase.from("daily_activity").select("day").eq("user_id", uid),
    ]);
    setProfile((prof as any) ?? null);
    const completed = (mp ?? []).filter((m: any) => m.status === "completed").map((m: any) => m.module_id);
    const bestScore: Record<string, number> = {};
    (pa ?? []).forEach((p: any) => {
      bestScore[p.module_id] = Math.max(bestScore[p.module_id] ?? 0, p.score);
    });
    setProgress({
      completedModules: completed,
      practiceScore: bestScore,
      assignmentsDone: Array.from(new Set((asg ?? []).map((a: any) => a.problem_id))),
      activityDates: (act ?? []).map((a: any) => a.day),
    });
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setAuthUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => { loadAll(s.user.id); }, 0);
      } else {
        setProfile(null);
        setProgress({ completedModules: [], practiceScore: {}, assignmentsDone: [], activityDates: [] });
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthUser(s?.user ?? null);
      if (s?.user) loadAll(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadAll]);

  const refreshProgress = useCallback(async () => { if (authUser) await loadAll(authUser.id); }, [authUser, loadAll]);

  const completeModule = async (id: string) => {
    if (!authUser) return;
    await supabase.from("module_progress").upsert(
      { user_id: authUser.id, module_id: id, status: "completed", percent: 100, completed_at: new Date().toISOString() },
      { onConflict: "user_id,module_id" }
    );
    await refreshProgress();
  };

  const setPracticeScore: AppCtx["setPracticeScore"] = async (id, score, total = 30, answers = [], duration = 0, violations = 0, terminated = false) => {
    if (!authUser) return;
    await supabase.from("practice_attempts").insert({
      user_id: authUser.id, module_id: id, score, total, answers: answers as any, duration_seconds: duration, violations, terminated,
    });
    await supabase.from("module_progress").upsert(
      { user_id: authUser.id, module_id: id, status: "in_progress", percent: Math.round((score / total) * 100), last_opened_at: new Date().toISOString() },
      { onConflict: "user_id,module_id" }
    );
    await refreshProgress();
  };

  const completeAssignment: AppCtx["completeAssignment"] = async (moduleId, problemId, code = "", language = "javascript") => {
    if (!authUser) return;
    await supabase.from("assignment_submissions").insert({
      user_id: authUser.id, module_id: moduleId, problem_id: problemId, code, language, status: "submitted",
    });
    await refreshProgress();
  };

  const setSelectedTrack = async (t: string | null) => {
    if (!authUser) return;
    await supabase.from("profiles").update({ selected_track: t, onboarded: true }).eq("user_id", authUser.id);
    setProfile((p) => (p ? { ...p, selected_track: t, onboarded: true } : p));
  };

  const user = authUser
    ? {
        name: profile?.display_name || authUser.email?.split("@")[0] || "Learner",
        email: authUser.email || "",
        linkedin: profile?.linkedin || undefined,
        leetcode: profile?.leetcode || undefined,
      }
    : null;

  return (
    <Ctx.Provider
      value={{
        session, authUser, user, profile, loading,
        logout: async () => { await supabase.auth.signOut(); },
        refreshProgress, progress,
        completeModule, setPracticeScore, completeAssignment,
        selectedTrack: profile?.selected_track ?? null,
        setSelectedTrack,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp outside provider");
  return c;
}
