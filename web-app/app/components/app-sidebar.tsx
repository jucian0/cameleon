import { Avatar } from "./ui/avatar";
import { Link } from "./ui/link";
import { Menu } from "./ui/menu";
import {
  Sidebar,
  SidebarContent,
  SidebarDisclosure,
  SidebarDisclosureGroup,
  SidebarDisclosurePanel,
  SidebarDisclosureTrigger,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarRail,
  SidebarSection,
  SidebarSectionGroup,
  useSidebar,
} from "./ui/sidebar";
import {
  IconChevronLgDown,
  IconDashboard,
  IconHeadphones,
  IconLogout,
  IconSettings,
  IconShield,
} from "@intentui/icons";
import { twMerge } from "tailwind-merge";
import { CameleonIcon } from "./icons/cameleon";
import { StudioIcon } from "./icons/studio";
import { CamelStudioIcon } from "./icons/camel-studio";
import { ProcessorIcon } from "./icons/processor";
import { SwaggerIcon } from "./icons/swagger";
import { ThemeMenu } from "@/pages/app/set-theme/menu";
import { useLocation, useNavigate, useRouteLoaderData } from "react-router";
import { useState } from "react";
import { createClient } from "@/modules/supabase/supabase-client";
import type { Loader } from "@/root";

export default function AppSidebar(
  props: Readonly<React.ComponentProps<typeof Sidebar>>,
) {
  const { state } = useSidebar();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const loaderData = useRouteLoaderData<Loader>("root");

  const [supabase] = useState(
    createClient(
      loaderData?.env.SUPABASE_URL as "",
      loaderData?.env.SUPABASE_ANON_KEY as "",
    ),
  );

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      navigate("/");
    } catch {
      navigate("/app");
    }
  }
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link
          className="flex items-center gap-x-2 group-data-[collapsible=dock]:size-10 group-data-[collapsible=dock]:justify-center"
          href="/app"
        >
          <CameleonIcon className="size-6 fill-primary" />
          <SidebarLabel className="font-medium">Cameleon</SidebarLabel>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarSectionGroup>
          <SidebarDisclosureGroup defaultExpandedKeys={[1]}>
            <SidebarDisclosure id={1}>
              <SidebarDisclosureTrigger>
                <CamelStudioIcon className="size-4" />
                <SidebarLabel>Camel Studio</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem
                  href="/app/camel/workflows"
                  tooltip="Workflows"
                  isCurrent={pathname.includes("workflows")}
                >
                  <StudioIcon className="size-4" />
                  <SidebarLabel>Workflows</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/app/camel/library/eips"
                  tooltip="Library"
                  isCurrent={pathname.includes("library")}
                >
                  <ProcessorIcon className="size-4" />
                  <SidebarLabel>Library</SidebarLabel>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>
          </SidebarDisclosureGroup>
        </SidebarSectionGroup>
        <SidebarSection>
          <SidebarItem
            href="#"
            tooltip="Contracts"
            badge="Coming soon"
            isCurrent={pathname.includes("contracts")}
            isDisabled
          >
            <SwaggerIcon className="size-4" />
            <SidebarLabel>Open API</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarContent>

      <SidebarFooter>
        <Menu>
          <Menu.Trigger className="group" aria-label="Profile">
            <Avatar
              src={loaderData?.user?.user_metadata?.avatar_url}
              alt={loaderData?.user?.user_metadata?.full_name}
            />
            <div className="in-data-[sidebar-collapsible=dock]:hidden text-sm">
              <SidebarLabel>
                {loaderData?.user?.user_metadata?.full_name}
              </SidebarLabel>
            </div>
            <IconChevronLgDown
              data-slot="chevron"
              className="absolute right-3 size-4 transition-transform group-pressed:rotate-180"
            />
          </Menu.Trigger>
          <Menu.Content
            placement="bottom right"
            className={twMerge(
              state === "expanded"
                ? "sm:min-w-(--trigger-width)"
                : "sm:min-w-60",
            )}
          >
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
              Dashboard
            </Menu.Item>
            <Menu.Item href="#settings">
              <IconSettings />
              Settings
            </Menu.Item>
            <Menu.Item href="#security">
              <IconShield />
              Security
            </Menu.Item>
            <Menu.Separator />

            <Menu.Item href="#contact">
              <IconHeadphones />
              Customer Support
            </Menu.Item>
            <Menu.Separator />
            <ThemeMenu />
            <Menu.Item onAction={handleLogout}>
              <IconLogout />
              Log out
            </Menu.Item>
          </Menu.Content>
        </Menu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
