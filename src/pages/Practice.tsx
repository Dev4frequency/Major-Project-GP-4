import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { MCQS, MODULES } from "@/data/content";
import { useApp } from "@/context/AppContext";
import { enterFullscreen, exitFullscreen, useMonitor, DEFAULT_RULES, MonitorRules } from "@/hooks/useMonitor";
import MonitorHUD from "@/components/MonitorHUD";
import RulesEditor from "@/components/RulesEditor";
import CameraMonitor from "@/components/CameraMonitor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DURATION = 15 * 60;

export default function Practice() {
  const { id } = useParams();
  const nav = useNavigate();
  const mod = MODULES.find((m) => m.id === id);
  const { setPracticeScore, completeModule, authUser } = useApp();

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(MCQS.length).fill(-1));
  const [time, setTime] = useState(DURATION);
  const [terminated, setTerminated] = useState(false);
  const [rules, setRules] = useState<MonitorRules>(DEFAULT_RULES);

  const onTerminate = useCallback(async () => {
    setTerminated(true);
    exitFullscreen();
    if (authUser && mod) {
      await supabase.from("monitor_events").insert({
        user_id: authUser.id, kind: "terminate", session_kind: "practice",
        module_id: mod.id, detail: "Strike limit reached — practice terminated.",
      });
      // Save the failed attempt with terminated=true
      const score = answers.reduce((s, a, i) => (a === MCQS[i].a ? s + 1 : s), 0);
      await setPracticeScore(mod.id, score, MCQS.length, answers, DURATION - time, 0, true);
    }
    toast.error("Test terminated — redirecting to dashboard.");
    setTimeout(() => nav("/dashboard", { replace: true }), 1200);
  }, [authUser, mod, answers, time, nav, setPracticeScore]);
  const { violations, events, maxStrikes } = useMonitor({ active: started && !terminated, onTerminate, rules });

  const onAbsence = useCallback(async () => {
    if (!authUser || !mod) return;
    await supabase.from("monitor_events").insert({
      user_id: authUser.id, kind: "face-absent", session_kind: "practice",
      module_id: mod.id, detail: "Face not detected for 5+ seconds.",
    });
  }, [authUser, mod]);

  useEffect(() => {
    if (!started || terminated) return;
    const t = setInterval(() => setTime((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [started, terminated]);

  const finish = useCallback(() => {
    const score = answers.reduce((s, a, i) => (a === MCQS[i].a ? s + 1 : s), 0);
    if (mod) { setPracticeScore(mod.id, score); completeModule(mod.id); }
    exitFullscreen();
    nav(`/assignment/${mod?.id ?? ""}?score=${score}`);
  }, [answers, mod, nav, setPracticeScore, completeModule]);

  useEffect(() => { if (started && time === 0) finish(); }, [time, started, finish]);

  const start = async () => {
    if (rules.requireFullscreen) await enterFullscreen();
    setStarted(true);
    toast.success("Test started", { description: `Strike limit: ${rules.maxStrikes}. Stay focused.` });
  };

  const mm = String(Math.floor(time / 60)).padStart(2, "0");
  const ss = String(time % 60).padStart(2, "0");
  const q = MCQS[idx];
  const answered = useMemo(() => answers.filter((a) => a !== -1).length, [answers]);

  if (!mod) return <Shell><div className="pt-10">Module not found.</div></Shell>;

  if (!started) {
    return (
      <Shell>
        <div className="max-w-4xl mx-auto pt-10 grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 glass rounded-3xl p-8">
            <div className="chip mb-3">Practice · {mod.title}</div>
            <h1 className="font-display text-3xl mb-4">Before you begin</h1>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 30 multiple-choice questions, 15-minute timer.</li>
              <li>• Test runs in {rules.requireFullscreen ? "fullscreen and is monitored" : "monitored mode"}.</li>
              <li>• Configure detection rules and strike limit on the right.</li>
              <li>• <span className="text-foreground">{rules.maxStrikes} strikes</span> end the test immediately.</li>
            </ul>
            <Button className="rounded-full mt-7 px-7" size="lg" onClick={start}>Start Test</Button>
          </div>
          <div className="lg:col-span-2 glass rounded-3xl p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Monitoring rules</div>
            <RulesEditor rules={rules} onChange={setRules} />
          </div>
        </div>
      </Shell>
    );
  }

  if (terminated) {
    return (
      <Shell>
        <div className="max-w-xl mx-auto pt-16 text-center">
          <div className="glass rounded-3xl p-10">
            <h1 className="font-display text-3xl text-gradient">Test terminated</h1>
            <p className="text-muted-foreground mt-3">You exceeded the strike limit ({maxStrikes}). Return to the module to retry.</p>
            <div className="mt-5 text-left max-w-sm mx-auto">
              <MonitorHUD violations={violations} maxStrikes={maxStrikes} events={events} />
            </div>
            <Button className="rounded-full mt-6" onClick={() => nav("/modules")}>Back to Modules</Button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-5xl mx-auto pt-6 grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Practice · {mod.title}</div>
            <div className="font-mono text-sm glass-soft rounded-full px-3 py-1">{mm}:{ss}</div>
          </div>

          <div className="glass rounded-3xl p-7">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <span>Question {idx + 1} of {MCQS.length}</span>
              <span>{answered} answered</span>
            </div>
            <h2 className="text-xl mb-5">{q.q}</h2>
            <div className="space-y-2">
              {q.opts.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setAnswers((a) => a.map((v, j) => (j === idx ? i : v)))}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    answers[idx] === i ? "border-primary bg-primary/10" : "border-border glass-soft hover:border-primary/40"
                  }`}
                >
                  <span className="text-xs text-muted-foreground mr-3">{String.fromCharCode(65 + i)}</span>{opt}
                </button>
              ))}
            </div>

            <div className="mt-7 flex items-center justify-between">
              <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)} className="rounded-full">← Previous</Button>
              {idx < MCQS.length - 1 ? (
                <Button onClick={() => setIdx(idx + 1)} className="rounded-full">Next →</Button>
              ) : (
                <Button onClick={finish} className="rounded-full">Submit</Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1.5 mt-5">
            {MCQS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-2 rounded-full transition-all ${
                  i === idx ? "bg-primary" : answers[i] !== -1 ? "bg-foreground/40" : "bg-foreground/10"
                }`}
              />
            ))}
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-3">
            <CameraMonitor active={started && !terminated} onAbsence={onAbsence} />
            <MonitorHUD violations={violations} maxStrikes={maxStrikes} events={events} />
          </div>
        </aside>
      </div>
    </Shell>
  );
}
