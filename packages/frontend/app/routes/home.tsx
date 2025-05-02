import type { Route } from "./+types/home";
import { SidebarInset, SidebarProvider } from "components/ui/sidebar";
import AppSidebar from "components/app-sidebar";
import AppSidebarNav from "components/app-sidebar-nav";
import { Heading } from "react-aria-components";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (<SidebarProvider>
    <AppSidebar collapsible="dock" />
    <SidebarInset>
      <AppSidebarNav />
      <div className="p-4 lg:p-6">
        <Heading>Basic</Heading>
      </div>
    </SidebarInset>
  </SidebarProvider>)
}
