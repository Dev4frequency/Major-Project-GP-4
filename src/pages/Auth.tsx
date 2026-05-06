import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name too short").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(100),
  linkedin: z.string().trim().url("Invalid URL").max(255).optional().or(z.literal("")),
  leetcode: z.string().trim().max(255).optional().or(z.literal("")),
});

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", linkedin: "", leetcode: "" });
  const { authUser } = useApp();
  const nav = useNavigate();

  useEffect(() => { if (authUser) nav("/intro", { replace: true }); }, [authUser, nav]);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse(form);
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
        const redirectUrl = `${window.location.origin}/intro`;
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { display_name: form.name },
          },
        });
        if (error) { toast.error(error.message); return; }
        if (data.user) {
          await supabase.from("profiles").update({
            display_name: form.name, linkedin: form.linkedin || null, leetcode: form.leetcode || null,
          }).eq("user_id", data.user.id);
        }
        toast.success("Account created — check your email if confirmation is required.");
        nav("/intro");
      } else {
        if (!form.email || !form.password) { toast.error("Email and password required"); return; }
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) { toast.error(error.message); return; }
        toast.success("Welcome back");
        nav("/intro");
      }
    } finally { setLoading(false); }
  };

  return (
    <Shell hideNav>
      <div className="min-h-screen grid place-items-center py-16">
        <div className="w-full max-w-md glass rounded-3xl p-8 animate-rise">
          <div className="text-center mb-7">
            <div className="font-display text-3xl text-gradient">Dev·Assistant</div>
            <p className="text-sm text-muted-foreground mt-2">
              {mode === "login" ? "Welcome back. Sign in to continue." : "Create your account to begin."}
            </p>
          </div>

          <div className="grid grid-cols-2 mb-6 p-1 glass-soft rounded-full text-sm">
            {(["login", "signup"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`py-2 rounded-full transition-all ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                {m === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <Field label="Name"><Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ada Lovelace" /></Field>
            )}
            <Field label="Email"><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@studio.dev" /></Field>
            <Field label="Password"><Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" /></Field>
            {mode === "signup" && (
              <>
                <Field label="LinkedIn"><Input value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} placeholder="https://linkedin.com/in/…" /></Field>
                <Field label="LeetCode"><Input value={form.leetcode} onChange={(e) => update("leetcode", e.target.value)} placeholder="username" /></Field>
              </>
            )}
            <Button type="submit" className="w-full rounded-full mt-2" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>
        </div>
      </div>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
