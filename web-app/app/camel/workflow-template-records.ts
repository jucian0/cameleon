import type { WorkflowTemplate } from "@/modules/supabase/supabase-db";
import type { SupabaseClient } from "@/modules/supabase/supabase-server";

export async function listWorkflowTemplates(
  supabase: SupabaseClient,
  currentUserId: string | null | undefined,
) {
  return supabase
    .from("workflow_templates")
    .select("*")
    .or(`owner.is.null,owner.eq.${currentUserId ?? ""}`)
    .order("category", { ascending: true })
    .order("name", { ascending: true });
}

export async function getWorkflowTemplateById(
  supabase: SupabaseClient,
  templateId: string,
) {
  return supabase
    .from("workflow_templates")
    .select("*")
    .eq("id", templateId)
    .maybeSingle();
}

export async function createWorkflowTemplate(
  supabase: SupabaseClient,
  template: Omit<
    WorkflowTemplate,
    "id" | "created_at" | "updated_at"
  >,
) {
  return supabase
    .from("workflow_templates")
    .insert(template)
    .select("id")
    .maybeSingle();
}
