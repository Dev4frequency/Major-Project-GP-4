import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { ASSIGNMENTS, MODULES } from "@/data/content";
import { enterFullscreen, exitFullscreen, useMonitor, DEFAULT_RULES, MonitorRules } from "@/hooks/useMonitor";
import MonitorHUD from "@/components/MonitorHUD";
import RulesEditor from "@/components/RulesEditor";
import CameraMonitor from "@/components/CameraMonitor";
import { usePlagiarismMonitor } from "@/hooks/usePlagiarismMonitor";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STARTERS: Record<string, string> = {
  javascript: "// Write your solution here\nfunction solve(input) {\n  return input;\n}\n\nconsole.log(solve('hello'));\n",
  python: "# Write your solution here\ndef solve(x):\n    return x\n\nprint(solve('hello'))\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  cout << \"hello\" << endl;\n  return 0;\n}\n",
};

export default function IDE() {
  const { id, problemId } = useParams();
  const nav = useNavigate();
  const mod = MODULES.find((m) => m.id === id);
  const problem = ASSIGNMENTS.find((a) => a.id === problemId);
  const { completeAssignment, authUser } = useApp();

  const [started, setStarted] = useState(false);
  const [terminated, setTerminated] = useState(false);
  const [lang, setLang] = useState<"javascript" | "python" | "cpp">("javascript");
  const [code, setCode] = useState(STARTERS.javascript);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [rules, setRules] = useState<MonitorRules>(DEFAULT_RULES);

  const onTerminate = useCallback(async () => {
    setTerminated(true);
    exitFullscreen();
    if (authUser && mod) {
      await supabase.from("monitor_events").insert({
        user_id: authUser.id, kind: "terminate", session_kind: "ide",
        module_id: mod.id, problem_id: problem?.id ?? null,
        detail: "Strike limit reached — IDE session terminated.",
      });
    }
    toast.error("Session terminated — redirecting to dashboard.");
    setTimeout(() => nav("/dashboard", { replace: true }), 1200);
  }, [authUser, mod, problem, nav]);

  const { violations, events, maxStrikes } = useMonitor({ active: started && !terminated, onTerminate, rules });
  const { flags, onChange: onPlagChange, totalFlags } = usePlagiarismMonitor(started && !terminated);

  const onAbsence = useCallback(async () => {
    if (!authUser || !mod) return;
    await supabase.from("monitor_events").insert({
      user_id: authUser.id, kind: "face-absent", session_kind: "ide",
      module_id: mod.id, problem_id: problem?.id ?? null,
      detail: "Face not detected for 5+ seconds.",
    });
  }, [authUser, mod, problem]);

  const start = async () => {
    if (rules.requireFullscreen) await enterFullscreen();
    setStarted(true);
    toast.success("IDE session started", { description: `Strike limit: ${rules.maxStrikes}.` });
  };

  const runJsLocally = (src: string) => {
    const logs: string[] = [];
    const fakeConsole = {
      log: (...a: any[]) => logs.push(a.map(String).join(" ")),
      error: (...a: any[]) => logs.push("[err] " + a.map(String).join(" ")),
      warn: (...a: any[]) => logs.push("[warn] " + a.map(String).join(" ")),
    };
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function("console", src);
      fn(fakeConsole);
      return logs.join("\n") || "(no output)";
    } catch (e: any) {
      return `Error: ${e?.message ?? e}`;
    }
  };

  const run = async () => {
    setRunning(true);
    setOutput("▷ Running…\n");
    try {
      if (lang === "javascript") {
        setOutput(`▷ Output\n${runJsLocally(code)}`);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/run-code`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ language: lang, code }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          setOutput(`✗ ${data?.error ?? "Run failed"}`);
        } else {
          const out = (data.stdout || "") + (data.stderr ? `\n[stderr]\n${data.stderr}` : "");
          setOutput(out || "(no output)");
        }
      }
    } catch (e: any) {
      setOutput(`✗ ${e?.message ?? "Run failed"}`);
    } finally {
      setRunning(false);
    }
  };

  const submit = async () => {
    if (problem && mod) await completeAssignment(mod.id, problem.id, code, lang);
    exitFullscreen();
    toast.success("Submission accepted");
    nav("/dashboard");
  };

  if (!mod || !problem) return <Shell><div className="pt-10">Not found.</div></Shell>;

  if (!started) {
    return (
      <Shell>
        <div className="max-w-4xl mx-auto pt-10 grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 glass rounded-3xl p-8">
            <div className="chip mb-3">IDE · {problem.title}</div>
            <h1 className="font-display text-3xl mb-4 text-glow-white">Ready to code?</h1>
            <p className="text-sm text-muted-foreground">
              The IDE runs in {rules.requireFullscreen ? "monitored fullscreen" : "monitored mode"} with
              <span className="text-foreground"> webcam attention tracking</span> and
              <span className="text-foreground"> plagiarism detection</span>. Cheating
              terminates the session and redirects you to the dashboard.
            </p>
            <ul className="text-xs text-muted-foreground mt-4 space-y-1">
              <li>• Camera permission will be requested when you start.</li>
              <li>• Looking away &gt; 5s triggers a face-not-detected warning.</li>
              <li>• Pasting code from external sources is detected and blocked.</li>
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
            <h1 className="font-display text-3xl text-glow-white">Session terminated</h1>
            <p className="text-muted-foreground mt-3">You exceeded the strike limit ({maxStrikes}). Heading back to your dashboard…</p>
            <div className="mt-5 text-left max-w-sm mx-auto">
              <MonitorHUD violations={violations} maxStrikes={maxStrikes} events={events} />
            </div>
            <Button className="rounded-full mt-6" onClick={() => nav("/dashboard")}>Go to Dashboard</Button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="pt-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-5 min-h-[78vh]">
          <aside className="lg:col-span-2 glass rounded-2xl p-6 overflow-y-auto">
            <div className="chip mb-3">{mod.title}</div>
            <h1 className="font-display text-3xl mb-4 text-glow-white">{problem.title}</h1>
            <p className="text-sm text-foreground/90 leading-relaxed">{problem.description}</p>
            <div className="mt-5 text-xs glass-soft rounded-lg p-3 font-mono">
              <div className="text-muted-foreground mb-1">Sample</div>
              <div>Input: {problem.sample.input}</div>
              <div>Output: {problem.sample.output}</div>
            </div>
            <div className="mt-5 space-y-3">
              <CameraMonitor active={started && !terminated} onAbsence={onAbsence} />
              <MonitorHUD violations={violations} maxStrikes={maxStrikes} events={events} />
              {totalFlags > 0 && (
                <div className="glass rounded-2xl p-3 text-xs ring-1 ring-destructive/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="uppercase tracking-widest text-destructive">Plagiarism flags</span>
                    <span className="font-mono text-destructive">{totalFlags}</span>
                  </div>
                  <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {flags.slice(0, 4).map((f) => (
                      <li key={f.id}>
                        <div className="text-foreground/85">{f.reason}</div>
                        <div className="text-[10px] text-muted-foreground truncate font-mono">{f.excerpt}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>

          <section className="lg:col-span-4 glass rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <select
                value={lang}
                onChange={(e) => { const v = e.target.value as typeof lang; setLang(v); setCode(STARTERS[v]); }}
                className="bg-transparent text-sm border border-border rounded-md px-2 py-1 focus:outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
              </select>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={run} disabled={running} className="rounded-full">
                  {running ? "Running…" : "Run"}
                </Button>
                <Button size="sm" onClick={submit} className="rounded-full">Submit</Button>
              </div>
            </div>
            <div className="flex-1 min-h-[420px]">
              <Editor
                height="100%"
                language={lang}
                value={code}
                onChange={(v) => { const next = v ?? ""; onPlagChange(next); setCode(next); }}
                theme="vs-dark"
                options={{ fontSize: 13, minimap: { enabled: false }, fontLigatures: true, smoothScrolling: true, padding: { top: 14 } }}
              />
            </div>
            {output && (
              <pre className="text-xs px-4 py-3 border-t border-border bg-background/40 max-h-48 overflow-auto whitespace-pre-wrap">{output}</pre>
            )}
          </section>
        </div>
      </div>
    </Shell>
  );
}
