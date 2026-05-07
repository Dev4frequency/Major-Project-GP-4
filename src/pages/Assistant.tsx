import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";
import { MODULES } from "@/data/content";

type Msg = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; last_message_at: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const ACTION_RE = /\[\[(OPEN|GOTO):([^|\]]+)\|([^\]]+)\]\]/g;

const stripActions = (t: string) => t.replace(ACTION_RE, "").replace(/\n{3,}/g, "\n\n").trim();

function parseActions(text: string) {
  const out: { kind: "OPEN" | "GOTO"; target: string; label: string }[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  ACTION_RE.lastIndex = 0;
  while ((m = ACTION_RE.exec(text)) !== null) {
    const k = `${m[1]}:${m[2]}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ kind: m[1] as any, target: m[2].trim(), label: m[3].trim() });
  }
  return out;
}

function ActionButtons({ content, onNavigate }: { content: string; onNavigate: (path: string) => void }) {
  const actions = parseActions(content);
  if (!actions.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
      {actions.map((a, i) => (
        <button key={i}
          onClick={() => onNavigate(a.kind === "OPEN" ? `/modules/${a.target}` : a.target)}
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
          className="group relative overflow-hidden text-xs px-4 py-2 rounded-full bg-primary/15 hover:bg-primary/25 border border-primary/40 text-primary-foreground/90 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_hsl(var(--primary)/0.45)] hover:-translate-y-0.5 animate-[fade-in_0.4s_ease-out,slide-in-right_0.4s_ease-out]">
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/30 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-out" />
          <span className="relative inline-flex items-center gap-1.5">
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            <span>{a.kind === "OPEN" ? `Open ${a.label}` : a.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

const SUGGESTIONS = [
  "I want to learn DSA",
  "Explain Big-O like I'm five",
  "Where should I start with graphs?",
  "Tips for solving Two Sum (no full code)",
];

const seed: Msg = {
  role: "assistant",
  content: "Hi — I'm **Dev-Assistant**. Tell me what you want to learn (DSA, system design, web fundamentals…) and I'll map out the right path for you.",
};

export default function Assistant() {
  const { authUser } = useApp();
  const [params] = useSearchParams();
  const [messages, setMessages] = useState<Msg[]>([seed]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const nav = useNavigate();
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streaming]);
  useEffect(() => () => abortRef.current?.abort(), []);

  // Prefill from ?topic= when arriving from a module
  useEffect(() => {
    const t = params.get("topic");
    if (t) setInput(`Explain ${t} in depth and recommend the best path forward.`);
  }, [params]);

  // Load conversation list
  useEffect(() => {
    if (!authUser) return;
    supabase.from("conversations").select("id,title,last_message_at")
      .order("last_message_at", { ascending: false }).limit(30)
      .then(({ data }) => setConversations((data as any) ?? []));
  }, [authUser]);

  const openConversation = async (id: string) => {
    setConvId(id);
    const { data } = await supabase.from("messages")
      .select("role,content").eq("conversation_id", id).order("created_at");
    if (data && data.length) setMessages(data.map((m: any) => ({ role: m.role, content: m.content })));
    else setMessages([seed]);
  };

  const newConversation = () => { setConvId(null); setMessages([seed]); };

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
        if (last?.role === "assistant" && prev.length > next.length) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: acc } : m));
        }
        return [...prev, { role: "assistant", content: acc }];
      });
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, conversation_id: convId }),
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
      const newConvId = resp.headers.get("X-Conversation-Id");
      if (newConvId && newConvId !== convId) setConvId(newConvId);
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

      // Refresh conversation list (title may have just been created)
      if (authUser) {
        const { data } = await supabase.from("conversations").select("id,title,last_message_at")
          .order("last_message_at", { ascending: false }).limit(30);
        setConversations((data as any) ?? []);
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") { toast.error("Connection issue"); console.error(e); }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <Shell>
      <div className="max-w-6xl mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
        {/* Sidebar: past conversations */}
        <aside className="glass rounded-3xl p-4 h-fit lg:sticky lg:top-20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">History</span>
            <button onClick={newConversation} className="text-xs px-2 py-1 rounded-full bg-primary/15 hover:bg-primary/25 border border-primary/40 transition">+ New</button>
          </div>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
            {conversations.length === 0 && (
              <div className="text-xs text-muted-foreground italic px-2 py-3">No past chats yet.</div>
            )}
            {conversations.map((c) => (
              <button key={c.id} onClick={() => openConversation(c.id)}
                className={`w-full text-left text-xs px-3 py-2 rounded-lg transition border ${
                  convId === c.id ? "bg-primary/20 border-primary/40" : "border-transparent hover:bg-foreground/5"
                }`}>
                <div className="truncate">{c.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(c.last_message_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">AI Assistant</div>
          <h1 className="font-display text-4xl text-gradient mb-6">What would you like to learn?</h1>

          <div className="glass rounded-3xl p-5 md:p-7 min-h-[60vh] flex flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "glass-soft"
                  }`}>
                    {m.role === "assistant" ? (
                      <div>
                        <div className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-pre:my-2 prose-pre:bg-background/60 prose-pre:text-xs prose-code:text-primary">
                          <ReactMarkdown>{stripActions(m.content) || "…"}</ReactMarkdown>
                        </div>
                        <ActionButtons content={m.content} onNavigate={(p) => nav(p)} />
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
                  <button key={s} onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full glass-soft hover:border-primary/40 border border-border transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 flex gap-2 items-center">
              <Input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Ask anything about coding, DSA, or system design…"
                className="rounded-full" disabled={streaming} />
              <Button onClick={() => send()} className="rounded-full" disabled={streaming || !input.trim()}>Send</Button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="ghost" onClick={() => nav("/modules")} className="rounded-full">Start Learning →</Button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
