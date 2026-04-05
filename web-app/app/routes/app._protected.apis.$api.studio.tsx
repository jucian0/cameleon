import { RestVisualStudio } from "@/rest-studio/rest-visual-studio";
import {
  normalizeApiSpec,
  serializeApiSpec,
  validateApiSpec,
  type ApiSpec,
} from "@/rest-studio/rest-spec";
import { updateApi } from "@/rest-studio/rest-records";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "app/components/ui/button";
import { Link } from "app/components/ui/link";
import { Save } from "lucide-react";
import {
  Form,
  isRouteErrorResponse,
  useNavigation,
  useOutletContext,
  useRouteError,
  type LoaderFunctionArgs,
} from "react-router";

export const handle = {
  breadcrumb: () => "Studio",
};

export async function action({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    throw new Response("You must be signed in to edit APIs.", { status: 401 });
  }

  const api = await supabase
    .from("apis")
    .select("id, owner")
    .eq("id", params.api ?? "")
    .maybeSingle();

  if (api.error) {
    throw new Response(api.error.message, { status: 500 });
  }

  if (!api.data) {
    throw new Response("API not found.", { status: 404 });
  }

  if (api.data.owner !== user.id) {
    throw new Response("You do not have permission to edit this API.", {
      status: 403,
    });
  }

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rawContent = String(formData.get("content") ?? "");

  let parsedContent: ApiSpec;

  try {
    parsedContent = normalizeApiSpec(
      JSON.parse(rawContent) as Partial<ApiSpec>,
    );
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Invalid API content: ${error.message}`
          : "Invalid API content.",
    };
  }

  const validationErrors = validateApiSpec(parsedContent);

  if (!name) {
    validationErrors.unshift("API name is required.");
  }

  if (validationErrors.length) {
    return {
      ok: false,
      error: validationErrors[0],
    };
  }

  const result = await updateApi(supabase, api.data.id, {
    name,
    description,
    content: serializeApiSpec(parsedContent),
  });

  if (result.error) {
    return {
      ok: false,
      error: result.error.message || "Failed to save API.",
    };
  }

  return {
    ok: true,
    savedAt: new Date().toISOString(),
  };
}

export default function ApiStudioEditor({
  actionData,
}: {
  actionData?: { ok?: boolean; error?: string; savedAt?: string };
}) {
  const navigation = useNavigation();
  const context = useOutletContext<{
    apiId: string;
    name: string;
    description: string;
    spec: ApiSpec;
    canEdit: boolean;
    initialSnapshot: string;
  }>();

  return (
    <Form method="post" className="space-y-4">
      {actionData?.error ? (
        <div className="mx-6 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {actionData.error}
        </div>
      ) : null}

      <RestVisualStudio
        initialSpec={context.spec}
        initialName={context.name}
        initialDescription={context.description}
        canEdit={context.canEdit}
        initialSnapshot={context.initialSnapshot}
      />
    </Form>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const description = isRouteErrorResponse(error)
    ? typeof error.data === "string"
      ? error.data
      : "message" in (error.data ?? {})
        ? String((error.data as { message?: string }).message)
        : "The Rest Studio editor is unavailable."
    : error instanceof Error
      ? error.message
      : "The Rest Studio editor is unavailable.";

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <h1 className="text-lg font-semibold text-foreground">
        Studio unavailable
      </h1>
      <p className="mt-2 text-sm text-muted-fg">{description}</p>
      <div className="mt-4">
        <Link
          href="/app/apis"
          className={buttonStyles({ intent: "secondary", size: "sm" })}
        >
          Back to APIs
        </Link>
      </div>
    </div>
  );
}
