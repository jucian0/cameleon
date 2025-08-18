import { Button, buttonStyles } from "components/ui/button";
import type { Route } from "./+types/home-page";
import { IconFile, IconPlus } from "@intentui/icons";
import { RestIcon } from "components/icons/rest";
import { CamelStudioIcon } from "components/icons/camel-studio";
import { Menu } from "components/ui/menu";
import type { LoaderFunctionArgs } from "react-router";
import { createServerSupabase } from "app/modules/supabase/supabase-server";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const mockedProjects = [
  { id: 1, name: "E-commerce API", type: "REST", updatedAt: "2025-05-14" },
  { id: 2, name: "Customer GraphQL", type: "GraphQL", updatedAt: "2025-05-12" },
  { id: 3, name: "Kafka to DB Flow", type: "Camel", updatedAt: "2025-05-10" },
];

const quickStart = [
  { label: "Start Camel Flow", icon: <CamelStudioIcon className="w-5" /> },
  { label: "Start REST API", icon: <RestIcon className="w-5" /> },
  { label: "Import File", icon: <IconFile /> },
];

const presets = [
  { name: "Auth Flow", type: "REST" },
  { name: "Kafka Pipeline", type: "Camel" },
  { name: "User Service Schema", type: "GraphQL" },
];

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

      {/* Recent Projects */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Recent Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockedProjects.map((project) => (
            <div
              key={project.id}
              className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="text-lg font-medium">{project.name}</div>
              <div className="text-sm text-gray-500">Type: {project.type}</div>
              <div className="text-xs text-gray-400">
                Updated: {project.updatedAt}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      {/*<section>
        <h2 className="text-xl font-semibold mb-3">Quick Start</h2>
        <div className="flex flex-wrap gap-4">
          {quickStart.map((item) => (
            <Button key={item.label} intent="secondary">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Button>
          ))}
        </div>
      </section>*/}

      {/* Presets */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Your Presets</h2>
        <div className="flex flex-wrap gap-4">
          {presets.map((preset, index) => (
            <div
              key={index}
              className="bg-bg border rounded-xl px-4 py-3 shadow hover:shadow-md transition"
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-sm text-gray-500">{preset.type}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
