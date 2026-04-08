import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Textarea } from "@/components/ui/textarea";
import { createApiTemplate } from "@/rest-studio/rest-records";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import { withModal } from "app/components/utils/with-modal";
import { Sheet } from "app/components/ui/sheet";
import { LayoutTemplate, Save } from "lucide-react";
import React from "react";
import { useFetcher, useLocation, useOutletContext, type LoaderFunctionArgs } from "react-router";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const apiId = params.api;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const api = await supabase
    .from("apis")
    .select("id, name, description, owner, content")
    .eq("id", apiId)
    .maybeSingle();

  if (api.error) {
    throw new Response(api.error.message, { status: 500 });
  }

  if (!api.data) {
    throw new Response("API not found", { status: 404 });
  }

  if (!user?.id || api.data.owner !== user.id) {
    throw new Response("You do not have permission to save templates.", {
      status: 403,
    });
  }

  return {
    api: api.data,
  };
}

export async function action({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const apiId = params.api;
  const formData = await request.formData();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { ok: false, error: "You must be signed in to save templates." };
  }

  const api = await supabase
    .from("apis")
    .select("id, owner, content")
    .eq("id", apiId)
    .maybeSingle();

  if (api.error) {
    return { ok: false, error: api.error.message };
  }

  if (!api.data) {
    return { ok: false, error: "API not found." };
  }

  if (api.data.owner !== user.id) {
    return {
      ok: false,
      error: "You do not have permission to save this API as a template.",
    };
  }

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    category: String(formData.get("category") ?? "").trim() || null,
    explanation: String(formData.get("explanation") ?? "").trim() || null,
    content: api.data.content ?? "",
    owner: user.id,
    source_api_id: api.data.id,
  };

  if (!payload.name) {
    return { ok: false, error: "Template name is required." };
  }

  const result = await createApiTemplate(supabase, payload);

  if (result.error) {
    return { ok: false, error: result.error.message };
  }

  return { ok: true };
}

export default withModal(function SaveApiTemplateModal({
  isOpen,
  closeModal,
  loaderData,
}: any) {
  const location = useLocation();
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const { canEdit } = useOutletContext<{ canEdit: boolean }>();

  React.useEffect(() => {
    if (fetcher.data?.ok) {
      closeModal(
        `${location.pathname.replace("/template", "")}${location.search}`,
      );
    }
  }, [closeModal, fetcher.data, location.pathname, location.search]);

  function handleClose() {
    closeModal(
      `${location.pathname.replace("/template", "")}${location.search}`,
    );
  }

  return (
    <Sheet isOpen={isOpen} onOpenChange={handleClose}>
      <Sheet.Content>
        <fetcher.Form method="post">
          <Sheet.Header className="px-4 py-4 pb-3">
            <div className="flex items-center gap-2">
              <Badge intent="secondary">
                <LayoutTemplate className="h-3 w-3" />
                Template
              </Badge>
            </div>
            <Sheet.Title>Save as template</Sheet.Title>
            <Sheet.Description>
              Create a reusable template from this REST API for future starts.
            </Sheet.Description>
          </Sheet.Header>
          <Sheet.Body className="space-y-4 px-4 py-2 pb-4">
            <TextField
              autoFocus
              name="name"
              aria-label="Template name"
              defaultValue={loaderData.api.name}
              placeholder="Template name"
            />
            <Textarea
              name="description"
              aria-label="Template description"
              defaultValue={loaderData.api.description ?? ""}
              placeholder="Describe what this template is for"
            />
            <TextField
              name="category"
              aria-label="Template category"
              defaultValue=""
              placeholder="Category, e.g. CRUD or Webhook"
            />
            <Textarea
              name="explanation"
              aria-label="Template explanation"
              defaultValue=""
              placeholder="Explain what this template demonstrates"
            />
            {fetcher.data?.error && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-foreground">
                {fetcher.data.error}
              </div>
            )}
          </Sheet.Body>
          <Sheet.Footer className="px-4 py-4 pt-2">
            <Button onPress={handleClose} intent="plain">
              Cancel
            </Button>
            <Button
              type="submit"
              isDisabled={!canEdit}
              isPending={fetcher.state !== "idle"}
            >
              <Save className="h-4 w-4" />
              Save template
            </Button>
          </Sheet.Footer>
        </fetcher.Form>
      </Sheet.Content>
    </Sheet>
  );
});
