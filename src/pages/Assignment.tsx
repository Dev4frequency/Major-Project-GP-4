import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { ASSIGNMENTS, MODULES } from "@/data/content";

export default function Assignment() {
  const { id } = useParams();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const score = sp.get("score");
  const mod = MODULES.find((m) => m.id === id);

  return (
    <Shell>
      <div className="max-w-3xl mx-auto pt-6">
        {score !== null && (
          <div className="glass-soft rounded-2xl px-5 py-3 mb-6 text-sm">
            Practice complete — you scored <span className="text-primary font-semibold">{score}/30</span>. Continue with the assignment.
          </div>
        )}
        <div className="text-[10px] uppercase tracking-[0.3em] text-primary mb-2">Assignment · {mod?.title}</div>
        <h1 className="font-display text-4xl text-gradient mb-3">Coding problems</h1>
        <p className="text-muted-foreground">Solve any problem in the IDE. Monitoring activates when you start.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          {ASSIGNMENTS.map((a, i) => (
            <article key={a.id} className="glass rounded-2xl p-6 animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Problem 0{i + 1}</div>
              <h2 className="font-display text-2xl mb-2">{a.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.description}</p>
              <div className="mt-4 text-xs glass-soft rounded-lg p-3 font-mono">
                <div><span className="text-muted-foreground">Input:</span> {a.sample.input}</div>
                <div><span className="text-muted-foreground">Output:</span> {a.sample.output}</div>
              </div>
              <Button className="rounded-full mt-5 w-full" onClick={() => nav(`/ide/${id}/${a.id}`)}>Open IDE →</Button>
            </article>
          ))}
        </div>
      </div>
    </Shell>
  );
}
