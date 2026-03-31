import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteWorkflowTemplate,
  listWorkflowTemplates,
} from "@/camel/workflow-template-records";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import type { WorkflowTemplate } from "@/modules/supabase/supabase-db";
import { Card, CardContent, CardHeader } from "app/components/ui/card";
import { Modal } from "app/components/ui/modal";
import { decode } from "js-base64";
import { LayoutTemplate, Trash2 } from "lucide-react";
import React from "react";
import {
  useFetcher,
  useLoaderData,
  useRevalidator,
  useSearchParams,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";

export function meta() {
  return [
    { title: "Templates | Cameleon" },
    { description: "Browse reusable workflow templates." },
  ];
}

export const handle = {
  breadcrumb: () => "Templates",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const templatesResult = await listWorkflowTemplates(supabase, user?.id);

  return {
    currentUserId: user?.id ?? null,
    templates: templatesResult.data ?? [],
    templatesError: templatesResult.error?.message ?? null,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const formData = await request.formData();
  const templateId = String(formData.get("templateId") ?? "");
  const intent = String(formData.get("intent") ?? "");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (intent !== "delete") {
    return { ok: false, error: "Unsupported action." };
  }

  if (!user?.id) {
    return { ok: false, error: "You must be signed in to delete templates." };
  }

  const deleteResult = await deleteWorkflowTemplate(
    supabase,
    templateId,
    user.id,
  );

  if (deleteResult.error) {
    return { ok: false, error: deleteResult.error.message };
  }

  if (!deleteResult.data) {
    return {
      ok: false,
      error:
        "Template could not be deleted. Only your own templates can be removed.",
    };
  }

  return { ok: true, deleted: true };
}

function matchesQuery(template: WorkflowTemplate, query: string) {
  if (!query) return true;
  const normalizedQuery = query.toLowerCase();
  return [
    template.name,
    template.description ?? "",
    template.category ?? "",
    template.explanation ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

function decodeTemplateContent(content: string) {
  return decode(content);
}

export default function CamelTemplatesTab() {
  const loaderData = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const deleteFetcher = useFetcher<{
    ok?: boolean;
    error?: string;
    deleted?: boolean;
  }>();
  const revalidator = useRevalidator();
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<WorkflowTemplate | null>(null);

  const query = searchParams.get("q") ?? "";
  const templates = React.useMemo(
    () =>
      loaderData.templates.filter((template) => matchesQuery(template, query)),
    [loaderData.templates, query],
  );

  React.useEffect(() => {
    if (!deleteFetcher.data?.deleted) {
      return;
    }

    setSelectedTemplate(null);
    revalidator.revalidate();
  }, [deleteFetcher.data?.deleted, revalidator]);

  return (
    <>
      {loaderData.templatesError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-foreground">
          {loaderData.templatesError}
        </div>
      ) : null}
      {templates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-fg">
          No templates to display.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const isOwned = template.owner === loaderData.currentUserId;

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplate(template)}
                className="text-left"
              >
                <Card className="group relative h-56 overflow-hidden border-border/50 bg-gradient-card transition-all duration-300 hover:border-primary/50 hover:shadow-card">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <CardHeader className="relative">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/60 bg-secondary/40">
                        <LayoutTemplate className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-semibold text-foreground">
                          {template.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-fg">
                          {template.description ||
                            "Reusable Camel workflow template."}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative pt-0">
                    <p className="line-clamp-3 text-sm text-foreground">
                      {template.explanation ||
                        "Use this template as a starting point for a new workflow."}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        <Badge intent={isOwned ? "secondary" : "warning"}>
                          {isOwned ? "Custom" : "System"}
                        </Badge>
                        {template.category ? (
                          <Badge intent="secondary">{template.category}</Badge>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={selectedTemplate != null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedTemplate(null);
          }
        }}
      >
        <Modal.Content size="2xl" isBlurred>
          {selectedTemplate ? (
            <>
              <Modal.Header>
                <div className="flex items-center gap-2">
                  <Badge
                    intent={
                      selectedTemplate.owner === loaderData.currentUserId
                        ? "secondary"
                        : "warning"
                    }
                  >
                    <LayoutTemplate className="h-3 w-3" />
                    {selectedTemplate.owner === loaderData.currentUserId
                      ? "Custom"
                      : "System"}
                  </Badge>
                  {selectedTemplate.category ? (
                    <Badge intent="secondary">
                      {selectedTemplate.category}
                    </Badge>
                  ) : null}
                </div>
                <Modal.Title>{selectedTemplate.name}</Modal.Title>
                <Modal.Description>
                  {selectedTemplate.description ||
                    "Reusable Camel workflow template."}
                </Modal.Description>
              </Modal.Header>
              <Modal.Body className="space-y-4">
                {selectedTemplate.explanation ? (
                  <section className="space-y-2 rounded-lg border border-border bg-muted/10 px-4 py-3">
                    <h3 className="text-sm font-medium text-foreground">
                      Explanation
                    </h3>
                    <p className="text-sm text-muted-fg">
                      {selectedTemplate.explanation}
                    </p>
                  </section>
                ) : null}
                <section className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">YAML</h3>
                  <pre className="max-h-[40vh] overflow-auto rounded-lg border border-border bg-muted/20 px-3 py-3 text-xs text-foreground">
                    <code>
                      {decodeTemplateContent(selectedTemplate.content)}
                    </code>
                  </pre>
                </section>
                {deleteFetcher.data?.error ? (
                  <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-foreground">
                    {deleteFetcher.data.error}
                  </div>
                ) : null}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  intent="plain"
                  onPress={() => {
                    setSelectedTemplate(null);
                  }}
                >
                  Close
                </Button>
                {selectedTemplate.owner === loaderData.currentUserId ? (
                  <deleteFetcher.Form method="post">
                    <input
                      type="hidden"
                      name="templateId"
                      value={selectedTemplate.id}
                    />
                    <input type="hidden" name="intent" value="delete" />
                    <Button
                      type="submit"
                      intent="danger"
                      isPending={deleteFetcher.state !== "idle"}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete template
                    </Button>
                  </deleteFetcher.Form>
                ) : null}
              </Modal.Footer>
            </>
          ) : null}
        </Modal.Content>
      </Modal>
    </>
  );
}
