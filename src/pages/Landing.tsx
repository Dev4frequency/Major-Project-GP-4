import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Shell from "@/components/Shell";
import { useApp } from "@/context/AppContext";

export default function Landing() {
  const nav = useNavigate();
  const { user } = useApp();
  return (
    <Shell>
      <section className="min-h-[78vh] grid place-items-center">
        <div className="max-w-3xl text-center animate-rise">
          <div className="inline-flex items-center gap-2 glass-soft rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> A guided learning ecosystem
          </div>
          <h1 className="font-display text-6xl md:text-7xl leading-[1.05] text-gradient">
            Learn to code with calm, structured discipline.
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Dev-Assistant guides you step-by-step — from concepts to monitored coding assessments — so progress feels intentional, not random.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button size="lg" onClick={() => nav(user ? "/intro" : "/auth")} className="rounded-full px-7">
              {user ? "Continue" : "Get started"}
            </Button>
            <Button size="lg" variant="ghost" onClick={() => nav("/team")} className="rounded-full px-7">
              Meet the team
            </Button>
          </div>
        </div>
      </section>
    </Shell>
  );
}
