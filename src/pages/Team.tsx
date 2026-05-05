import Shell from "@/components/Shell";

const DEVS = [
  { img: "/dev1.jpg", name: "Harsh Singh Bisht", role: "UI/UX Designer", linkedin: "https://www.linkedin.com/in/harsh-singh-bisht-5549ba27a/" },
  { img: "/dev2.jpg", name: "Abhishek Singh Negi", role: "Frontend Developer", linkedin: "https://www.linkedin.com/in/abhishek-negi-275600356/" },
  { img: "/dev3.jpg", name: "Kaushalendra Singh", role: "DevOps Engineer", linkedin: "https://www.linkedin.com/in/kaushal-singh-6391b0288/" },
  { img: "/dev4.jpg", name: "Yash Bisht", role: "Team Lead · Backend Developer", linkedin: "https://www.linkedin.com/in/yash-bisht-1a74752a8/" },
];

export default function Team() {
  return (
    <Shell>
      <div className="pt-6 pb-10 max-w-3xl">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Team</div>
        <h1 className="font-display text-5xl text-gradient">The people behind Dev-Assistant.</h1>
        <p className="text-muted-foreground mt-3">A small team obsessed with calm, structured learning experiences.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {DEVS.map((d, i) => (
          <article key={d.name} className="glass rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="aspect-[4/5] overflow-hidden bg-muted">
              <img src={d.img} alt={`${d.name} — ${d.role}`} className="w-full h-full object-cover" />
            </div>
            <div className="p-5">
              <div className="font-display text-xl">{d.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{d.role}</div>
              <a
                href={d.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-4 text-xs text-primary hover:underline"
              >
                LinkedIn ↗
              </a>
            </div>
          </article>
        ))}
      </div>
    </Shell>
  );
}
