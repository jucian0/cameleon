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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { Link } from "app/components/ui/link";
import { TextField } from "app/components/ui/text-field";
import { Textarea } from "app/components/ui/textarea";
import { ArrowLeft, LayoutTemplate, Save } from "lucide-react";
import {
  Form,
  redirect,
  useLoaderData,
  useNavigation,
  type LoaderFunctionArgs,
} from "react-router";
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

export default function CreateApi({
  actionData,
}: {
  actionData?: { error?: string };
}) {
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isPending = navigation.state === "submitting";
  const [selectedTemplateId, setSelectedTemplateId] =
    React.useState<string>("");

  return (
    <div className="m-6 max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/app/apis">
          <Button intent="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="px-4 py-4">
          <CardTitle>Create API</CardTitle>
          <p className="text-sm text-muted-fg">
            Start from a blank API or choose a reusable template as the initial
            structure.
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <Form method="post" className="space-y-4">
            <input type="hidden" name="templateId" value={selectedTemplateId} />
            <TextField name="name" label="API name" isRequired />
            <Textarea name="description" label="Description" />
            {loaderData.templatesError ? (
              <p className="text-sm text-danger">{loaderData.templatesError}</p>
            ) : loaderData.templates.length ? (
              <section className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Template
                  </p>
                  <p className="text-sm text-muted-fg">
                    Choose a system or custom template, or leave this blank to
                    start from scratch.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {loaderData.templates.map((template: ApiTemplate) => {
                    const isSelected = selectedTemplateId === template.id;
                    const isOwned = template.owner === loaderData.currentUserId;

                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() =>
                          setSelectedTemplateId((current) =>
                            current === template.id ? "" : template.id,
                          )
                        }
                        className="text-left"
                      >
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
                                    intent={isOwned ? "secondary" : "warning"}
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
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}
            {actionData?.error ? (
              <p className="text-sm text-danger">{actionData.error}</p>
            ) : null}
            <div className="flex justify-end">
              <Button type="submit" isPending={isPending}>
                <Save className="h-4 w-4" />
                Create API
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
