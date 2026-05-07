import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Shell from "@/components/Shell";
import { useApp } from "@/context/AppContext";

export default function Landing() {
  const nav = useNavigate();
  const { user } = useApp();
  return (
    <Shell>
      {/* HERO */}
      <section className="min-h-[80vh] grid place-items-center">
        <div className="max-w-3xl text-center animate-rise">
          <div className="inline-flex items-center gap-2 glass-soft rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" /> A guided learning ecosystem · v1.0
          </div>
          <h1 className="font-display text-6xl md:text-7xl leading-[1.05] text-glow-white">
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
          <div className="mt-14 text-xs text-muted-foreground/70 animate-pulse">↓ scroll for the story</div>
        </div>
      </section>

      {/* WHY */}
      <section className="py-24 max-w-4xl mx-auto">
        <div className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">Why we built this</div>
        <h2 className="font-display text-4xl md:text-5xl text-glow-white leading-tight">
          Because learning to code shouldn't feel like getting lost in someone else's playlist.
        </h2>
        <div className="mt-8 space-y-5 text-base md:text-lg leading-relaxed text-foreground/85">
          <p>
            Most beginners drown in tabs: a YouTube tutorial, a half-read article, a Discord reply, a LeetCode problem.
            None of them know what you already understand, and none of them check whether you actually <em>did</em> the practice.
          </p>
          <p>
            Dev-Assistant treats your learning like a real curriculum. Every topic has a learn step, a monitored practice
            step, and a coding assignment. An AI mentor sits beside you, but it explains the <em>why</em> — it doesn't hand
            you the answer.
          </p>
          <p className="text-glow-ocean italic">
            Calm pace. Honest checks. Visible progress.
          </p>
        </div>
      </section>

      {/* PROBLEMS SOLVED */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">Problems we solve</div>
          <h2 className="font-display text-4xl md:text-5xl text-glow-white">Five quiet failures of self-taught coding.</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
            {[
              ["Random tutorial loops", "You bounce between videos and never finish a track. Dev-Assistant gives you a single linear path: Learn → Practice → Build."],
              ["No accountability", "Nothing checks whether you actually understood. Our 30-question monitored MCQ exam tests recall, not vibes."],
              ["Cheating yourself", "Tab-switching, copy-paste, AI auto-complete in the test. Our integrity monitor catches it and ends the session."],
              ["Wandering AI chats", "ChatGPT will answer anything — usually too much. Our assistant maps your question to the exact module and routes you there."],
              ["No record of growth", "After a year you can't show what you've done. Your dashboard tracks streaks, scores, completed modules and assignments — automatically."],
              ["IDE friction", "You spend hours on tooling instead of code. Dev-Assistant gives you an in-browser editor with run/submit and live monitoring."],
            ].map(([title, body], i) => (
              <article key={title}
                className="glass rounded-2xl p-6 hover-glow-white animate-pop"
                style={{ animationDelay: `${i * 90}ms` }}>
                <h3 className="font-display text-2xl text-glow-white mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 max-w-4xl mx-auto">
        <div className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">How it works</div>
        <h2 className="font-display text-4xl md:text-5xl text-glow-white">Four steps, repeated until you're fluent.</h2>

        <ol className="mt-10 space-y-6">
          {[
            ["01 · Pick a track", "DSA, Web, System Design, Databases or DevOps. Each track is a sequence of focused modules."],
            ["02 · Learn the module", "GeeksforGeeks-style sections — concepts, syntax cheatsheet, worked examples and pitfalls — all clickable, all responsive."],
            ["03 · Practice under monitoring", "30 timed MCQs. Tab-switching, copy-paste and devtools all count as strikes. Three strikes terminates the test."],
            ["04 · Build the assignment", "Open the in-browser IDE, write real code, run it, submit. Your progress and streak update automatically."],
          ].map(([head, body], i) => (
            <li key={head} className="glass rounded-2xl p-6 hover-glow-white animate-pop" style={{ animationDelay: `${i * 110}ms` }}>
              <div className="text-glow-ocean font-mono text-sm mb-1">{head}</div>
              <div className="text-base text-foreground/90">{body}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* CLOSING CTA */}
      <section className="py-32 text-center">
        <h2 className="font-display text-5xl md:text-6xl text-glow-white">Stop drifting. Start finishing modules.</h2>
        <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
          Free to start. Built by a small team that wanted the learning experience we never had.
        </p>
        <Button size="lg" onClick={() => nav(user ? "/modules" : "/auth")} className="rounded-full px-8 mt-8">
          {user ? "Open the modules" : "Create my account"}
        </Button>
      </section>
    </Shell>
  );
}
