import {
  createDefaultApiSpec,
  parseApiSpec,
  serializeApiSpec,
} from "@/rest-studio/rest-spec";
import { createApi, listApiTemplates } from "@/rest-studio/rest-records";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import type { ApiTemplate } from "@/modules/supabase/supabase-db";
import { Badge } from "@/components/ui/badge";
import { Button } from "app/components/ui/button";
import { Card, CardContent, CardHeader } from "app/components/ui/card";
import { Modal } from "app/components/ui/modal";
import { SearchField } from "app/components/ui/search-field";
import { TextField } from "app/components/ui/text-field";
import { Textarea } from "app/components/ui/textarea";
import { withModal } from "app/components/utils/with-modal";
import { LayoutTemplate, Save } from "lucide-react";
import { redirect, useNavigation, type LoaderFunctionArgs } from "react-router";
import {
  Autocomplete,
  ListBox,
  ListBoxItem,
  useFilter,
  type Key,
  type Selection,
} from "react-aria-components";
import React from "react";

export const handle = {
  breadcrumb: () => "Create API",
};

export function meta() {
  return [
    { title: "Create API | Cameleon" },
    { description: "Create a new REST API definition in Rest Studio." },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const templatesResult = await listApiTemplates(supabase, user?.id);

  return {
    currentUserId: user?.id ?? null,
    templates: templatesResult.data ?? [],
    templatesError: templatesResult.error?.message ?? null,
  };
}

export async function action({ request }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    throw new Response("You must be signed in to create APIs.", {
      status: 401,
    });
  }

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const templateId = String(formData.get("templateId") ?? "").trim();

  if (!name) {
    return { error: "API name is required." };
  }

  if (templateId) {
    const templateResult = await supabase
      .from("api_templates")
      .select("id, content")
      .eq("id", templateId)
      .maybeSingle();

    if (templateResult.error) {
      return {
        error: templateResult.error.message || "Failed to load API template.",
      };
    }

    if (!templateResult.data) {
      return { error: "API template not found." };
    }

    const parsedTemplateSpec = parseApiSpec(templateResult.data.content);
    parsedTemplateSpec.info.title = name;
    parsedTemplateSpec.info.description = description;
    parsedTemplateSpec.info.version =
      parsedTemplateSpec.info.version || "1.0.0";

    const result = await createApi(supabase, {
      owner: user.id,
      name,
      description,
      content: serializeApiSpec(parsedTemplateSpec),
    });

    if (result.error || !result.data?.id) {
      return {
        error: result.error?.message || "Failed to create API.",
      };
    }

    return redirect(`/app/apis/${result.data.id}/studio`);
  }

  const spec = createDefaultApiSpec(name);
  spec.info.title = name;
  spec.info.description = description;

  const result = await createApi(supabase, {
    owner: user.id,
    name,
    description,
    content: serializeApiSpec(spec),
  });

  if (result.error || !result.data?.id) {
    return {
      error: result.error?.message || "Failed to create API.",
    };
  }

  return redirect(`/app/apis/${result.data.id}/studio`);
}

export default withModal(function CreateApi({
  isOpen,
  closeModal,
  loaderData,
  actionData,
}: {
  isOpen: boolean;
  closeModal: (callbackUrl: string) => void;
  loaderData: Awaited<ReturnType<typeof loader>>;
  actionData?: { error?: string };
}) {
  const navigation = useNavigation();
  const isPending = navigation.state === "submitting";
  const [selectedTemplateId, setSelectedTemplateId] =
    React.useState<string>("");
  const [templateFilter, setTemplateFilter] = React.useState("");
  const { contains } = useFilter({ sensitivity: "base" });

  const filteredTemplates = React.useMemo(
    () =>
      loaderData.templates.filter((template: ApiTemplate) => {
        if (!templateFilter.trim()) return true;

        return [
          template.name,
          template.description ?? "",
          template.explanation ?? "",
          template.category ?? "",
        ].some((value) => contains(value, templateFilter));
      }),
    [contains, loaderData.templates, templateFilter],
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
    closeModal("/app/apis");
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose}>
      <Modal.Content isBlurred size="2xl" className="sm:max-w-2xl">
        <form
          method="post"
          className="flex max-h-[inherit] flex-col overflow-hidden"
        >
          <Modal.Header>
            <Modal.Title>Create API</Modal.Title>
            <Modal.Description>
              Start from a blank REST API or choose a reusable template as the
              initial structure.
            </Modal.Description>
          </Modal.Header>
          <Modal.Body>
            <input type="hidden" name="templateId" value={selectedTemplateId} />
            <TextField
              autoFocus
              aria-label="API name"
              placeholder="Enter a name"
              name="name"
              isRequired
            />
            <Textarea
              className="mt-4"
              aria-label="Description"
              placeholder="Enter a description"
              name="description"
            />
            {loaderData.templatesError ? (
              <p className="mt-4 text-sm text-danger">
                {loaderData.templatesError}
              </p>
            ) : loaderData.templates.length ? (
              <section className="mt-4 space-y-4 rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Template
                  </p>
                  <p className="text-sm text-muted-fg">
                    Choose a system or custom template, or leave this blank to
                    start from scratch.
                  </p>
                </div>
                <Autocomplete
                  aria-label="API template library"
                  inputValue={templateFilter}
                  onInputChange={setTemplateFilter}
                  filter={contains}
                >
                  <SearchField
                    aria-label="Search API templates"
                    placeholder="Filter templates"
                  />
                  <ListBox
                    aria-label="API templates"
                    selectionMode="single"
                    layout="grid"
                    selectionBehavior="replace"
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
                    {(template: ApiTemplate) => {
                      const isOwned =
                        template.owner === loaderData.currentUserId;

                      return (
                        <ListBoxItem
                          id={template.id}
                          textValue={template.name}
                          className="outline-none"
                        >
                          {({ isSelected }) => (
                            <Card
                              className={`h-full gap-0 py-0 transition ${
                                isSelected
                                  ? "border-primary bg-primary/10"
                                  : "border-border/60 bg-gradient-card"
                              }`}
                            >
                              <CardHeader className="px-4 py-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/60 bg-secondary/40">
                                    <LayoutTemplate className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className="truncate text-base font-semibold text-foreground">
                                        {template.name}
                                      </h3>
                                      <Badge
                                        intent={
                                          isOwned ? "secondary" : "warning"
                                        }
                                      >
                                        {isOwned ? "Custom" : "System"}
                                      </Badge>
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-sm text-muted-fg">
                                      {template.description ||
                                        "Reusable REST API template."}
                                    </p>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="px-4 pb-4 pt-0">
                                <p className="line-clamp-3 text-sm text-foreground">
                                  {template.explanation ||
                                    "Use this template as the starting structure for a new API."}
                                </p>
                              </CardContent>
                            </Card>
                          )}
                        </ListBoxItem>
                      );
                    }}
                  </ListBox>
                </Autocomplete>
              </section>
            ) : null}
            {actionData?.error ? (
              <p className="mt-4 text-sm text-danger">{actionData.error}</p>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <Button intent="secondary" type="button" onPress={handleClose}>
              Cancel
            </Button>
            <div className="flex-1" />
            <Button type="submit" isPending={isPending}>
              <Save className="h-4 w-4" />
              Create API
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal>
  );
});
