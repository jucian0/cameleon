import AppSidebar from "components/app-sidebar";
import AppSidebarNav from "components/app-sidebar-nav";
import { SidebarProvider, SidebarInset } from "components/ui/sidebar";
import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/layout";
import { createServerSupabase } from "@/modules/supabase/supabase-server";

// const serverAuth: Route.unstable_MiddlewareFunction = async ({ request }) => {
//   const { supabase } = createServerSupabase(request);
//   const { data, error } = await supabase.auth.getUser();
//   if (!data.user || error) {
//     throw redirect("/auth");
//   }
// };

// export const unstable_middleware = [serverAuth]

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
