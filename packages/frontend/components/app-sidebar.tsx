import { Avatar } from "./ui/avatar"
import { Link } from "./ui/link"
import { Menu } from "./ui/menu"
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
  SidebarSectionGroup,
  useSidebar,
} from "./ui/sidebar"
import {
  IconChevronLgDown,
  IconDashboard,
  IconHeadphones,
  IconLogout,
  IconSettings,
  IconShield,
} from "@intentui/icons"
import { twMerge } from "tailwind-merge"
import { ThemeMenu } from "@/features/theme/menu"
import { LanguageMenu } from "@/features/locale/menu"
import { CamelionIcon } from "./icons/camelion"
import { StudioIcon } from "./icons/studio"
import { ComponentIcon } from "./icons/component"
import { CamelStudioIcon } from "./icons/camel-studio"
import { ProcessorIcon } from "./icons/processor"
import { PresetIcon } from "./icons/preset"
import { ContractsIcon } from "./icons/contracts"
import { SwaggerIcon } from "./icons/swagger"

export default function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link
          className="flex items-center gap-x-2 group-data-[collapsible=dock]:size-10 group-data-[collapsible=dock]:justify-center"
          href="/docs/2.x/components/layouts/sidebar"
        >
          <CamelionIcon className="size-6 fill-primary" />
          <SidebarLabel className="font-medium">Camelion</SidebarLabel>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarSectionGroup>
          <SidebarDisclosureGroup defaultExpandedKeys={[1]}>
            <SidebarDisclosure id={1}>
              <SidebarDisclosureTrigger>
                <CamelStudioIcon className="size-4" />
                <SidebarLabel>Apache Camel</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem href="#" tooltip="Studio">
                  <StudioIcon className="size-4" />
                  <SidebarLabel>Studio</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="Processors">
                  <ProcessorIcon className="size-4" />
                  <SidebarLabel>Processors</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#components" tooltip="Components">
                  <ComponentIcon className="size-4" />
                  <SidebarLabel>Components</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#presets" tooltip="Presets">
                  <PresetIcon className="size-4" />
                  <SidebarLabel>Presets</SidebarLabel>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>
            <SidebarDisclosure id={2}>
              <SidebarDisclosureTrigger>
                <SwaggerIcon className="size-4" />
                <SidebarLabel>Open API</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem href="#" tooltip="Contracts">
                  <ContractsIcon className="size-4" />
                  <SidebarLabel>Contracts</SidebarLabel>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>
          </SidebarDisclosureGroup>
        </SidebarSectionGroup>
      </SidebarContent>

      <SidebarFooter>
        <Menu>
          <Menu.Trigger className="group" aria-label="Profile">
            <Avatar shape="square" src="/images/jucian0.png" />
            <div className="in-data-[sidebar-collapsible=dock]:hidden text-sm">
              <SidebarLabel>Jucian0</SidebarLabel>
              <span className="-mt-0.5 block text-muted-fg">juciano@outlook.com.br</span>
            </div>
            <IconChevronLgDown
              data-slot="chevron"
              className="absolute right-3 size-4 transition-transform group-pressed:rotate-180"
            />
          </Menu.Trigger>
          <Menu.Content
            placement="bottom right"
            className={twMerge(state === "expanded" ? "sm:min-w-(--trigger-width)" : "sm:min-w-60")}
          >
            <Menu.Section>
              <Menu.Header separator>
                <span className="block">Jucian0</span>
                <span className="font-normal text-muted-fg">@jucian0</span>
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
            <LanguageMenu />
            <Menu.Item href="#logout">
              <IconLogout />
              Log out
            </Menu.Item>
          </Menu.Content>
        </Menu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
