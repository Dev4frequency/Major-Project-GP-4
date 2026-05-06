
-- =========================================================
-- Helper: updated_at trigger
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- =========================================================
-- profiles
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  linkedin TEXT,
  leetcode TEXT,
  avatar_url TEXT,
  selected_track TEXT,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- conversations
-- =========================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  pinned BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_select_own" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "conv_insert_own" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "conv_update_own" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "conv_delete_own" ON public.conversations FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_conv_user ON public.conversations(user_id, last_message_at DESC);
CREATE TRIGGER trg_conv_updated BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- messages
-- =========================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  tokens_in INT,
  tokens_out INT,
  model TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_select_own" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "msg_insert_own" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "msg_delete_own" ON public.messages FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_msg_conv ON public.messages(conversation_id, created_at);

-- =========================================================
-- module_progress
-- =========================================================
CREATE TABLE public.module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started','in_progress','completed')),
  percent INT NOT NULL DEFAULT 0 CHECK (percent BETWEEN 0 AND 100),
  time_spent_seconds INT NOT NULL DEFAULT 0,
  last_opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mp_select_own" ON public.module_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mp_insert_own" ON public.module_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mp_update_own" ON public.module_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER trg_mp_updated BEFORE UPDATE ON public.module_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- practice_attempts
-- =========================================================
CREATE TABLE public.practice_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_seconds INT NOT NULL DEFAULT 0,
  violations INT NOT NULL DEFAULT 0,
  terminated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pa_select_own" ON public.practice_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pa_insert_own" ON public.practice_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_pa_user ON public.practice_attempts(user_id, created_at DESC);

-- =========================================================
-- assignment_submissions
-- =========================================================
CREATE TABLE public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'javascript',
  code TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','passed','failed','reviewed')),
  feedback TEXT,
  score INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "as_select_own" ON public.assignment_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "as_insert_own" ON public.assignment_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_as_user ON public.assignment_submissions(user_id, created_at DESC);

-- =========================================================
-- monitor_events
-- =========================================================
CREATE TABLE public.monitor_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_kind TEXT NOT NULL CHECK (session_kind IN ('practice','ide','assignment')),
  module_id TEXT,
  problem_id TEXT,
  kind TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.monitor_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "me_select_own" ON public.monitor_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "me_insert_own" ON public.monitor_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_me_user ON public.monitor_events(user_id, created_at DESC);

-- =========================================================
-- ai_recommendations
-- =========================================================
CREATE TABLE public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  module_id TEXT NOT NULL,
  reason TEXT,
  opened BOOLEAN NOT NULL DEFAULT false,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ar_select_own" ON public.ai_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ar_insert_own" ON public.ai_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ar_update_own" ON public.ai_recommendations FOR UPDATE USING (auth.uid() = user_id);

-- =========================================================
-- daily_activity
-- =========================================================
CREATE TABLE public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  modules_opened INT NOT NULL DEFAULT 0,
  practice_attempts INT NOT NULL DEFAULT 0,
  assignments_submitted INT NOT NULL DEFAULT 0,
  messages_sent INT NOT NULL DEFAULT 0,
  total_score INT NOT NULL DEFAULT 0,
  UNIQUE (user_id, day)
);
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "da_select_own" ON public.daily_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "da_insert_own" ON public.daily_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "da_update_own" ON public.daily_activity FOR UPDATE USING (auth.uid() = user_id);

-- =========================================================
-- user_streaks
-- =========================================================
CREATE TABLE public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "us_select_own" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "us_insert_own" ON public.user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "us_update_own" ON public.user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- =========================================================
-- New user → profile + streak row
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_streaks (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- Streak engine
-- =========================================================
CREATE OR REPLACE FUNCTION public.bump_activity(_user_id UUID, _kind TEXT, _delta INT DEFAULT 1, _score INT DEFAULT 0)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE today DATE := (now() AT TIME ZONE 'utc')::date;
        prev DATE; cur INT; lng INT;
BEGIN
  INSERT INTO public.daily_activity (user_id, day) VALUES (_user_id, today)
  ON CONFLICT (user_id, day) DO NOTHING;
  IF _kind = 'module_opened' THEN
    UPDATE public.daily_activity SET modules_opened = modules_opened + _delta WHERE user_id=_user_id AND day=today;
  ELSIF _kind = 'practice' THEN
    UPDATE public.daily_activity SET practice_attempts = practice_attempts + _delta, total_score = total_score + _score WHERE user_id=_user_id AND day=today;
  ELSIF _kind = 'assignment' THEN
    UPDATE public.daily_activity SET assignments_submitted = assignments_submitted + _delta WHERE user_id=_user_id AND day=today;
  ELSIF _kind = 'message' THEN
    UPDATE public.daily_activity SET messages_sent = messages_sent + _delta WHERE user_id=_user_id AND day=today;
  END IF;

  SELECT last_active_date, current_streak, longest_streak INTO prev, cur, lng FROM public.user_streaks WHERE user_id=_user_id;
  IF NOT FOUND THEN
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_active_date)
    VALUES (_user_id, 1, 1, today);
  ELSE
    IF prev IS NULL OR prev < today - INTERVAL '1 day' THEN cur := 1;
    ELSIF prev = today - INTERVAL '1 day' THEN cur := cur + 1;
    END IF;
    IF cur > lng THEN lng := cur; END IF;
    UPDATE public.user_streaks SET current_streak=cur, longest_streak=lng, last_active_date=today, updated_at=now() WHERE user_id=_user_id;
  END IF;
END; $$;

-- Auto-bump on key inserts
CREATE OR REPLACE FUNCTION public.trg_bump_practice() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.bump_activity(NEW.user_id, 'practice', 1, NEW.score); RETURN NEW; END; $$;
CREATE TRIGGER trg_pa_bump AFTER INSERT ON public.practice_attempts FOR EACH ROW EXECUTE FUNCTION public.trg_bump_practice();

CREATE OR REPLACE FUNCTION public.trg_bump_assignment() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.bump_activity(NEW.user_id, 'assignment', 1, 0); RETURN NEW; END; $$;
CREATE TRIGGER trg_as_bump AFTER INSERT ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public.trg_bump_assignment();

CREATE OR REPLACE FUNCTION public.trg_bump_message() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role = 'user' THEN
    PERFORM public.bump_activity(NEW.user_id, 'message', 1, 0);
    UPDATE public.conversations SET last_message_at = now() WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_msg_bump AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.trg_bump_message();

CREATE OR REPLACE FUNCTION public.trg_bump_module() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.bump_activity(NEW.user_id, 'module_opened', 1, 0); RETURN NEW; END; $$;
CREATE TRIGGER trg_mp_bump AFTER INSERT ON public.module_progress FOR EACH ROW EXECUTE FUNCTION public.trg_bump_module();
