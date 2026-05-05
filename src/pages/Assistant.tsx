import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const SUGGESTIONS = [
  "I want to learn DSA",
  "Explain Big-O like I'm five",
  "Where should I start with graphs?",
  "Tips for solving Two Sum (no full code)",
];

const seed: Msg = {
  role: "assistant",
  content:
    "Hi — I'm **Dev-Assistant**. Tell me what you want to learn (DSA, system design, web fundamentals…) and I'll map out the right path for you.",
};

export default function Assistant() {
  const [messages, setMessages] = useState<Msg[]>([seed]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const nav = useNavigate();
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streaming]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let acc = "";
    const upsert = (chunk: string) => {
      acc += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last !== seed && prev.length > next.length) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: acc } : m));
        }
        return [...prev, { role: "assistant", content: acc }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        if (resp.status === 429) toast.error("Rate limited", { description: "Please try again in a moment." });
        else if (resp.status === 402) toast.error("AI credits exhausted", { description: "Add credits in workspace settings." });
        else toast.error(data?.error || "Something went wrong");
        setStreaming(false);
        setMessages((m) => m.slice(0, -1));
        return;
      }
      if (!resp.body) throw new Error("no stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) upsert(delta);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        toast.error("Connection issue");
        console.error(e);
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <Shell>
      <div className="max-w-3xl mx-auto pt-6">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">AI Assistant</div>
        <h1 className="font-display text-4xl text-gradient mb-6">What would you like to learn?</h1>

        <div className="glass rounded-3xl p-5 md:p-7 min-h-[60vh] flex flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "glass-soft"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-pre:my-2 prose-pre:bg-background/60 prose-pre:text-xs prose-code:text-primary">
                      <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {streaming && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="glass-soft rounded-2xl px-4 py-3 text-sm">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:240ms]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full glass-soft hover:border-primary/40 border border-border transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="mt-5 flex gap-2 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Ask anything about coding, DSA, or system design…"
              className="rounded-full"
              disabled={streaming}
            />
            <Button onClick={() => send()} className="rounded-full" disabled={streaming || !input.trim()}>
              Send
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={() => nav("/modules")} className="rounded-full">
            Start Learning →
          </Button>
        </div>
      </div>
    </Shell>
  );
}
