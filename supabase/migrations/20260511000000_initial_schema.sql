-- Founder OS — initial schema (matches AppStateV1 in src/types/index.ts)
-- Run in Supabase SQL Editor or: supabase db push

-- ---------------------------------------------------------------------------
-- Enums (mirror TypeScript unions)
-- ---------------------------------------------------------------------------
CREATE TYPE public.investor_stage AS ENUM (
  'need_contact',
  'contacted',
  'replied',
  'meeting_booked',
  'follow_up',
  'passed',
  'interested'
);

CREATE TYPE public.startup_event_type AS ENUM (
  'local',
  'virtual',
  'investor_office_hours',
  'pitch_event',
  'demo_day',
  'founder_meetup'
);

CREATE TYPE public.startup_event_status AS ENUM (
  'interested',
  'registered',
  'attended',
  'followed_up',
  'skipped'
);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- investors (+ links as JSON array: [{ "label"?: string, "url": string }, ...])
-- ---------------------------------------------------------------------------
CREATE TABLE public.investors (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  firm TEXT,
  role_title TEXT,
  stage public.investor_stage NOT NULL,
  warm_intro_source TEXT,
  last_contact_date DATE,
  next_follow_up_date DATE,
  fit_score SMALLINT CHECK (fit_score IS NULL OR (fit_score >= 1 AND fit_score <= 5)),
  notes TEXT,
  links JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(links) = 'array'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX investors_user_id_idx ON public.investors (user_id);
CREATE INDEX investors_user_stage_idx ON public.investors (user_id, stage);

CREATE TRIGGER investors_set_updated_at
  BEFORE UPDATE ON public.investors
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- startup_events (table name avoids reserved-ish "events")
-- ---------------------------------------------------------------------------
CREATE TABLE public.startup_events (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  type public.startup_event_type NOT NULL,
  date DATE NOT NULL,
  link TEXT,
  status public.startup_event_status NOT NULL,
  notes TEXT,
  contacts_made TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX startup_events_user_id_idx ON public.startup_events (user_id);
CREATE INDEX startup_events_user_date_idx ON public.startup_events (user_id, date);

CREATE TRIGGER startup_events_set_updated_at
  BEFORE UPDATE ON public.startup_events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- duty_completions (dutyId + periodKey + completedAt from app)
-- ---------------------------------------------------------------------------
CREATE TABLE public.duty_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  duty_id TEXT NOT NULL,
  period_key TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, duty_id, period_key)
);

CREATE INDEX duty_completions_user_period_idx ON public.duty_completions (user_id, period_key);

-- ---------------------------------------------------------------------------
-- daily_notes (date + text)
-- ---------------------------------------------------------------------------
CREATE TABLE public.daily_notes (
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  note_date DATE NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (user_id, note_date)
);

CREATE TRIGGER daily_notes_set_updated_at
  BEFORE UPDATE ON public.daily_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- weekly_update_drafts (one row per user per week_of)
-- ---------------------------------------------------------------------------
CREATE TABLE public.weekly_update_drafts (
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  week_of DATE NOT NULL,
  product_notes TEXT NOT NULL DEFAULT '',
  blockers TEXT NOT NULL DEFAULT '',
  next_week_priorities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (user_id, week_of)
);

CREATE TRIGGER weekly_update_drafts_set_updated_at
  BEFORE UPDATE ON public.weekly_update_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_update_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investors_select_own"
  ON public.investors FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "investors_insert_own"
  ON public.investors FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "investors_update_own"
  ON public.investors FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "investors_delete_own"
  ON public.investors FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "startup_events_select_own"
  ON public.startup_events FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "startup_events_insert_own"
  ON public.startup_events FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "startup_events_update_own"
  ON public.startup_events FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "startup_events_delete_own"
  ON public.startup_events FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "duty_completions_select_own"
  ON public.duty_completions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "duty_completions_insert_own"
  ON public.duty_completions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "duty_completions_update_own"
  ON public.duty_completions FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "duty_completions_delete_own"
  ON public.duty_completions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "daily_notes_select_own"
  ON public.daily_notes FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "daily_notes_insert_own"
  ON public.daily_notes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "daily_notes_update_own"
  ON public.daily_notes FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "daily_notes_delete_own"
  ON public.daily_notes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "weekly_update_drafts_select_own"
  ON public.weekly_update_drafts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "weekly_update_drafts_insert_own"
  ON public.weekly_update_drafts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "weekly_update_drafts_update_own"
  ON public.weekly_update_drafts FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "weekly_update_drafts_delete_own"
  ON public.weekly_update_drafts FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- API grants (Supabase PostgREST)
-- ---------------------------------------------------------------------------
GRANT USAGE ON TYPE public.investor_stage TO anon, authenticated;
GRANT USAGE ON TYPE public.startup_event_type TO anon, authenticated;
GRANT USAGE ON TYPE public.startup_event_status TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.investors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.startup_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.duty_completions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_update_drafts TO authenticated;
