import AppSidebar from "components/app-sidebar";
import AppSidebarNav from "components/app-sidebar-nav";
import { SidebarProvider, SidebarInset } from "components/ui/sidebar";
import { Outlet } from "react-router";

export default function Layout() {
  return (<SidebarProvider>
    <AppSidebar collapsible="dock" />
    <SidebarInset>
      <AppSidebarNav />
      <Outlet />
    </SidebarInset>
  </SidebarProvider>)
}