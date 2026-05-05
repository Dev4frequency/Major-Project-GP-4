import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = { role: "user" | "assistant"; content: string; topics?: string[] };

const seed: Msg = {
  role: "assistant",
  content: "Hi — I'm your Dev-Assistant. Tell me what you want to learn (e.g. 'I want to learn DSA', 'system design', 'web fundamentals') and I'll point you to the right starting module.",
};

function reply(input: string): Msg {
  const q = input.toLowerCase();
  if (q.includes("dsa") || q.includes("data structure") || q.includes("algorithm")) {
    return {
      role: "assistant",
      content:
        "Great choice. DSA is the foundation of strong engineering. Start with Arrays and the two-pointer technique, then move to Sorting, Searching, and Recursion — each module builds on the previous one. I won't give you the code outright; instead I'll explain the *why* so you can write it yourself.",
      topics: ["Arrays", "Sorting", "Searching", "Recursion"],
    };
  }
  if (q.includes("system")) {
    return {
      role: "assistant",
      content: "System design is about tradeoffs. Begin by understanding requirements, then estimate scale, then pick the simplest design that satisfies the constraints. We'll add a track soon — for now, DSA is the recommended starting point.",
      topics: ["Arrays", "Graphs"],
    };
  }
  if (q.includes("web")) {
    return {
      role: "assistant",
      content: "For web, focus on the fundamentals: HTML semantics, CSS layout, and how the browser renders. Then move to JavaScript, then a framework. The Modules section will guide you.",
      topics: ["Arrays"],
    };
  }
  return {
    role: "assistant",
    content: "I'd suggest starting with the DSA track — it sharpens problem-solving that carries over to everything else. Try a topic like Arrays, Sorting, or Recursion to begin.",
    topics: ["Arrays", "Sorting", "Recursion"],
  };
}

export default function Assistant() {
  const [messages, setMessages] = useState<Msg[]>([seed]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const nav = useNavigate();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const send = () => {
    if (!input.trim()) return;
    const user: Msg = { role: "user", content: input.trim() };
    setMessages((m) => [...m, user]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [...m, reply(user.content)]);
      setThinking(false);
    }, 600);
  };

  return (
    <Shell>
      <div className="max-w-3xl mx-auto pt-6">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">AI Assistant</div>
        <h1 className="font-display text-4xl text-gradient mb-6">What would you like to learn?</h1>

        <div className="glass rounded-3xl p-5 md:p-7 min-h-[55vh] flex flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "glass-soft"
                }`}>
                  <p>{m.content}</p>
                  {m.topics && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.topics.map((t) => (
                        <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-background/60 border border-border">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {thinking && <div className="text-xs text-muted-foreground">Assistant is thinking…</div>}
            <div ref={endRef} />
          </div>

          <div className="mt-5 flex gap-2 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="e.g. I want to learn DSA"
              className="rounded-full"
            />
            <Button onClick={send} className="rounded-full">Send</Button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={() => nav("/modules")} className="rounded-full">Start Learning →</Button>
        </div>
      </div>
    </Shell>
  );
}
