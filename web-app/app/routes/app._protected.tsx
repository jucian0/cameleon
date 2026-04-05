import AppSidebar from "app/components/app-sidebar";
import AppSidebarNav from "app/components/app-sidebar-nav";
import { SidebarProvider, SidebarInset } from "app/components/ui/sidebar";
import { Outlet, redirect, type LoaderFunctionArgs } from "react-router";
import { createServerSupabase } from "@/modules/supabase/supabase-server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const { data, error } = await supabase.auth.getUser();
  if (!data.user || error) {
    throw redirect("/app/auth");
  }
  return null;
}

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar collapsible="dock" />
      <SidebarInset>
        <AppSidebarNav />
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
