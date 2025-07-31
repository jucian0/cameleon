import { createServerClient } from "@supabase/auth-helpers-remix";
import type { Database } from "./supabase-db";

export type SupabaseClientRequest = {
  request: Request;
  response: Response;
};

export function createServerSupabase(request: Request) {
  const response = new Response();
  const supabase = createServerClient<Database>(
    process.env.VITE_PUBLIC_SUPABASE_URL!,
    process.env.VITE_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response },
  );

  return { supabase, response };
}

export type SupabaseClient = ReturnType<
  typeof createServerSupabase
>["supabase"];
export type SupabaseResponse = ReturnType<
  typeof createServerSupabase
>["response"];
