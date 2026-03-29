import { TopologyBuilder } from "@/camel/studio-components/topology-builder/topology-builder";
import {
  getWorkflowAccess,
  type WorkflowAccessContext,
} from "@/camel/workflows-access";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const workflow = await supabase
    .from("workflows")
    .select("id, owner, visibility")
    .eq("id", workflowsId)
    .maybeSingle();

  if (workflow.error) {
    throw new Response(workflow.error.message, { status: 500 });
  }

  if (!workflow.data) {
    throw new Response("Workflow not found", { status: 404 });
  }

  const access = getWorkflowAccess({
    currentUserId: user?.id,
    owner: workflow.data.owner,
    visibility: workflow.data.visibility,
  });

  if (!access.canEdit) {
    throw new Response("You do not have permission to edit this workflow.", {
      status: 403,
    });
  }

  await supabase
    .from("workflows")
    .update({
      content: encode(content as string),
    })
    .eq("id", workflowsId);
}

export default function CamelStudio() {
  const access = useOutletContext<
    WorkflowAccessContext & { workflowId: string }
  >();

  return (
    <>
      <TopologyBuilder />
      <Outlet context={access} />
    </>
  );
}
