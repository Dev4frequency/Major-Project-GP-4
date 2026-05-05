import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

export type ViolationKind = "tab-switch" | "copy" | "paste" | "fullscreen-exit" | "right-click" | "devtools-shortcut" | "window-blur";

export type ViolationEvent = {
  id: string;
  kind: ViolationKind;
  label: string;
  detail: string;
  at: number;
  count: number;
};

export type MonitorRules = {
  /** Total strikes allowed before termination. */
  maxStrikes: number;
  /** Detection toggles. */
  detectTabSwitch: boolean;
  detectCopyPaste: boolean;
  detectFullscreenExit: boolean;
  detectRightClick: boolean;
  detectDevtoolsShortcuts: boolean;
  detectWindowBlur: boolean;
  /** Require fullscreen during the session. */
  requireFullscreen: boolean;
};

export const DEFAULT_RULES: MonitorRules = {
  maxStrikes: 3,
  detectTabSwitch: true,
  detectCopyPaste: true,
  detectFullscreenExit: true,
  detectRightClick: true,
  detectDevtoolsShortcuts: true,
  detectWindowBlur: true,
  requireFullscreen: true,
};

const KIND_META: Record<ViolationKind, { label: string; detail: string }> = {
  "tab-switch":         { label: "Tab switch detected",       detail: "You navigated away from the test tab." },
  "copy":               { label: "Copy detected",             detail: "Copying content is not allowed." },
  "paste":              { label: "Paste detected",            detail: "Pasting external content is not allowed." },
  "fullscreen-exit":    { label: "Fullscreen exited",         detail: "Stay in fullscreen until you submit." },
  "right-click":        { label: "Right-click blocked",       detail: "Context menu is disabled during a test." },
  "devtools-shortcut":  { label: "Developer tools shortcut",  detail: "DevTools shortcuts are not allowed." },
  "window-blur":        { label: "Window lost focus",         detail: "Another window or app took focus." },
};

type Opts = {
  active: boolean;
  onTerminate: () => void;
  rules?: Partial<MonitorRules>;
};

export function useMonitor({ active, onTerminate, rules: overrides }: Opts) {
  const rules: MonitorRules = { ...DEFAULT_RULES, ...overrides };
  const [violations, setViolations] = useState(0);
  const [events, setEvents] = useState<ViolationEvent[]>([]);
  const violationsRef = useRef(0);
  const lastBumpRef = useRef(0);

  const bump = useCallback(
    (kind: ViolationKind) => {
      // 600ms debounce avoids double-counting (e.g. blur+visibility from same action)
      const now = Date.now();
      if (now - lastBumpRef.current < 600) return;
      lastBumpRef.current = now;

      violationsRef.current += 1;
      const v = violationsRef.current;
      setViolations(v);

      const meta = KIND_META[kind];
      const ev: ViolationEvent = {
        id: `${now}-${kind}`,
        kind,
        label: meta.label,
        detail: meta.detail,
        at: now,
        count: v,
      };
      setEvents((prev) => [ev, ...prev].slice(0, 20));

      const remaining = Math.max(0, rules.maxStrikes - v);
      if (v < rules.maxStrikes) {
        const fn = v === 1 ? toast.warning : toast.error;
        fn(`${meta.label} · Strike ${v}/${rules.maxStrikes}`, {
          description: `${meta.detail} ${remaining} strike${remaining === 1 ? "" : "s"} remaining.`,
          duration: 5000,
        });
      } else {
        toast.error("Test terminated", {
          description: `${meta.label} — strike limit (${rules.maxStrikes}) reached.`,
          duration: 8000,
        });
        onTerminate();
      }
    },
    [onTerminate, rules.maxStrikes]
  );

  useEffect(() => {
    if (!active) return;

    const onVisibility = () => { if (document.hidden && rules.detectTabSwitch) bump("tab-switch"); };
    const onBlur = () => { if (rules.detectWindowBlur) bump("window-blur"); };
    const onCopy = (e: ClipboardEvent) => { if (rules.detectCopyPaste) { e.preventDefault(); bump("copy"); } };
    const onPaste = (e: ClipboardEvent) => { if (rules.detectCopyPaste) { e.preventDefault(); bump("paste"); } };
    const onFs = () => { if (rules.detectFullscreenExit && rules.requireFullscreen && !document.fullscreenElement) bump("fullscreen-exit"); };
    const onContext = (e: MouseEvent) => { if (rules.detectRightClick) { e.preventDefault(); bump("right-click"); } };
    const onKey = (e: KeyboardEvent) => {
      if (!rules.detectDevtoolsShortcuts) return;
      const k = e.key.toLowerCase();
      const ctrlShift = (e.ctrlKey || e.metaKey) && e.shiftKey;
      if (e.key === "F12" || (ctrlShift && (k === "i" || k === "j" || k === "c")) || ((e.ctrlKey || e.metaKey) && k === "u")) {
        e.preventDefault();
        bump("devtools-shortcut");
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("keydown", onKey);
    };
  }, [active, bump, rules.detectTabSwitch, rules.detectWindowBlur, rules.detectCopyPaste, rules.detectFullscreenExit, rules.detectRightClick, rules.detectDevtoolsShortcuts, rules.requireFullscreen]);

  return { violations, events, maxStrikes: rules.maxStrikes };
}

export async function enterFullscreen() {
  try { await document.documentElement.requestFullscreen(); } catch {}
}
export async function exitFullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); } catch {}
}
