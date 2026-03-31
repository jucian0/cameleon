import type { SupabaseClient } from "@/modules/supabase/supabase-server";

export type WorkflowVersionSnapshot = {
  id: string;
  workflow_id: string;
  version: string;
  status: string;
  updated_at: string;
  description: string;
  content: string;
};

function parseVersionNumber(version: string | null | undefined) {
  const numericValue = Number.parseInt(version ?? "", 10);
  return Number.isNaN(numericValue) ? 0 : numericValue;
}

export async function listWorkflowVersions(
  supabase: SupabaseClient,
  workflowId: string,
) {
  return supabase
    .from("workflow_versions")
    .select(
      "id, workflow_id, version, status, updated_at, description, content",
    )
    .eq("workflow_id", workflowId)
    .order("updated_at", { ascending: false });
}

export async function createWorkflowVersion(
  supabase: SupabaseClient,
  workflowId: string,
  content: string,
  {
    description,
    status,
  }: {
    description: string;
    status: string;
  },
) {
  const latestVersion = await supabase
    .from("workflow_versions")
    .select("version, content")
    .eq("workflow_id", workflowId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestVersion.error) {
    return latestVersion;
  }

  if (latestVersion.data?.content === content) {
    return {
      data: null,
      error: null,
    };
  }

  const nextVersion = String(
    parseVersionNumber(latestVersion.data?.version) + 1,
  );

  return supabase.from("workflow_versions").insert({
    workflow_id: workflowId,
    version: nextVersion,
    status,
    description,
    content,
  });
}

export async function deleteWorkflowVersion(
  supabase: SupabaseClient,
  workflowId: string,
  versionId: string,
) {
  return supabase
    .from("workflow_versions")
    .delete()
    .eq("id", versionId)
    .eq("workflow_id", workflowId)
    .select("id")
    .maybeSingle();
}
