import { createServerClient } from "@supabase/auth-helpers-remix";
import type { Database } from "./supabase-db";
import { getSupabaseEnv } from "./supabase-env";

export type SupabaseClientRequest = {
  request: Request;
  response: Response;
};

export function createServerSupabase(request: Request) {
  const response = new Response();
  const { url, key } = getSupabaseEnv();
  const supabase = createServerClient<Database>(url, key, {
    request,
    response,
  });

  return { supabase, response };
}

export type SupabaseClient = ReturnType<
  typeof createServerSupabase
>["supabase"];
export type SupabaseResponse = ReturnType<
  typeof createServerSupabase
>["response"];
