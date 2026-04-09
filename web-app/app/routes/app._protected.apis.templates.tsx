import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteApiTemplate,
  listApiTemplates,
} from "@/rest-studio/rest-records";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import type { ApiTemplate } from "@/modules/supabase/supabase-db";
import { Card, CardContent, CardHeader } from "app/components/ui/card";
import { Modal } from "app/components/ui/modal";
import { SearchField } from "app/components/ui/search-field";
import { LayoutTemplate, Trash2 } from "lucide-react";
import React from "react";
import {
  ListBox,
  ListBoxItem,
  type Key,
  type Selection,
} from "react-aria-components";
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
    { description: "Browse reusable REST API templates." },
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

  const templatesResult = await listApiTemplates(supabase, user?.id);

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

  const deleteResult = await deleteApiTemplate(supabase, templateId, user.id);

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

function matchesQuery(template: ApiTemplate, query: string) {
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

export default function RestTemplatesTab() {
  const loaderData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const deleteFetcher = useFetcher<{
    ok?: boolean;
    error?: string;
    deleted?: boolean;
  }>();
  const revalidator = useRevalidator();
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<ApiTemplate | null>(null);

  const query = searchParams.get("query") ?? "";
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

  function handleSelectionChange(selectedKeys: Selection) {
    const [selectedItem] = Array.from(selectedKeys as Set<Key>)
      .map((key) => templates.find((item) => item.id === key))
      .filter(Boolean);
    if (!selectedItem) return;
    setSelectedTemplate(selectedItem);
  }

  return (
    <div className="m-6 flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-muted-foreground">
            Browse reusable REST API templates for new APIs and team patterns.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {templates.length} template{templates.length === 1 ? "" : "s"} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchField
            aria-label="Search templates"
            placeholder="Search templates"
            className="w-full max-w-96"
            defaultValue={query}
            onChange={(value) => setSearchParams(value ? { query: value } : {})}
          />
          <Badge intent="secondary">{templates.length}</Badge>
        </div>
      </div>
      {loaderData.templatesError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-foreground">
          {loaderData.templatesError}
        </div>
      ) : null}
      {templates.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-gradient-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            No templates yet
          </h2>
          <p className="mt-2 text-sm text-muted-fg">
            {query
              ? "No templates matched your current search."
              : "Save a REST API as a template or add system templates to start building from reusable API structures."}
          </p>
        </div>
      ) : (
        <ListBox
          layout="grid"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          selectionMode="single"
          onSelectionChange={handleSelectionChange}
          renderEmptyState={() => (
            <span className="text-sm text-muted-fg">
              No templates to display
            </span>
          )}
        >
          {templates.map((template) => {
            const isOwned = template.owner === loaderData.currentUserId;

            return (
              <ListBoxItem
                key={template.id}
                id={template.id}
                textValue={template.name}
              >
                {({ isSelected, isFocusVisible }) => (
                  <Card
                    className={`group relative h-56 gap-0 overflow-hidden border-border/60 bg-gradient-card py-0 transition-all duration-300 hover:border-primary/50 hover:shadow-card ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                        : ""
                    } ${
                      isFocusVisible
                        ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background"
                        : ""
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <CardHeader className="relative gap-3 px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/60 bg-secondary/40">
                          <LayoutTemplate className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-lg font-semibold text-foreground">
                              {template.name}
                            </h3>
                            <Badge intent={isOwned ? "secondary" : "warning"}>
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
                    <CardContent className="relative flex flex-1 flex-col px-4 pb-4 pt-0">
                      <p className="line-clamp-3 text-sm text-foreground">
                        {template.explanation ||
                          "Use this template as a starting point for a new REST API."}
                      </p>
                      <div className="mt-auto pt-4">
                        <div className="flex flex-wrap gap-2">
                          {template.category ? (
                            <Badge intent="secondary">
                              {template.category}
                            </Badge>
                          ) : (
                            <Badge intent="secondary">Template</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </ListBoxItem>
            );
          })}
        </ListBox>
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
                    "Reusable REST API template."}
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
              </Modal.Body>
              <Modal.Footer>
                {selectedTemplate.owner === loaderData.currentUserId ? (
                  <deleteFetcher.Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input
                      type="hidden"
                      name="templateId"
                      value={selectedTemplate.id}
                    />
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
    </div>
  );
}
