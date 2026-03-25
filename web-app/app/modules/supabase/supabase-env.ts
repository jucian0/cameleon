function requiredEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required Supabase env: ${name}`);
  }

  return value;
}

export function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  return {
    url: requiredEnv("SUPABASE_URL or VITE_SUPABASE_URL", url),
    key: requiredEnv(
      "SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
      key,
    ),
  };
}
