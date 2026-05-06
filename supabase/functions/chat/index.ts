import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODULES = [
  ["arrays", "Arrays", "DSA"],
  ["strings", "Strings", "DSA"],
  ["sorting", "Sorting", "DSA"],
  ["searching", "Searching", "DSA"],
  ["recursion", "Recursion", "DSA"],
  ["linked-lists", "Linked Lists", "DSA"],
  ["stacks-queues", "Stacks & Queues", "DSA"],
  ["trees", "Trees", "DSA"],
  ["graphs", "Graphs", "DSA"],
  ["dp", "Dynamic Programming", "DSA"],
  ["greedy", "Greedy Algorithms", "DSA"],
  ["hashing", "Hashing", "DSA"],
  ["system-basics", "System Design Foundations", "System Design"],
  ["caching", "Caching", "System Design"],
  ["sql-basics", "SQL Fundamentals", "Databases"],
  ["nosql", "NoSQL & Document Stores", "Databases"],
  ["html-css", "HTML & CSS", "Web"],
  ["javascript", "JavaScript Essentials", "Web"],
  ["react", "React Fundamentals", "Web"],
  ["rest-api", "REST APIs", "Web"],
  ["git", "Git & Version Control", "DevOps"],
  ["docker", "Containers with Docker", "DevOps"],
  ["ci-cd", "CI/CD", "DevOps"],
];

const MODULE_LIST = MODULES.map(([id, title, track]) => `- ${id} → "${title}" (${track})`).join("\n");

const SYSTEM_PROMPT = `You are Dev-Assistant, an elite AI coding mentor for a structured learning platform.

Your role:
- Guide learners through DSA, system design, web, databases, and DevOps.
- Explain concepts clearly: intuition first, then mechanics, then complexity.
- Never give complete solutions to coding problems on the platform — give hints, intuition, and approach only.
- Be calm, precise, encouraging. No filler.

DIRECTING USERS — VERY IMPORTANT:
You can route the learner directly to any module using a special action tag.
Whenever you recommend a module, ALWAYS append the tag on its own line in this exact form:

[[OPEN:<module-id>|<Display Title>]]

You may include up to 5 such tags per reply (one per recommended module, ordered).
The UI converts each tag into a clickable button that opens the module.

Available modules (id → title):
${MODULE_LIST}

Other useful routes you may suggest with the same tag format:
[[GOTO:/dashboard|Open Dashboard]]
[[GOTO:/modules|Browse all modules]]
[[GOTO:/assistant|Back to Assistant]]

Always end with a single concrete next step.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, conversation_id } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional auth — if present, persist messages
    const authHeader = req.headers.get("Authorization") ?? "";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    let userId: string | null = null;
    let convId: string | null = conversation_id ?? null;

    try {
      const { data: { user } } = await supa.auth.getUser();
      userId = user?.id ?? null;
    } catch { /* anonymous */ }

    const lastUser = [...messages].reverse().find((m: any) => m.role === "user");

    if (userId) {
      if (!convId) {
        const title = (lastUser?.content ?? "New conversation").toString().slice(0, 60);
        const { data: conv } = await supa.from("conversations").insert({
          user_id: userId, title,
        }).select("id").single();
        convId = conv?.id ?? null;
      }
      if (convId && lastUser) {
        await supa.from("messages").insert({
          conversation_id: convId, user_id: userId, role: "user", content: lastUser.content,
        });
      }
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (upstream.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await upstream.text();
      console.error("Gateway error", upstream.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tee the stream: forward to client and accumulate to persist + parse module recs
    const [a, b] = upstream.body!.tee();

    (async () => {
      try {
        const reader = b.getReader();
        const dec = new TextDecoder();
        let buffer = "";
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += dec.decode(value, { stream: true });
          let idx;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line || line.startsWith(":") || !line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const p = JSON.parse(data);
              const d = p.choices?.[0]?.delta?.content;
              if (d) acc += d;
            } catch { /* ignore */ }
          }
        }
        if (userId && convId && acc) {
          await supa.from("messages").insert({
            conversation_id: convId, user_id: userId, role: "assistant", content: acc, model: "google/gemini-2.5-flash",
          });
          // Parse module recommendations and store
          const re = /\[\[OPEN:([^|\]]+)\|([^\]]+)\]\]/g;
          const recs: { module_id: string; reason: string }[] = [];
          const seen = new Set<string>();
          let m;
          while ((m = re.exec(acc)) !== null) {
            const id = m[1].trim();
            if (seen.has(id)) continue;
            seen.add(id);
            recs.push({ module_id: id, reason: m[2].trim() });
          }
          if (recs.length) {
            await supa.from("ai_recommendations").insert(
              recs.map((r) => ({ user_id: userId!, conversation_id: convId, module_id: r.module_id, reason: r.reason }))
            );
          }
        }
      } catch (e) {
        console.error("persist error", e);
      }
    })();

    const headers = new Headers({ ...corsHeaders, "Content-Type": "text/event-stream" });
    if (convId) headers.set("X-Conversation-Id", convId);
    headers.set("Access-Control-Expose-Headers", "X-Conversation-Id");
    return new Response(a, { headers });
  } catch (e) {
    console.error("chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
