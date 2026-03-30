import { createServerSupabase } from "@/modules/supabase/supabase-server";
import { getWorkflowAccess } from "@/camel/workflows-access";
import { createWorkflowVersion } from "@/camel/workflow-versions";
import {
  buildWorkflowTemplateConfig,
  getWorkflowTemplateCatalog,
} from "@/camel/workflow-templates";
import { Badge } from "app/components/ui/badge";
import { Button } from "app/components/ui/button";
import { Modal } from "app/components/ui/modal";
import { TextField } from "app/components/ui/text-field";
import { Textarea } from "app/components/ui/textarea";
import { withModal } from "app/components/utils/with-modal";
import { Save, Upload } from "lucide-react";
import {
  redirect,
  useNavigation,
  useParams,
  useSearchParams,
  type LoaderFunctionArgs,
  type MetaArgs,
} from "react-router";
import { ProgressCircle } from "app/components/ui/progress-circle";
import {
  INITIAL_STATE_YAML,
  jsonToCanvasBuilder,
  jsonToYaml,
  yamlToJson,
  type CamelConfig,
} from "core";
import { decode, encode } from "js-base64";
import React from "react";

export function meta({ loaderData }: MetaArgs<typeof loader>) {
  return [
    {
      title: `${loaderData?.workflow.name || "Create a workflow"} | Cameleon`,
    },
    { description: "Create, edit, import, or duplicate workflows." },
  ];
}

export const handle = {
  breadcrumb: () => "Create Workflow",
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const workflowId = params.workflow;
  const action = params.action;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (workflowId) {
    const workflow = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflowId)
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

    if (!access.canView || (action === "clone" && !access.canDuplicate)) {
      throw new Response("You do not have access to this workflow.", {
        status: 403,
      });
    }
    const isClone = action === "clone";
    const data = isClone
      ? { ...workflow.data, name: `Copy of ${workflow.data.name}` }
      : workflow.data;
    return {
      workflow: data,
      templates: getWorkflowTemplateCatalog(),
    };
  }

  return {
    workflow: {},
    templates: getWorkflowTemplateCatalog(),
  };
}

export async function action({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const action = params.action;
  const formData = await request.formData();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Response("You must be signed in to manage workflows.", {
      status: 401,
    });
  }
  const isEdit = action === "edit";
  const isClone = action === "clone";
  const isImport = action === "import";
  const workflowId = params.workflow;
  let sourceWorkflow:
    | {
        id: string;
        owner: string;
        visibility: "public" | "private";
        content: string | null;
      }
    | null
    | undefined;

  if (workflowId) {
    const workflow = await supabase
      .from("workflows")
      .select("id, owner, visibility, content")
      .eq("id", workflowId)
      .maybeSingle();

    if (workflow.error) {
      throw new Response(workflow.error.message, { status: 500 });
    }

    sourceWorkflow = workflow.data;
  }

  if ((isEdit || isClone) && !sourceWorkflow) {
    throw new Response("Workflow not found", { status: 404 });
  }

  if (sourceWorkflow) {
    const access = getWorkflowAccess({
      currentUserId: user?.id,
      owner: sourceWorkflow.owner,
      visibility: sourceWorkflow.visibility,
    });

    if (isEdit && !access.canEdit) {
      throw new Response("You do not have permission to edit this workflow.", {
        status: 403,
      });
    }

    if (isClone && !access.canDuplicate) {
      throw new Response(
        "You do not have permission to duplicate this workflow.",
        {
          status: 403,
        },
      );
    }
  }

  if (!isEdit) formData.delete("id");

  formData.set("owner", user.id);
  formData.set("visibility", "private");
  const creationSource = String(formData.get("creationSource") ?? "blank");
  const templateId = String(formData.get("templateId") ?? "");

  if (isImport) {
    const importFile = formData.get("yamlFile");
    const importContent = formData.get("importContent");
    const rawYaml =
      importFile instanceof File && importFile.size > 0
        ? await importFile.text()
        : typeof importContent === "string"
          ? importContent
          : "";

    if (!rawYaml.trim()) {
      return {
        error: "Provide Camel YAML by pasting text or uploading a file.",
      };
    }

    try {
      const parsed = yamlToJson(rawYaml) as CamelConfig;
      parsed.data.forEach((route, index) => {
        jsonToCanvasBuilder(route, index);
      });
      formData.set("content", encode(jsonToYaml(parsed)));
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? `Import failed: ${error.message}`
            : "Import failed: invalid Camel YAML.",
      };
    }
  }

  if (isClone && sourceWorkflow) {
    formData.set(
      "content",
      sourceWorkflow.content ?? encode(INITIAL_STATE_YAML),
    );
  } else if (!isEdit && !isImport && creationSource === "template") {
    formData.set(
      "content",
      encode(jsonToYaml(buildWorkflowTemplateConfig(templateId))),
    );
  } else if (!isEdit && !isImport) {
    formData.set("content", encode(INITIAL_STATE_YAML));
  } else if (!formData.get("content") && sourceWorkflow?.content) {
    formData.set("content", sourceWorkflow.content);
  }

  const payload = {
    ...(isEdit && workflowId ? { id: workflowId } : {}),
    owner: user.id,
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    visibility: "private" as const,
    content: String(formData.get("content") ?? encode(INITIAL_STATE_YAML)),
  };

  const { data: savedWorkflow, error } = await supabase
    .from("workflows")
    .upsert(payload)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      error: error.details || "Failed to save workflow. Please try again.",
    };
  }

  if (savedWorkflow?.id) {
    const versionResult = await createWorkflowVersion(
      supabase,
      savedWorkflow.id,
      decode(payload.content),
      {
        status: isImport
          ? "imported"
          : isClone
            ? "duplicated"
            : isEdit
              ? "updated"
              : "created",
        description: isImport
          ? "Imported workflow snapshot"
          : isClone
            ? "Duplicated workflow snapshot"
            : isEdit
              ? "Updated workflow snapshot"
              : "Initial workflow snapshot",
      },
    );

    if (versionResult.error) {
      console.error("Error creating workflow version:", versionResult.error);
    }
  }

  if (!isEdit && savedWorkflow?.id) {
    return redirect(`/app/camel/workflows/${savedWorkflow.id}/studio`);
  }

  return redirect("/app/camel/workflows");
}

