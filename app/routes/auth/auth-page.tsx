import { createClient } from "@/modules/supabase/supabase-client";
import { IconBrandGithub } from "@intentui/icons";
import { Button } from "components/ui/button";
import { Card } from "components/ui/card";
import { useState } from "react";
import { useRouteLoaderData } from "react-router";

export default function AuthPage() {
  const { env } = useRouteLoaderData("root") as {
    env: {
      VITE_PUBLIC_SUPABASE_URL: string;
      VITE_PUBLIC_SUPABASE_ANON_KEY: string;
    };
  };

  const [supabase] = useState(
    createClient(
      env.VITE_PUBLIC_SUPABASE_URL,
      env.VITE_PUBLIC_SUPABASE_ANON_KEY,
    ),
  );

  async function handleGithubSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
      },
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm p-8 shadow-lg bg-sidebar">
        <h1 className="text-2xl font-bold text-center mb-2">
          Sign in to Camelion
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Use your GitHub account to continue
        </p>
        <Button type="submit" className="w-full" onPress={handleGithubSignIn}>
          <IconBrandGithub className="w-5 h-5" />
          Sign in with GitHub
        </Button>
      </Card>
    </div>
  );
}
