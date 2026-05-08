import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Plagiarism heuristic for a Monaco-style editor:
 *   1. Listen for clipboard paste from outside the editor.
 *   2. Track typing velocity — sudden bursts of >40 chars between keystrokes
 *      (without typing them) flag a likely paste-through.
 *   3. Flag chunks of code that look pasted from AI: presence of unusual
 *      characters (non-ASCII smart quotes, prose-y comment markers) or sudden
 *      large "block" insertions.
 */
export type PlagiarismFlag = {
  id: string;
  at: number;
  reason: string;
  size: number;
  excerpt: string;
};

export function usePlagiarismMonitor(active: boolean) {
  const [flags, setFlags] = useState<PlagiarismFlag[]>([]);
  const lastLengthRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  const push = useCallback((reason: string, excerpt: string, size: number) => {
    const f: PlagiarismFlag = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: Date.now(), reason, size, excerpt: excerpt.slice(0, 120),
    };
    setFlags((prev) => [f, ...prev].slice(0, 10));
    toast.error("⚠ Plagiarism warning", {
      description: `${reason} (${size} chars). This will be flagged on submission.`,
      duration: 5000,
    });
  }, []);

  /** Call from Monaco onChange / textarea onChange. */
  const onChange = useCallback((value: string) => {
    if (!active) { lastLengthRef.current = value.length; return; }
    const now = Date.now();
    const dt = now - lastTimeRef.current;
    const dLen = value.length - lastLengthRef.current;

    // Burst: >40 chars added in <120ms ≈ paste, not typing.
    if (dLen > 40 && dt < 120) {
      const tail = value.slice(Math.max(0, value.length - dLen));
      push("Burst insertion (likely paste)", tail, dLen);
    }
    // Smart quotes / prose typical of AI-generated code or web copy
    else if (dLen > 8 && /[“”‘’]|—|→/.test(value.slice(Math.max(0, value.length - dLen)))) {
      push("Non-source typography detected", value.slice(Math.max(0, value.length - dLen)), dLen);
    }
    lastLengthRef.current = value.length;
    lastTimeRef.current = now;
  }, [active, push]);

  // Catch raw paste events at the document level too.
  useEffect(() => {
    if (!active) return;
    const onPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text") ?? "";
      if (text.length > 60) {
        push("External paste blocked", text, text.length);
        e.preventDefault();
      }
    };
    document.addEventListener("paste", onPaste, true);
    return () => document.removeEventListener("paste", onPaste, true);
  }, [active, push]);

  return { flags, onChange, totalFlags: flags.length };
}
