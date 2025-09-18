import { buttonStyles } from "app/components/ui/button";
import type { Route } from "./+types/home-page";
import { IconPlus } from "@intentui/icons";
import { Menu } from "app/components/ui/menu";
import type { LoaderFunctionArgs } from "react-router";
import { createServerSupabase } from "app/modules/supabase/supabase-server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@/components/ui/link";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const productInfo = {
  title: "Cameleon - Your Integration Companion",
  description:
    "Cameleon simplifies integration design by providing tools to manage workflows and user profiles effectively. Build, organize, and share your integrations effortlessly.",
};

const userProfile = {
  name: "John Doe",
  role: "Integration Architect",
  projects: 5,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const currentUser = await supabase.auth.getUser();

  return {
    user: currentUser.data.user,
  };
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="p-8 mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Welcome back, {loaderData.user?.user_metadata.name} 👋
        </h1>
        <Menu>
          <Menu.Trigger className={buttonStyles({ intent: "primary" })}>
            <IconPlus /> New Project
          </Menu.Trigger>
          <Menu.Content placement="bottom">
            <Menu.Item href="camel/studio">Camel</Menu.Item>
            {/*<Menu.Item>Rest API</Menu.Item>*/}
          </Menu.Content>
        </Menu>
      </div>

      {/* Product Information */}
      <section>
        <h2 className="text-xl font-semibold mb-3">{productInfo.title}</h2>
        <p className="text-lg text-gray-600">{productInfo.description}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Explore Pages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              href: "/app/camel/workflows",
              title: "Workflows",
              description: "Organize and manage your workflow diagrams.",
            },
            {
              href: "/app/camel/library/eips",
              title: "EIPs Library",
              description: "Explore Enterprise Integration Patterns.",
            },
          ].map((route) => (
            <Card
              key={route.href}
              className="group relative overflow-hidden bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-card hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative pb-3">
                <h3 className="text-lg font-semibold text-[var(--card-title)] mb-2">
                  {route.title}
                </h3>
              </CardHeader>
              <CardContent className="relative pt-0">
                <p className="text-sm text-[var(--card-description)] mb-4">
                  {route.description}
                </p>
                <Link href={route.href}>Go to {route.title}</Link>
              </CardContent>
            </Card>
          ))}
          <Card className="group relative overflow-hidden bg-gradient-card border-border/50 rounded-xl p-6 shadow-md opacity-50 cursor-not-allowed">
            <CardHeader className="relative pb-3">
              <h3 className="text-lg font-semibold text-[var(--card-title)] mb-2">
                Open API
              </h3>
            </CardHeader>
            <CardContent className="relative pt-0">
              <p className="text-sm text-[var(--card-description)] mb-4">
                Coming soon: Explore and interact with Open APIs.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
