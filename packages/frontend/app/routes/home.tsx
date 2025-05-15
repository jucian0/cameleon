import type { Route } from "./+types/home";
import { SidebarInset, SidebarProvider } from "components/ui/sidebar";
import AppSidebar from "components/app-sidebar";
import AppSidebarNav from "components/app-sidebar-nav";
import { CamelStudio } from "@/features/camel/studio";

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
      <CamelStudio />
    </SidebarInset>
  </SidebarProvider>)
}
