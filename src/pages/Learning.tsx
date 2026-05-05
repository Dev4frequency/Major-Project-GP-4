import { useNavigate, useParams } from "react-router-dom";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { MODULES } from "@/data/content";

export default function Learning() {
  const { id } = useParams();
  const nav = useNavigate();
  const mod = MODULES.find((m) => m.id === id);
  if (!mod) return <Shell><div className="pt-10">Module not found.</div></Shell>;

  return (
    <Shell>
      <div className="max-w-3xl pt-6 pb-10">
        <button onClick={() => nav("/modules")} className="text-xs text-muted-foreground hover:text-foreground mb-3">← All modules</button>
        <div className="text-[10px] uppercase tracking-[0.3em] text-primary mb-2">{mod.track}</div>
        <h1 className="font-display text-5xl text-gradient">{mod.title}</h1>
        <p className="text-muted-foreground mt-3">{mod.blurb}</p>

        <div className="mt-10 space-y-6">
          {mod.lessons.map((l, i) => (
            <article key={i} className="glass rounded-2xl p-7 animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Lesson 0{i + 1}</div>
              <h2 className="font-display text-2xl mb-3">{l.heading}</h2>
              <p className="text-sm leading-relaxed text-foreground/90">{l.body}</p>
              {l.example && (
                <pre className="mt-4 text-xs glass-soft rounded-lg p-3 overflow-x-auto"><code>{l.example}</code></pre>
              )}
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <Button onClick={() => nav(`/practice/${mod.id}`)} className="rounded-full px-7" size="lg">Start Practice →</Button>
        </div>
      </div>
    </Shell>
  );
}
