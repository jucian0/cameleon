import { TopologyBuilder } from "@/camel/studio-components/topology-builder/topology-builder";
import {
  getWorkflowAccess,
  type WorkflowAccessContext,
} from "@/camel/workflows-access";
import { createWorkflowVersion } from "@/camel/workflow-versions";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import {
  Outlet,
  isRouteErrorResponse,
  useOutletContext,
  useRouteError,
  type LoaderFunctionArgs,
} from "react-router";
import { encode } from "js-base64";
import { jsonToYaml, yamlToJson } from "core";
import { Link } from "app/components/ui/link";
import { buttonStyles } from "app/components/ui/button";

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

  try {
    yamlToJson(String(content));
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Failed to save invalid YAML: ${error.message}`
          : "Failed to save invalid YAML.",
    };
  }

  const { error } = await supabase
    .from("workflows")
    .update({
      content: encode(content as string),
    })
    .eq("id", workflowsId);

  if (error) {
    return {
      ok: false,
      error: error.message || "Failed to save workflow.",
    };
  }

  const saveMode = String(formData.get("saveMode") ?? "manual");
  let versionResult: Awaited<ReturnType<typeof createWorkflowVersion>> | null =
    null;

  if (saveMode !== "autosave") {
    versionResult = await createWorkflowVersion(
      supabase,
      workflowsId ?? "",
      String(content),
      {
        status: "milestone",
        description: "Manual milestone snapshot",
      },
    );
  }

  if (versionResult?.error) {
    console.error("Error creating workflow version:", versionResult.error);
  }

  if (process.env.NODE_ENV !== "production") {
    try {
      const normalizedYaml = jsonToYaml(yamlToJson(String(content)));
      yamlToJson(normalizedYaml);
    } catch (error) {
      console.error("Post-save workflow verification failed:", error);
    }
  }

  return {
    ok: true,
    savedAt: new Date().toISOString(),
    versionError: versionResult?.error?.message ?? null,
  };
}

export default function CamelStudio() {
  const context = useOutletContext<
    WorkflowAccessContext & { workflowId: string }
  >();

  return (
    <>
      <TopologyBuilder />
      <Outlet context={context} />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const description = isRouteErrorResponse(error)
    ? typeof error.data === "string"
      ? error.data
      : "message" in (error.data ?? {})
        ? String((error.data as { message?: string }).message)
        : "An unexpected studio error occurred."
    : error instanceof Error
      ? error.message
      : "An unexpected studio error occurred.";

  return (
    <div className="m-6 rounded-xl border border-border bg-background p-6">
      <h1 className="text-lg font-semibold text-foreground">
        Studio unavailable
      </h1>
      <p className="mt-2 text-sm text-muted-fg">{description}</p>
      <div className="mt-4">
        <Link
          href="/app/camel/workflows"
          className={buttonStyles({ intent: "secondary", size: "sm" })}
        >
          Back to Workflows
        </Link>
      </div>
    </div>
  );
}
