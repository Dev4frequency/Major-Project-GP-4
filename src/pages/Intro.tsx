import { useNavigate } from "react-router-dom";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

const features = [
  { title: "AI Assistant", body: "Tell it what you want to learn — get a tailored path, no overwhelm.", to: "/assistant" },
  { title: "Modules", body: "Curated, structured topics that build on each other in the right order.", to: "/modules" },
  { title: "Practice", body: "Timed MCQs and coding tasks — proctored to keep things honest.", to: "/modules" },
  { title: "IDE", body: "Solve assignments in a clean Monaco editor with monitored full-screen mode.", to: "/modules" },
];

export default function Intro() {
  const nav = useNavigate();
  const { user } = useApp();
  return (
    <Shell>
      <section className="pt-10 pb-16 max-w-4xl">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Welcome{user ? `, ${user.name.split(" ")[0]}` : ""}
        </div>
        <h1 className="font-display text-5xl md:text-6xl leading-tight text-gradient">
          A guided journey from concept to monitored mastery.
        </h1>
        <p className="text-lg text-muted-foreground mt-6 max-w-2xl">
          Dev-Assistant is a structured learning ecosystem. Start by chatting with the assistant — it’ll point you toward the right module to begin.
        </p>
        <div className="mt-8 flex gap-3">
          <Button size="lg" className="rounded-full px-7" onClick={() => nav("/assistant")}>Start with the assistant</Button>
          <Button size="lg" variant="ghost" className="rounded-full" onClick={() => nav("/modules")}>Browse modules</Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map((f, i) => (
          <button
            key={f.title}
            onClick={() => nav(f.to)}
            className="glass rounded-2xl p-6 text-left hover:-translate-y-0.5 transition-transform animate-rise"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="text-xs uppercase tracking-widest text-primary mb-2">0{i + 1}</div>
            <div className="font-display text-2xl mb-1">{f.title}</div>
            <div className="text-sm text-muted-foreground">{f.body}</div>
          </button>
        ))}
      </section>
    </Shell>
  );
}
