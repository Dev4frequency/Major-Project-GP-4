
-- Composite score: modules_completed*100 + total_practice_score + longest_streak*10
CREATE OR REPLACE FUNCTION public.get_leaderboard(_limit int DEFAULT 100)
RETURNS TABLE (
  rank bigint,
  user_id uuid,
  display_name text,
  avatar_url text,
  modules_completed int,
  avg_score numeric,
  total_attempts int,
  longest_streak int,
  composite int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH agg AS (
    SELECT
      p.user_id,
      COALESCE(p.display_name, split_part(COALESCE(p.email,''),'@',1)) AS display_name,
      p.avatar_url,
      COALESCE((SELECT COUNT(*)::int FROM module_progress mp
                 WHERE mp.user_id = p.user_id AND mp.status = 'completed'),0) AS modules_completed,
      COALESCE((SELECT ROUND(AVG(score)::numeric, 1) FROM practice_attempts pa
                 WHERE pa.user_id = p.user_id),0) AS avg_score,
      COALESCE((SELECT COUNT(*)::int FROM practice_attempts pa
                 WHERE pa.user_id = p.user_id),0) AS total_attempts,
      COALESCE((SELECT longest_streak FROM user_streaks us
                 WHERE us.user_id = p.user_id),0) AS longest_streak
    FROM profiles p
  ),
  scored AS (
    SELECT *,
      (modules_completed*100 + COALESCE((SELECT SUM(score)::int FROM practice_attempts pa WHERE pa.user_id=agg.user_id),0) + longest_streak*10)::int AS composite
    FROM agg
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY composite DESC, modules_completed DESC, longest_streak DESC) AS rank,
    user_id, display_name, avatar_url, modules_completed, avg_score, total_attempts, longest_streak, composite
  FROM scored
  ORDER BY composite DESC, modules_completed DESC, longest_streak DESC
  LIMIT _limit;
$$;

CREATE OR REPLACE FUNCTION public.get_user_rank(_uid uuid)
RETURNS TABLE (rank bigint, composite int, total_users bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH lb AS (
    SELECT * FROM public.get_leaderboard(100000)
  )
  SELECT
    COALESCE((SELECT rank FROM lb WHERE user_id = _uid), 0::bigint) AS rank,
    COALESCE((SELECT composite FROM lb WHERE user_id = _uid), 0) AS composite,
    (SELECT COUNT(*) FROM lb) AS total_users;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_rank(uuid) TO authenticated;
