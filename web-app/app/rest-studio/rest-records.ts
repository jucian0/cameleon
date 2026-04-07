import type {
  ApiRecord,
  ApiTemplate,
  ApiVersion,
  Database,
} from "@/modules/supabase/supabase-db";
import type { SupabaseClient } from "@/modules/supabase/supabase-server";

function parseVersionNumber(version: string | null | undefined) {
  const numericValue = Number.parseInt(version ?? "", 10);
  return Number.isNaN(numericValue) ? 0 : numericValue;
}

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
    .select("id, api_id, version, status, updated_at, description, content")
    .eq("api_id", apiId)
    .order("updated_at", { ascending: false });
}

export async function createApiVersion(
  supabase: SupabaseClient,
  apiId: string,
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
    .from("api_versions")
    .select("version, content")
    .eq("api_id", apiId)
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

  return supabase.from("api_versions").insert({
    api_id: apiId,
    version: nextVersion,
    status,
    description,
    content,
  });
}

export async function deleteApiVersion(
  supabase: SupabaseClient,
  apiId: string,
  versionId: string,
) {
  return supabase
    .from("api_versions")
    .delete()
    .eq("id", versionId)
    .eq("api_id", apiId)
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
