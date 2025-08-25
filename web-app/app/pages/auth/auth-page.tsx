import { createClient } from "@/modules/supabase/supabase-client";
import { IconBrandGithub } from "@intentui/icons";
import { Button } from "app/components/ui/button";
import { Card } from "app/components/ui/card";
import { useState } from "react";
import { useRouteLoaderData } from "react-router";

export function meta() {
  return [
    { title: "Sign in to Camelion" },
    { description: "Use your GitHub account to continue" },
  ];
}

export default function AuthPage() {
  const { env } = useRouteLoaderData("root") as {
    env: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      ENV: string;
    };
  };

  const [supabase] = useState(
    createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY),
  );

  async function handleGithubSignIn() {
    console.log("handleGithubSignIn", env.ENV);
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo:
          env.ENV === "development"
            ? "http://localhost:3000/auth/callback"
            : "https://camelion.juciano.com/auth/callback",
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
