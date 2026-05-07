import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { MODULES } from "@/data/content";
import { MODULE_SECTIONS, buildGenericSections } from "@/data/sections";
import CodeBlock from "@/components/CodeBlock";

export default function Learning() {
  const { id } = useParams();
  const nav = useNavigate();
  const mod = MODULES.find((m) => m.id === id);

  const sections = useMemo(() => {
    if (!mod) return [];
    return MODULE_SECTIONS[mod.id] ?? buildGenericSections(mod.title, mod.track, mod.blurb);
  }, [mod]);

  const [active, setActive] = useState<string>(sections[0]?.id ?? "intro");

  if (!mod) return <Shell><div className="pt-10">Module not found.</div></Shell>;

  const current = sections.find((s) => s.id === active) ?? sections[0];

  return (
    <Shell>
      <div className="pt-6 pb-10">
        <button onClick={() => nav("/modules")} className="text-xs text-muted-foreground hover:text-foreground mb-3">← All modules</button>

        <div className="flex items-center gap-2 mb-3">
          <span className="chip">{mod.track}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{mod.level} · {mod.duration}</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-glow-white">{mod.title}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">{mod.blurb}</p>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_220px] gap-5 mt-8">
          {/* LEFT: section nav */}
          <aside className="glass rounded-2xl p-3 lg:sticky lg:top-24 h-fit">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 py-2">Sections</div>
            <nav className="flex lg:flex-col gap-1 overflow-x-auto">
              {sections.map((s, i) => (
                <button key={s.id} onClick={() => setActive(s.id)}
                  className={`text-left text-xs px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                    active === s.id
                      ? "bg-primary/20 border border-primary/40 text-foreground"
                      : "border border-transparent hover:bg-foreground/5 text-muted-foreground"
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}>
                  <span className="font-mono mr-2 text-[10px] opacity-60">{String(i + 1).padStart(2, "0")}</span>
                  {s.heading}
                </button>
              ))}
            </nav>
          </aside>

          {/* CENTER: section content */}
          <article key={current.id} className="glass rounded-3xl p-6 md:p-8 animate-fade-in">
            <div className="text-[10px] uppercase tracking-widest text-glow-ocean mb-2">{mod.title} — Section</div>
            <h2 className="font-display text-3xl text-glow-white">{current.heading}</h2>
            <p className="mt-4 leading-relaxed text-foreground/90">{current.body}</p>

            {current.bullets && (
              <ul className="mt-5 space-y-2 text-sm">
                {current.bullets.map((b) => (
                  <li key={b} className="flex gap-2"><span className="text-primary">▸</span><span>{b}</span></li>
                ))}
              </ul>
            )}

            {current.code?.map((c, i) => (
              <CodeBlock key={i} code={c.snippet} language={c.language} />
            ))}

            {/* Original lessons appended for richness */}
            {active === sections[0].id && mod.lessons.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Quick lessons</div>
                <div className="space-y-4">
                  {mod.lessons.map((l, i) => (
                    <div key={i} className="glass-soft rounded-xl p-4">
                      <div className="font-display text-lg mb-1">{l.heading}</div>
                      <p className="text-sm text-foreground/85">{l.body}</p>
                      {l.example && <pre className="mt-2 text-xs glass-soft rounded p-2 overflow-x-auto"><code>{l.example}</code></pre>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3 justify-end">
              <Button variant="ghost" onClick={() => nav(`/assistant?topic=${encodeURIComponent(mod.title)}`)} className="rounded-full">
                Ask AI about this →
              </Button>
              <Button onClick={() => nav(`/practice/${mod.id}`)} className="rounded-full px-7" size="lg">Start Practice →</Button>
            </div>
          </article>

          {/* RIGHT: side actions (desktop only) */}
          <aside className="hidden lg:block">
            <div className="glass rounded-2xl p-5 lg:sticky lg:top-24 hover-glow-white">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Next step</div>
              <div className="text-sm text-foreground/85 mb-4">
                When you can read every code block here without a hint, take the 30-MCQ practice test.
              </div>
              <Button className="rounded-full w-full" onClick={() => nav(`/practice/${mod.id}`)}>Take practice</Button>
              <Button variant="ghost" className="rounded-full w-full mt-2"
                onClick={() => nav(`/assistant?topic=${encodeURIComponent(mod.title)}`)}>
                Ask the AI
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
