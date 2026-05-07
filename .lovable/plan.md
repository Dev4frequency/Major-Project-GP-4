# Big-Picture Build Plan

This is a large request touching auth, landing, modules, learning, assistant, IDE, and a brand-new admin area. I'll break it into clear chunks so we can ship cleanly.

## 1. Auth (Login + Signup) — passport-size avatar

- Add a circular avatar slot at the top of `Auth.tsx` form.
- **Signup**: file picker → preview → upload to a new public Storage bucket `avatars` → save URL on `profiles.avatar_url`.
- **Login**: small avatar fetched after sign-in (shown briefly on success transition); on the form itself we show a generic placeholder ring since identity is unknown pre-login.
- Migration: create `avatars` bucket (public) + RLS policies (user can upload/update their own folder).

## 2. Landing page — long-form, glowing white text

Rebuild `Landing.tsx` as a 4-section scroll story:

1. Hero (existing, polished)
2. **Why we built this** — problem statement (random tutorials, no monitoring, no structure)
3. **What problems it solves** — bullet grid (focus, accountability, guided progression, anti-cheat, AI mentorship)
4. **How it works** — Learn → Practice → Assignment → AI loop, with glowing white headings (`text-shadow` + drop-shadow on `--foreground`)
5. **Closing CTA**

- All key text uses a new `.text-glow` utility (white text with soft blue/white halo, theme-driven).

## 3. Team / Developers section

- Per-developer detailed role cards with extended bios, responsibilities, and which parts of the codebase they own.
- Each card uses a staggered **pop-up + slide** entrance (`scale-in` + `fade-in` with `animationDelay`).
- New "Codebase Ownership" panel grouping files/areas under each developer (Frontend / Backend / DevOps / UI-UX / Team Lead).

## 4. Admin Panel (demo) — gated by pass + key

- New `/admin` route, link appears on Team page footer.
- Gate screen: two inputs — pass `yash@123`, key `263645`. On match, set a session flag and reveal panel.
- Panel reads (RLS allowing only own data won't show others — this is a **demo**, so we'll show the *current logged-in user's* aggregate data across all tables: profiles row, conversations, messages count, module_progress, practice_attempts, assignment_submissions, monitor_events, streaks). I'll clearly label it "Demo admin (your data only — full multi-user admin requires service-role backend)".
- Tabs: Users · Modules · Practice · Assignments · Monitoring · AI Conversations.

> Note: a true "see every user's data" admin requires a service-role edge function + a `user_roles` table with an `admin` role. I'll add a stub edge function + role table scaffold but keep the demo gate as requested.

## 5. Modules listing + Learning page

- Modules grid: add stronger glow-on-hover (white outer halo).
- Learning page (`/modules/:id`): convert to a GeeksforGeeks-style layout:
  - Left rail: clickable section list (Intro, Concepts, Syntax, Examples, Common Pitfalls, Practice Problems).
  - Main: each section has explanation + **code example block** with copy button + language label.
  - Right rail (desktop): mini quiz CTA + "Ask AI about this section" button that deep-links to `/assistant` with a prefilled prompt.
- Fully responsive (collapsible left rail on mobile).
- Extend `src/data/content.ts` with richer per-module sections + code samples.

## 6. Assistant — glowing replies + module options on start

- On first open with no conversation, show a grid of module cards as quick-start options (already partly exists — make it the dominant view).
- Assistant message bubbles get a `text-glow` effect (white / ocean blue halo) on the markdown content.
- AI prompt already includes module list — keep, just confirm it answers any topic question (no code change needed beyond polish).

## 7. IDE — real run/compile

- Wire JavaScript execution via in-browser sandbox (`new Function` inside a try/catch with captured `console.log`) for JS.
- For Python/others: call a new `run-code` edge function that uses a public sandbox API (Piston: `https://emkc.org/api/v2/piston/execute`) — no key needed.
- Show stdout/stderr panel; preserve existing monitor.
- **Cheat termination**: on monitor "terminate" event in IDE/Practice → write a `monitor_events` row, toast the user, then `navigate('/dashboard')`.

## 8. Backend additions

- Migration: `avatars` storage bucket + policies; optional `user_roles` table + `has_role` function (for future real admin).
- New edge function `run-code` (proxies Piston).
- No schema breakage — all additive.

## Technical details (for reference)

- New util in `index.css`: `.text-glow-white`, `.text-glow-ocean`, `.hover-glow-white`.
- New components: `AvatarPicker`, `AdminPanel`, `CodeBlock` (with copy), `ModuleSectionNav`, `RunOutput`.
- New page: `src/pages/Admin.tsx`.
- Route added in `App.tsx`: `/admin`.
- Storage upload uses `supabase.storage.from('avatars').upload(\`${uid}/avatar.png, file, { upsert: true })`.

## Out of scope (I'll flag, not build)

- True multi-user admin with service-role backend (needs `user_roles` + admin edge function — I'll scaffold the table only).
- Multi-language IDE beyond JS/Python via Piston.
- Modular view and clickable sub and sub modules, strict screen monitoring.
- Structure the backend and frontend code as separate things, the frontend part in the front end section, whereas the backend part in the backend section.

---

**Confirm and I'll execute in this order:** 1 → 2 → 3 → 5 → 6 → 7 → 4 → 8. Reply "go" to proceed, or tell me what to drop/reorder.