import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RUNTIME_MAP: Record<string, { language: string; version: string }> = {
  python: { language: "python", version: "3.10.0" },
  cpp:    { language: "c++",    version: "10.2.0" },
  javascript: { language: "javascript", version: "18.15.0" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { language, code, stdin = "" } = await req.json();
    if (typeof language !== "string" || typeof code !== "string") {
      return new Response(JSON.stringify({ error: "language and code are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (code.length > 50_000) {
      return new Response(JSON.stringify({ error: "code too large" }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const target = RUNTIME_MAP[language];
    if (!target) {
      return new Response(JSON.stringify({ error: `unsupported language: ${language}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const piston = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: target.language,
        version: target.version,
        files: [{ content: code }],
        stdin,
        run_timeout: 5000,
        compile_timeout: 5000,
      }),
    });
    const data = await piston.json();

    return new Response(JSON.stringify({
      stdout: data?.run?.stdout ?? "",
      stderr: data?.run?.stderr ?? data?.compile?.stderr ?? "",
      code: data?.run?.code ?? null,
      signal: data?.run?.signal ?? null,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("run-code error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
