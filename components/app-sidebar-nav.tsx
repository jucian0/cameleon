import { Avatar } from "./ui/avatar";
import { Breadcrumbs } from "./ui/breadcrumbs";
import { Menu } from "./ui/menu";
import { Separator } from "./ui/separator";
import { SidebarNav, SidebarTrigger } from "./ui/sidebar";

import {
  IconCommandRegular,
  IconDashboard,
  IconLogout,
  IconSettings,
} from "@intentui/icons";
import { ThemeMenu } from "@/routes/set-theme/menu";
import { useMatches, useRouteLoaderData } from "react-router";
import type { Loader } from "@/root";
import { Link } from "react-aria-components";

function BreadcrumbsNav() {
  const matches = useMatches();
  const crumbs = matches
    .filter((match: any) => match.handle?.breadcrumb)
    .map((match: any) => ({
      path: match.pathname,
      breadcrumb: match.handle.breadcrumb(match.data),
    }));

  return (
    <Breadcrumbs className="hidden md:flex">
      {crumbs.map((crumb, index) => (
        <Breadcrumbs.Item key={index}>
          {index < crumbs.length - 1 ? (
            <Link href={crumb.path}>{crumb.breadcrumb}</Link>
          ) : (
            <span>{crumb.breadcrumb}</span>
          )}
        </Breadcrumbs.Item>
      ))}
    </Breadcrumbs>
  );
}

export default function AppSidebarNav() {
  return (
    <SidebarNav className="border-b">
      <span className="flex items-center gap-x-4">
        <SidebarTrigger className="-mx-2" />
        <Separator className="h-6" orientation="vertical" />
        <BreadcrumbsNav />
      </span>
      <UserMenu />
    </SidebarNav>
  );
}

function UserMenu() {
  const loaderData = useRouteLoaderData<Loader>("root");
  return (
    <Menu>
      <Menu.Trigger className="ml-auto md:hidden" aria-label="Open Menu">
        <Avatar
          src={loaderData?.user?.user_metadata?.avatar_url}
          alt={loaderData?.user?.user_metadata?.full_name}
        />
      </Menu.Trigger>
      <Menu.Content placement="bottom" showArrow className="sm:min-w-64">
        <Menu.Section>
          <Menu.Header separator>
            <span className="block">
              {loaderData?.user?.user_metadata?.full_name}
            </span>
            <span className="font-normal text-muted-fg">
              @{loaderData?.user?.user_metadata?.email}
            </span>
          </Menu.Header>
        </Menu.Section>
        <Menu.Item href="#dashboard">
          <IconDashboard />
          <Menu.Label>Dashboard</Menu.Label>
        </Menu.Item>
        <Menu.Item href="#settings">
          <IconSettings />
          <Menu.Label>Settings</Menu.Label>
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item>
          <IconCommandRegular />
          <Menu.Label>Command Menu</Menu.Label>
        </Menu.Item>
        <ThemeMenu />
        <Menu.Separator />
        <Menu.Item href="#contact-s">
          <Menu.Label>Contact Support</Menu.Label>
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item href="#logout">
          <IconLogout />
          <Menu.Label>Log out</Menu.Label>
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
