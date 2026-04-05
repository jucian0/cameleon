import type {
  ApiRecord,
  ApiTemplate,
  ApiVersion,
  Database,
} from "@/modules/supabase/supabase-db";
import type { SupabaseClient } from "@/modules/supabase/supabase-server";

export async function listApis(
  supabase: SupabaseClient,
  ownerId: string | null | undefined,
) {
  return supabase
    .from("apis")
    .select("*")
    .eq("owner", ownerId ?? "")
    .order("updated_at", { ascending: false });
}

export async function getApiById(supabase: SupabaseClient, apiId: string) {
  return supabase.from("apis").select("*").eq("id", apiId).maybeSingle();
}

export async function createApi(
  supabase: SupabaseClient,
  api: Omit<ApiRecord, "id" | "created_at" | "updated_at">,
) {
  return supabase.from("apis").insert(api).select("id").maybeSingle();
}

export async function updateApi(
  supabase: SupabaseClient,
  apiId: string,
  payload: Database["public"]["Tables"]["apis"]["Update"],
) {
  return supabase.from("apis").update(payload).eq("id", apiId);
}

export async function deleteApi(
  supabase: SupabaseClient,
  apiId: string,
  ownerId: string,
) {
  return supabase
    .from("apis")
    .delete()
    .eq("id", apiId)
    .eq("owner", ownerId)
    .select("id")
    .maybeSingle();
}

export async function listApiVersions(supabase: SupabaseClient, apiId: string) {
  return supabase
    .from("api_versions")
    .select("*")
    .eq("api_id", apiId)
    .order("updated_at", { ascending: false });
}

export async function createApiVersion(
  supabase: SupabaseClient,
  version: Omit<ApiVersion, "id" | "updated_at">,
) {
  return supabase
    .from("api_versions")
    .insert(version)
    .select("id")
    .maybeSingle();
}

export async function listApiTemplates(
  supabase: SupabaseClient,
  ownerId: string | null | undefined,
) {
  return supabase
    .from("api_templates")
    .select("*")
    .or(`owner.is.null,owner.eq.${ownerId ?? ""}`)
    .order("category", { ascending: true })
    .order("name", { ascending: true });
}

export async function getApiTemplateById(
  supabase: SupabaseClient,
  templateId: string,
) {
  return supabase
    .from("api_templates")
    .select("*")
    .eq("id", templateId)
    .maybeSingle();
}

export async function createApiTemplate(
  supabase: SupabaseClient,
  template: Omit<ApiTemplate, "id" | "created_at" | "updated_at">,
) {
  return supabase
    .from("api_templates")
    .insert(template)
    .select("id")
    .maybeSingle();
}
