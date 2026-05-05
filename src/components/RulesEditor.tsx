import { MonitorRules } from "@/hooks/useMonitor";

export default function RulesEditor({
  rules,
  onChange,
}: {
  rules: MonitorRules;
  onChange: (r: MonitorRules) => void;
}) {
  const set = <K extends keyof MonitorRules>(k: K, v: MonitorRules[K]) =>
    onChange({ ...rules, [k]: v });

  const toggles: { key: keyof MonitorRules; label: string; hint: string }[] = [
    { key: "detectTabSwitch",        label: "Tab switching",         hint: "Flag when the test tab is hidden." },
    { key: "detectCopyPaste",        label: "Copy / paste",          hint: "Block clipboard and count as a strike." },
    { key: "detectFullscreenExit",   label: "Fullscreen exit",       hint: "Flag when the user leaves fullscreen." },
    { key: "detectRightClick",       label: "Right-click",           hint: "Block the context menu." },
    { key: "detectDevtoolsShortcuts",label: "DevTools shortcuts",    hint: "Block F12, Ctrl+Shift+I/J/C, Ctrl+U." },
    { key: "detectWindowBlur",       label: "Window focus loss",     hint: "Flag when another app takes focus." },
    { key: "requireFullscreen",      label: "Require fullscreen",    hint: "Enforce fullscreen for the session." },
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Strike limit</label>
          <span className="font-mono text-emerald text-sm">{rules.maxStrikes}</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={rules.maxStrikes}
          onChange={(e) => set("maxStrikes", Number(e.target.value))}
          className="w-full accent-emerald"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Strict (1)</span><span>Default (3)</span><span>Lenient (5)</span>
        </div>
      </div>

      <div className="space-y-2">
        {toggles.map((t) => (
          <label
            key={t.key}
            className="flex items-start justify-between gap-3 glass-soft rounded-xl px-4 py-3 cursor-pointer hover:border-primary/40 border border-transparent transition-colors"
          >
            <div className="min-w-0">
              <div className="text-sm">{t.label}</div>
              <div className="text-[11px] text-muted-foreground">{t.hint}</div>
            </div>
            <input
              type="checkbox"
              checked={rules[t.key] as boolean}
              onChange={(e) => set(t.key, e.target.checked as never)}
              className="mt-1 h-4 w-4 accent-emerald shrink-0"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
