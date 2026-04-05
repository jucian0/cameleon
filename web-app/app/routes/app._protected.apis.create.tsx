import {
  createDefaultApiSpec,
  serializeApiSpec,
} from "@/rest-studio/rest-spec";
import { createApi } from "@/rest-studio/rest-records";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
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
import { ArrowLeft, Save } from "lucide-react";
import {
  Form,
  redirect,
  useNavigation,
  type LoaderFunctionArgs,
} from "react-router";

export const handle = {
  breadcrumb: () => "Create API",
};

export function meta() {
  return [
    { title: "Create API | Cameleon" },
    { description: "Create a new REST API definition in Rest Studio." },
  ];
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

  if (!name) {
    return { error: "API name is required." };
  }

  const spec = createDefaultApiSpec(name);
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
  const navigation = useNavigation();
  const isPending = navigation.state === "submitting";

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
            Start a REST API design with a blank resource structure and
            generated OpenAPI preview.
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <Form method="post" className="space-y-4">
            <TextField name="name" label="API name" isRequired />
            <Textarea name="description" label="Description" />
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
