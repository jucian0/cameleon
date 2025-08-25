import AppSidebar from "app/components/app-sidebar";
import AppSidebarNav from "app/components/app-sidebar-nav";
import { SidebarProvider, SidebarInset } from "app/components/ui/sidebar";
import { Outlet, redirect, type LoaderFunctionArgs } from "react-router";
import { createServerSupabase } from "@/modules/supabase/supabase-server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const { data, error } = await supabase.auth.getUser();
  if (!data.user || error) {
    throw redirect("/auth");
  }
  return null;
}

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar collapsible="dock" />
      <SidebarInset>
        <AppSidebarNav />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
