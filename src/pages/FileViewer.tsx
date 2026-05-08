import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Shell from "@/components/Shell";

/**
 * Read-only viewer for any source file in the repo. Path comes from the URL,
 * e.g. /file/src/pages/IDE.tsx — the leading "/" is stripped.
 *
 * Files are served by Vite from the project root in dev/preview, so we fetch
 * them at runtime. Production builds may not expose source files; in that
 * case the viewer falls back to an explanatory message and a GitHub-style
 * link the user can share.
 */
export default function FileViewer() {
  const { "*": splat } = useParams();
  const nav = useNavigate();
  const path = splat ?? "";
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;
    setContent(null); setError(null);
    fetch(`/${path}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const text = await r.text();
        // Vite dev returns transformed JS for .tsx — guard against that.
        if (text.startsWith("<!DOCTYPE") || text.includes("<html")) throw new Error("File not directly accessible in this build.");
        setContent(text);
      })
      .catch((e) => setError(e?.message ?? "Could not load file."));
  }, [path]);

  const language =
    path.endsWith(".ts") || path.endsWith(".tsx") ? "typescript"
    : path.endsWith(".js") || path.endsWith(".jsx") ? "javascript"
    : path.endsWith(".sql") ? "sql"
    : path.endsWith(".css") ? "css"
    : path.endsWith(".toml") ? "toml"
    : "text";

  return (
    <Shell>
      <div className="pt-4 pb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Codebase</div>
            <h1 className="font-display text-2xl md:text-3xl text-glow-white break-all">{path}</h1>
            <div className="text-xs text-muted-foreground mt-1">Language: {language}</div>
          </div>
          <button onClick={() => nav(-1)} className="text-xs text-muted-foreground hover:text-foreground shrink-0">← Back</button>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          {content === null && !error && (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading source…</div>
          )}
          {error && (
            <div className="p-8 text-sm text-muted-foreground">
              <div className="text-destructive mb-2">⚠ {error}</div>
              <div>This file lives at <code className="font-mono text-xs">{path}</code> in the repository.</div>
            </div>
          )}
          {content && (
            <pre className="text-[12px] leading-relaxed font-mono p-5 overflow-auto max-h-[75vh] whitespace-pre">
              {content}
            </pre>
          )}
        </div>
      </div>
    </Shell>
  );
}
