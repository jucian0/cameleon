
import { TopologyBuilder } from "@/camel/studio-components/topology-builder/topology-builder";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import {
  Outlet,
  useOutletContext,
  type LoaderFunctionArgs,
} from "react-router";
import { encode } from "js-base64";

export async function action({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const workflowsId = params.workflow;
  const formData = await request.formData();
  const content = formData.get("content") ?? "";

  await supabase
    .from("workflows")
    .update({
      content: encode(content as string),
    })
    .eq("id", workflowsId);
}

export default function CamelStudio() {
  const { visibility } = useOutletContext<{ visibility: "public" | "private" }>()
  return (
    <>
      <TopologyBuilder />
      <Outlet context={{ visibility }} />
    </>
  );
}
