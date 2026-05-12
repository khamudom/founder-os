-- Run in Supabase → SQL Editor (as postgres) to verify Founder OS tables, RLS, and grants.
-- If row counts are 0 after using the app, check the browser Network tab for failed REST calls
-- and the console for "Failed to save app state to Supabase".

-- 1) Tables exist
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'investors',
    'startup_events',
    'duty_completions',
    'daily_notes',
    'weekly_update_drafts'
  )
ORDER BY table_name;

-- 2) RLS enabled + policies for investors (expect 4 policies, role authenticated)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'investors'
ORDER BY policyname;

-- 3) Table privileges for authenticated (expect SELECT INSERT UPDATE DELETE)
SELECT table_name, grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'investors'
ORDER BY grantee, privilege_type;

-- 4) Raw row counts (bypasses Table Editor role quirks)
SELECT count(*) AS investor_rows FROM public.investors;

-- 5) Enum labels used by the app (stage must match TypeScript / migration)
SELECT e.enumlabel
FROM pg_enum e
JOIN pg_type t ON t.oid = e.enumtypid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
  AND t.typname = 'investor_stage'
ORDER BY e.enumsortorder;
