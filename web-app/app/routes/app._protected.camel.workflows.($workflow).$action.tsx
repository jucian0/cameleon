import { createServerSupabase } from "@/modules/supabase/supabase-server";
import { getWorkflowAccess } from "@/camel/workflows-access";
import { createWorkflowVersion } from "@/camel/workflow-versions";
import {
  getWorkflowTemplateById,
  listWorkflowTemplates,
} from "@/camel/workflow-template-records";
import type { WorkflowTemplate } from "@/modules/supabase/supabase-db";
import { Badge } from "app/components/ui/badge";
import { Button } from "app/components/ui/button";
import { Modal } from "app/components/ui/modal";
import { SearchField } from "app/components/ui/search-field";
import {
  Select,
  SelectList,
  SelectOption,
  SelectTrigger,
} from "app/components/ui/select";
import { TextField } from "app/components/ui/text-field";
import { Textarea } from "app/components/ui/textarea";
import { withModal } from "app/components/utils/with-modal";
import { CopyPlus, Save, Upload } from "lucide-react";
import {
  redirect,
  useNavigation,
  useParams,
  useSearchParams,
  type LoaderFunctionArgs,
  type MetaArgs,
} from "react-router";
import {
  Autocomplete,
  ListBox,
  ListBoxItem,
  useFilter,
  type Key,
  type Selection,
} from "react-aria-components";
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

