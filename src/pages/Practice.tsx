import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { MCQS, MODULES } from "@/data/content";
import { useApp } from "@/context/AppContext";
import { enterFullscreen, exitFullscreen, useMonitor } from "@/hooks/useMonitor";
import { toast } from "sonner";

const DURATION = 15 * 60;

export default function Practice() {
  const { id } = useParams();
  const nav = useNavigate();
  const mod = MODULES.find((m) => m.id === id);
  const { setPracticeScore, completeModule } = useApp();

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(MCQS.length).fill(-1));
  const [time, setTime] = useState(DURATION);
  const [terminated, setTerminated] = useState(false);

  const onTerminate = useCallback(() => {
    setTerminated(true);
    exitFullscreen();
  }, []);

  useMonitor({ active: started && !terminated, onTerminate });

  useEffect(() => {
    if (!started || terminated) return;
    const t = setInterval(() => setTime((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [started, terminated]);

  useEffect(() => { if (started && time === 0) finish(); /* eslint-disable-next-line */ }, [time]);

  const start = async () => { await enterFullscreen(); setStarted(true); toast.success("Test started — stay in fullscreen."); };

  const finish = useCallback(() => {
    const score = answers.reduce((s, a, i) => (a === MCQS[i].a ? s + 1 : s), 0);
    if (mod) {
      setPracticeScore(mod.id, score);
      completeModule(mod.id);
    }
    exitFullscreen();
    nav(`/assignment/${mod?.id ?? ""}?score=${score}`);
  }, [answers, mod, nav, setPracticeScore, completeModule]);

  const mm = String(Math.floor(time / 60)).padStart(2, "0");
  const ss = String(time % 60).padStart(2, "0");
  const q = MCQS[idx];
  const answered = useMemo(() => answers.filter((a) => a !== -1).length, [answers]);

  if (!mod) return <Shell><div className="pt-10">Module not found.</div></Shell>;

  if (!started) {
    return (
      <Shell>
        <div className="max-w-2xl mx-auto pt-12">
          <div className="glass rounded-3xl p-8">
            <div className="text-[10px] uppercase tracking-[0.3em] text-primary mb-2">Practice · {mod.title}</div>
            <h1 className="font-display text-3xl mb-4">Before you begin</h1>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 30 multiple-choice questions, 15-minute timer.</li>
              <li>• Test runs in fullscreen and is monitored.</li>
              <li>• Tab switching, copy/paste, or exiting fullscreen counts as a violation.</li>
              <li>• 3 violations terminate the test.</li>
            </ul>
            <Button className="rounded-full mt-7 px-7" size="lg" onClick={start}>Start Test</Button>
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
            <p className="text-muted-foreground mt-3">You exceeded the violation limit. Return to the module to retry.</p>
            <Button className="rounded-full mt-6" onClick={() => nav("/modules")}>Back to Modules</Button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-3xl mx-auto pt-6">
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
                  answers[idx] === i
                    ? "border-primary bg-primary/10"
                    : "border-border glass-soft hover:border-primary/40"
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
    </Shell>
  );
}