export default withModal(function ModalPage({
  isOpen,
  closeModal,
  loaderData,
  actionData,
}: any) {
  const navigation = useNavigation();
  const { action } = useParams<"workflow" | "action">();
  const [searchParams] = useSearchParams();
  const pageAction = action?.toUpperCase() || "CREATE";
  const isCreate = action === "create";
  const isImport = action === "import";
  const templates = loaderData.templates ?? [];
  const isTemplateCreate = searchParams.get("mode") === "template";
  const creationSource = isTemplateCreate ? "template" : "blank";
  const [selectedTemplateId, setSelectedTemplateId] = React.useState(
    templates[0]?.id ?? "",
  );

  function handleClose() {
    closeModal("/app/camel/workflows");
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose}>
      <Modal.Content isBlurred size="lg">
        <form
          method="post"
          className="flex max-h-[inherit] flex-col overflow-hidden"
        >
          <Modal.Header>
            <Modal.Title>{pageAction} Workflow</Modal.Title>
            <Modal.Description>
              {isImport
                ? "Paste Camel YAML or upload a file to create a workflow from existing content."
                : isTemplateCreate
                  ? "Choose a practical Camel template and create your workflow from it."
                  : isCreate
                    ? "Create a blank workflow and open it directly in the studio."
                    : "Enter a name and description for your new workflow. You can change it later."}
            </Modal.Description>
          </Modal.Header>
          <Modal.Body>
            <input
              type="hidden"
              name="id"
              value={loaderData?.workflow?.id ?? ""}
            />
            <input
              type="hidden"
              name="content"
              value={loaderData.workflow.content ?? ""}
            />
            <input type="hidden" name="creationSource" value={creationSource} />
            <input type="hidden" name="templateId" value={selectedTemplateId} />
            <TextField
              autoFocus
              aria-label="Name"
              placeholder="Enter a name"
              name="name"
              defaultValue={loaderData?.workflow?.name ?? ""}
            />
            <Textarea
              className="mt-4"
              aria-label="Description"
              placeholder="Enter a description"
              name="description"
              defaultValue={loaderData?.workflow?.description ?? ""}
            />
            {isTemplateCreate && (
              <div className="mt-4 space-y-4 rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Template
                  </p>
                  <p className="text-sm text-muted-fg">
                    Start from a valid Camel pattern that already demonstrates
                    the route structure.
                  </p>
                </div>
                <div className="grid gap-3">
                  {templates.map((template: any) => {
                    const isSelected = selectedTemplateId === template.id;

                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(template.id)}
                        className={`rounded-lg border p-4 text-left transition ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {template.name}
                          </p>
                          <Badge intent="secondary">{template.category}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-foreground">
                          {template.description}
                        </p>
                        <p className="mt-2 text-sm text-muted-fg">
                          {template.explanation}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {isImport && (
              <>
                <div className="mt-4 rounded-lg border border-dashed border-border p-4">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Upload Camel YAML
                  </label>
                  <input
                    type="file"
                    name="yamlFile"
                    accept=".yaml,.yml,text/yaml,text/x-yaml"
                    className="block w-full text-sm text-muted-fg file:mr-4 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-secondary-fg"
                  />
                </div>
                <Textarea
                  className="mt-4"
                  aria-label="Camel YAML"
                  placeholder="Paste Camel YAML here"
                  name="importContent"
                  defaultValue=""
                />
              </>
            )}
            <span aria-label="error" className="text-red-500">
              {actionData?.error}
            </span>
          </Modal.Body>
          <Modal.Footer>
            <Button onPress={handleClose} intent="plain">
              Cancel
            </Button>
            <Button
              type="submit"
              intent="primary"
              isPending={navigation.state === "submitting"}
            >
              {({ isPending }) => (
                <>
                  {isPending ? (
                    <ProgressCircle isIndeterminate aria-label="Creating..." />
                  ) : isImport ? (
                    <Upload size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {isPending
                    ? isImport
                      ? "Importing workflow..."
                      : "Saving workflow..."
                    : isImport
                      ? "Import workflow"
                      : "Save workflow"}
                </>
              )}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal>
  );
});