type CloneSourceWorkflow = {
  id: string;
  name: string;
  description: string | null;
  owner: string;
  visibility: "public" | "private";
  content: string | null;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const workflowId = params.workflow;
  const action = params.action;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const templates = workflowId
    ? []
    : ((await listWorkflowTemplates(supabase, user?.id)).data ?? []);
  const accessibleWorkflowOptions = workflowId
    ? []
    : ((
        await supabase
          .from("workflows")
          .select("id, name, description, owner, visibility, content")
          .or(`owner.eq.${user?.id ?? ""},visibility.eq.public`)
          .order("updated_at", { ascending: false })
      ).data ?? []);

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
      templates,
      cloneOptions: accessibleWorkflowOptions,
    };
  }

  return {
    workflow: {},
    templates,
    cloneOptions: accessibleWorkflowOptions,
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
  const sourceWorkflowId = String(formData.get("sourceWorkflowId") ?? "");
  let selectedTemplate: WorkflowTemplate | null = null;

  if (!workflowId && creationSource === "clone") {
    const cloneSource = await supabase
      .from("workflows")
      .select("id, owner, visibility, content")
      .eq("id", sourceWorkflowId)
      .maybeSingle();

    if (cloneSource.error) {
      throw new Response(cloneSource.error.message, { status: 500 });
    }

    sourceWorkflow = cloneSource.data;

    if (!sourceWorkflow) {
      return { error: "Select a workflow to duplicate." };
    }

    const access = getWorkflowAccess({
      currentUserId: user?.id,
      owner: sourceWorkflow.owner,
      visibility: sourceWorkflow.visibility,
    });

    if (!access.canDuplicate) {
      throw new Response(
        "You do not have permission to duplicate this workflow.",
        {
          status: 403,
        },
      );
    }
  }

  if (!workflowId && creationSource === "template") {
    const template = await getWorkflowTemplateById(supabase, templateId);

    if (template.error) {
      throw new Response(template.error.message, { status: 500 });
    }

    selectedTemplate = template.data;

    if (!selectedTemplate) {
      return { error: "Select a template to continue." };
    }
  }

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
  } else if (
    !isEdit &&
    !isImport &&
    creationSource === "clone" &&
    sourceWorkflow
  ) {
    formData.set(
      "content",
      sourceWorkflow.content ?? encode(INITIAL_STATE_YAML),
    );
  } else if (
    !isEdit &&
    !isImport &&
    creationSource === "template" &&
    selectedTemplate
  ) {
    formData.set("content", encode(selectedTemplate.content));
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
  const templates = (loaderData.templates ?? []) as WorkflowTemplate[];
  const cloneOptions = (loaderData.cloneOptions ?? []) as CloneSourceWorkflow[];
  const isTemplateCreate = searchParams.get("mode") === "template";
  const isCloneCreate = searchParams.get("mode") === "clone";
  const creationSource = isTemplateCreate
    ? "template"
    : isCloneCreate
      ? "clone"
      : "blank";
  const [selectedTemplateId, setSelectedTemplateId] = React.useState(
    templates[0]?.id ?? "",
  );
  const [selectedCloneSourceId, setSelectedCloneSourceId] = React.useState(
    cloneOptions[0]?.id ?? "",
  );
  const [templateFilter, setTemplateFilter] = React.useState("");
  const { contains } = useFilter({ sensitivity: "base" });
  const filteredTemplates = React.useMemo(
    () =>
      templates.filter((template) => {
        if (!templateFilter.trim()) return true;

        return [
          template.name,
          template.description ?? "",
          template.explanation ?? "",
          template.category ?? "",
        ].some((value) => contains(value, templateFilter));
      }),
    [contains, templateFilter, templates],
  );

  function handleTemplateSelectionChange(selectedKeys: Selection) {
    if (selectedKeys === "all") return;

    const [selectedItem] = Array.from(selectedKeys as Set<Key>)
      .map((key) => filteredTemplates.find((template) => template.id === key))
      .filter(Boolean);

    if (!selectedItem) return;
    setSelectedTemplateId(selectedItem.id);
  }

  function handleClose() {
    closeModal("/app/camel/workflows");
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose}>
      <Modal.Content isBlurred size="2xl" className="sm:max-w-2xl">
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
                  : isCloneCreate
                    ? "Pick an existing workflow and create a new duplicate that opens directly in the studio."
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
            <input
              type="hidden"
              name="sourceWorkflowId"
              value={selectedCloneSourceId}
            />
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
                {templates.length > 0 ? (
                  <Autocomplete
                    aria-label="Template library"
                    inputValue={templateFilter}
                    onInputChange={setTemplateFilter}
                    filter={contains}
                  >
                    <SearchField
                      aria-label="Search templates"
                      placeholder="Filter templates"
                    />
                    <ListBox
                      aria-label="Workflow templates"
                      selectionMode="single"
                      layout="grid"
                      selectionBehavior="replace"
                      disallowEmptySelection
                      shouldFocusWrap
                      onSelectionChange={handleTemplateSelectionChange}
                      className="grid gap-3 md:grid-cols-2"
                      items={filteredTemplates}
                      renderEmptyState={() => (
                        <p className="text-sm text-muted-fg">
                          No templates match your filter.
                        </p>
                      )}
                    >
                      {(template: WorkflowTemplate) => (
                        <ListBoxItem
                          key={template.id}
                          id={template.id}
                          textValue={template.name}
                          className="h-full outline-none"
                        >
                          {({ isSelected }) => (
                            <div
                              className={`flex h-full min-h-56 flex-col rounded-lg border p-4 text-left transition ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/40 hover:bg-muted/30"
                              }`}
                            >
                              <p className="text-sm font-medium text-foreground">
                                {template.name}
                              </p>
                              {template.description && (
                                <p className="mt-2 text-sm text-foreground">
                                  {template.description}
                                </p>
                              )}
                              {template.explanation && (
                                <p className="mt-2 text-sm text-muted-fg">
                                  {template.explanation}
                                </p>
                              )}
                              <div className="mt-auto flex items-center gap-2 pt-4">
                                {template.owner ? (
                                  <Badge intent="secondary">Custom</Badge>
                                ) : (
                                  <Badge intent="warning">System</Badge>
                                )}
                                {template.category && (
                                  <Badge intent="secondary">
                                    {template.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </ListBoxItem>
                      )}
                    </ListBox>
                  </Autocomplete>
                ) : (
                  <p className="text-sm text-muted-fg">
                    No templates are available yet. Add records to
                    `workflow_templates` to populate this list.
                  </p>
                )}
              </div>
            )}
            {isCloneCreate && (
              <div className="mt-4 space-y-4 rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Duplicate from
                  </p>
                  <p className="text-sm text-muted-fg">
                    Start from one of your workflows or a starter and create a
                    new editable copy.
                  </p>
                </div>
                {cloneOptions.length > 0 ? (
                  <>
                    <Select
                      aria-label="Workflow to duplicate"
                      selectedKey={selectedCloneSourceId}
                      onSelectionChange={(key) =>
                        setSelectedCloneSourceId(key?.toString() ?? "")
                      }
                    >
                      <SelectTrigger />
                      <SelectList items={cloneOptions}>
                        {(workflow) => (
                          <SelectOption
                            id={workflow.id}
                            textValue={workflow.name}
                          >
                            <div className="flex flex-col">
                              <span>{workflow.name}</span>
                              {workflow.description && (
                                <span className="text-xs text-muted-fg">
                                  {workflow.description}
                                </span>
                              )}
                            </div>
                          </SelectOption>
                        )}
                      </SelectList>
                    </Select>
                    {cloneOptions.find(
                      (workflow) => workflow.id === selectedCloneSourceId,
                    ) && (
                      <div className="rounded-lg border border-border bg-muted/20 px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            intent={
                              cloneOptions.find(
                                (workflow) =>
                                  workflow.id === selectedCloneSourceId,
                              )?.visibility === "public"
                                ? "warning"
                                : "secondary"
                            }
                          >
                            {cloneOptions.find(
                              (workflow) =>
                                workflow.id === selectedCloneSourceId,
                            )?.visibility === "public"
                              ? "Starter"
                              : "Personal"}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-fg">
                          {cloneOptions.find(
                            (workflow) => workflow.id === selectedCloneSourceId,
                          )?.description ||
                            "This workflow has no description yet."}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-fg">
                    No workflows are available to duplicate yet.
                  </p>
                )}
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
                  ) : isCloneCreate ? (
                    <CopyPlus size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {isPending
                    ? isImport
                      ? "Importing workflow..."
                      : isCloneCreate
                        ? "Duplicating workflow..."
                        : "Saving workflow..."
                    : isImport
                      ? "Import workflow"
                      : isCloneCreate
                        ? "Clone workflow"
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
