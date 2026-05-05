import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { ASSIGNMENTS, MODULES } from "@/data/content";
import { enterFullscreen, exitFullscreen, useMonitor, DEFAULT_RULES, MonitorRules } from "@/hooks/useMonitor";
import MonitorHUD from "@/components/MonitorHUD";
import RulesEditor from "@/components/RulesEditor";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

const STARTERS: Record<string, string> = {
  javascript: "// Write your solution here\nfunction solve(input) {\n  // ...\n  return null;\n}\n",
  python: "# Write your solution here\ndef solve(input):\n    pass\n",
  cpp: "// Write your solution here\n#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  return 0;\n}\n",
};

export default function IDE() {
  const { id, problemId } = useParams();
  const nav = useNavigate();
  const mod = MODULES.find((m) => m.id === id);
  const problem = ASSIGNMENTS.find((a) => a.id === problemId);
  const { completeAssignment } = useApp();

  const [started, setStarted] = useState(false);
  const [terminated, setTerminated] = useState(false);
  const [lang, setLang] = useState<"javascript" | "python" | "cpp">("javascript");
  const [code, setCode] = useState(STARTERS.javascript);
  const [output, setOutput] = useState("");
  const [rules, setRules] = useState<MonitorRules>(DEFAULT_RULES);

  const onTerminate = useCallback(() => { setTerminated(true); exitFullscreen(); }, []);
  const { violations, events, maxStrikes } = useMonitor({ active: started && !terminated, onTerminate, rules });

  const start = async () => {
    if (rules.requireFullscreen) await enterFullscreen();
    setStarted(true);
    toast.success("IDE session started", { description: `Strike limit: ${rules.maxStrikes}.` });
  };

  const run = () => {
    setOutput("▷ Running…\n");
    setTimeout(() => {
      setOutput((o) => o + `✓ Mock execution complete.\nLanguage: ${lang}\nLines: ${code.split("\n").length}\n(Real execution requires a backend sandbox.)`);
    }, 500);
  };

  const submit = () => {
    if (problem) completeAssignment(problem.id);
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
            <h1 className="font-display text-3xl mb-4">Ready to code?</h1>
            <p className="text-sm text-muted-foreground">
              The IDE runs in {rules.requireFullscreen ? "monitored fullscreen" : "monitored mode"}. Configure detection on the right — for coding sessions you may want to allow copy/paste.
            </p>
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
            <h1 className="font-display text-3xl text-gradient">Session terminated</h1>
            <p className="text-muted-foreground mt-3">You exceeded the strike limit ({maxStrikes}).</p>
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
      <div className="pt-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-5 min-h-[78vh]">
          <aside className="lg:col-span-2 glass rounded-2xl p-6 overflow-y-auto">
            <div className="chip mb-3">{mod.title}</div>
            <h1 className="font-display text-3xl mb-4">{problem.title}</h1>
            <p className="text-sm text-foreground/90 leading-relaxed">{problem.description}</p>
            <div className="mt-5 text-xs glass-soft rounded-lg p-3 font-mono">
              <div className="text-muted-foreground mb-1">Sample</div>
              <div>Input: {problem.sample.input}</div>
              <div>Output: {problem.sample.output}</div>
            </div>
            <div className="mt-5">
              <MonitorHUD violations={violations} maxStrikes={maxStrikes} events={events} />
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
                <Button variant="ghost" size="sm" onClick={run} className="rounded-full">Run</Button>
                <Button size="sm" onClick={submit} className="rounded-full">Submit</Button>
              </div>
            </div>
            <div className="flex-1 min-h-[420px]">
              <Editor
                height="100%"
                language={lang}
                value={code}
                onChange={(v) => setCode(v ?? "")}
                theme="vs-dark"
                options={{ fontSize: 13, minimap: { enabled: false }, fontLigatures: true, smoothScrolling: true, padding: { top: 14 } }}
              />
            </div>
            {output && (
              <pre className="text-xs px-4 py-3 border-t border-border bg-background/40 max-h-40 overflow-auto whitespace-pre-wrap">{output}</pre>
            )}
          </section>
        </div>
      </div>
    </Shell>
  );
}
