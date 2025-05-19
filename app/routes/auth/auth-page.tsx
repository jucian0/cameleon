import { createClient } from "@/modules/supabase/supabase-client";
import { IconBrandGithub } from "@intentui/icons";
import { Button } from "components/ui/button";
import { Card } from "components/ui/card";
import { useState } from "react";
import { useRouteLoaderData } from "react-router";

export default function AuthPage() {
  const { env } = useRouteLoaderData("root") as {
    env: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    }
  }

  const [supabase] = useState(createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY));

  async function handleGithubSignIn() {
    console.log("Signing in with GitHub...", supabase);
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
      },
    }).catch((error) => {
      console.error("Error signing in with GitHub:", error);
      alert("Failed to sign in with GitHub. Please try again.");
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-sm p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-2">Sign in to Camelion</h1>
        <p className="text-center text-gray-500 mb-6">
          Use your GitHub account to continue
        </p>
        <Button type="submit" className="w-full" onPress={handleGithubSignIn}>
          <IconBrandGithub className="w-5 h-5" />
          Sign in with GitHub
        </Button>
      </Card>
    </div>
  )
}