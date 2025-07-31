import { createServerClient } from "@supabase/auth-helpers-remix";
import { redirect, type LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supabaseClient = createServerClient(
      process.env.VITE_PUBLIC_SUPABASE_URL!,
      process.env.VITE_PUBLIC_SUPABASE_ANON_KEY!,
      { request, response },
    );
    await supabaseClient.auth.exchangeCodeForSession(code);
  }

  const next = url.searchParams.get("next");

  if (next) {
    return redirect(next, {
      headers: response.headers,
    });
  }

  return redirect("/", {
    headers: response.headers,
  });
}
