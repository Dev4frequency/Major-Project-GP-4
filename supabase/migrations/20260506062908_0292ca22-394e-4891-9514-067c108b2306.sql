
ALTER FUNCTION public.set_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_activity(UUID, TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_bump_practice() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_bump_assignment() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_bump_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_bump_module() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
