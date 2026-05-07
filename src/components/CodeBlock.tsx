import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CodeBlock({ code, language = "javascript" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };
  return (
    <div className="relative glass-soft rounded-xl overflow-hidden border border-border/60 my-3">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/60 text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{language}</span>
        <button onClick={copy} className="inline-flex items-center gap-1 hover:text-foreground transition">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="text-xs p-4 overflow-x-auto"><code>{code}</code></pre>
    </div>
  );
}
