import { useNavigate } from "react-router-dom";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";

const DEVS = [
  {
    img: "/dev1.jpg", name: "Harsh Singh Bisht", role: "UI/UX Designer",
    linkedin: "https://www.linkedin.com/in/harsh-singh-bisht-5549ba27a/",
    bio: "Owns the visual language. Spent the project obsessing over rhythm, glass surfaces, and typography pairings so the app feels calm even when the user is panicking before an exam.",
    responsibilities: [
      "Design system: tokens, glassmorphism, aurora background",
      "Typography pairing (Cormorant + Inter)",
      "Onboarding and learning page layouts",
      "Animation timing for cards and buttons",
    ],
    codebase: ["src/index.css", "tailwind.config.ts", "src/components/Shell.tsx", "src/pages/Landing.tsx"],
  },
  {
    img: "/dev2.jpg", name: "Abhishek Singh Negi", role: "Frontend Developer",
    linkedin: "https://www.linkedin.com/in/abhishek-negi-275600356/",
    bio: "Builds the React surfaces users actually touch. Ships the IDE, the assistant chat, the monitored practice flows, and every clickable thing in between.",
    responsibilities: [
      "All React pages and routing",
      "Monaco IDE integration",
      "AI assistant streaming UI",
      "Practice & assignment monitoring HUD",
    ],
    codebase: ["src/pages/IDE.tsx", "src/pages/Practice.tsx", "src/pages/Assistant.tsx", "src/pages/Learning.tsx", "src/components/MonitorHUD.tsx"],
  },
  {
    img: "/dev3.jpg", name: "Kaushalendra Singh", role: "DevOps Engineer",
    linkedin: "https://www.linkedin.com/in/kaushal-singh-6391b0288/",
    bio: "Keeps the lights on. Owns the build pipeline, the edge-function deploys, the storage buckets, and every observability hook that tells us when something breaks at 2 AM.",
    responsibilities: [
      "Edge function deployment pipeline",
      "Storage bucket policies (avatars)",
      "Auth configuration & secrets",
      "Production monitoring",
    ],
    codebase: ["supabase/config.toml", "supabase/migrations/*", "supabase/functions/chat/index.ts", "supabase/functions/run-code/index.ts"],
  },
  {
    img: "/dev4.jpg", name: "Yash Bisht", role: "Team Lead · Backend Developer",
    linkedin: "https://www.linkedin.com/in/yash-bisht-1a74752a8/",
    bio: "Designed the data model and the AI conversation layer. Picks which problems we solve next, then writes the SQL, RLS policies and edge functions to make them real.",
    responsibilities: [
      "Database schema & RLS policies",
      "Streak engine and activity triggers",
      "AI gateway integration (Lovable AI)",
      "Admin panel & overall product direction",
    ],
    codebase: ["supabase/migrations/*", "src/context/AppContext.tsx", "supabase/functions/chat/index.ts", "src/pages/Admin.tsx"],
  },
];

export default function Team() {
  const nav = useNavigate();
  return (
    <Shell>
      <div className="pt-6 pb-10 max-w-3xl">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Team</div>
        <h1 className="font-display text-5xl text-glow-white">The people behind Dev-Assistant.</h1>
        <p className="text-muted-foreground mt-3">
          A small team obsessed with calm, structured learning experiences. Each card below also lists the parts
          of the codebase that person owns — that's how we divide the work.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DEVS.map((d, i) => (
          <article
            key={d.name}
            className="glass rounded-3xl overflow-hidden hover-glow-white animate-pop"
            style={{ animationDelay: `${i * 140}ms` }}
          >
            <div className="grid grid-cols-[140px_1fr] gap-5 p-5">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                <img src={d.img} alt={`${d.name} — ${d.role}`} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-display text-2xl text-glow-white">{d.name}</div>
                <div className="text-xs text-glow-ocean mt-0.5">{d.role}</div>
                <p className="text-sm text-foreground/85 mt-3 leading-relaxed">{d.bio}</p>
                <a
                  href={d.linkedin} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline"
                >
                  LinkedIn ↗
                </a>
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Responsibilities</div>
              <ul className="text-sm text-foreground/85 space-y-1 mb-4">
                {d.responsibilities.map((r) => (
                  <li key={r} className="flex gap-2"><span className="text-primary">▸</span><span>{r}</span></li>
                ))}
              </ul>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Codebase ownership</div>
              <div className="flex flex-wrap gap-1.5">
                {d.codebase.map((f) => (
                  <code key={f} className="text-[10px] glass-soft rounded px-2 py-1 font-mono text-muted-foreground">
                    {f}
                  </code>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 glass rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 animate-pop">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Internal · demo</div>
          <div className="font-display text-xl text-glow-white">Admin panel</div>
          <div className="text-sm text-muted-foreground">Restricted to team leads. Requires pass + key.</div>
        </div>
        <Button onClick={() => nav("/admin")} className="rounded-full">Enter admin panel →</Button>
      </div>
    </Shell>
  );
}
