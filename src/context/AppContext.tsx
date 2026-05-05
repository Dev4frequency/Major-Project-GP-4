import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type User = {
  name: string;
  email: string;
  linkedin?: string;
  leetcode?: string;
};

export type Progress = {
  completedModules: string[];
  practiceScore: Record<string, number>;
  assignmentsDone: string[];
};

type AppCtx = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  progress: Progress;
  completeModule: (id: string) => void;
  setPracticeScore: (id: string, score: number) => void;
  completeAssignment: (id: string) => void;
  selectedTrack: string | null;
  setSelectedTrack: (t: string | null) => void;
};

const Ctx = createContext<AppCtx | null>(null);

const KEY = "dev-assistant-state";

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress>({
    completedModules: [],
    practiceScore: {},
    assignmentsDone: [],
  });
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setUser(s.user ?? null);
        setProgress(s.progress ?? { completedModules: [], practiceScore: {}, assignmentsDone: [] });
        setSelectedTrack(s.selectedTrack ?? null);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ user, progress, selectedTrack }));
  }, [user, progress, selectedTrack]);

  return (
    <Ctx.Provider
      value={{
        user,
        login: setUser,
        logout: () => setUser(null),
        progress,
        completeModule: (id) =>
          setProgress((p) =>
            p.completedModules.includes(id) ? p : { ...p, completedModules: [...p.completedModules, id] }
          ),
        setPracticeScore: (id, score) =>
          setProgress((p) => ({ ...p, practiceScore: { ...p.practiceScore, [id]: score } })),
        completeAssignment: (id) =>
          setProgress((p) =>
            p.assignmentsDone.includes(id) ? p : { ...p, assignmentsDone: [...p.assignmentsDone, id] }
          ),
        selectedTrack,
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
