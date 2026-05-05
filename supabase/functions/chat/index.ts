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

Always end with a single concrete next step.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (upstream.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await upstream.text();
      console.error("Gateway error", upstream.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
