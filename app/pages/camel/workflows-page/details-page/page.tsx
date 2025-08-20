import { createServerSupabase } from "@/modules/supabase/supabase-server";
import { Button } from "components/ui/button";
import { Modal } from "components/ui/modal";
import { TextField } from "components/ui/text-field";
import { Textarea } from "components/ui/textarea";
import { withModal } from "components/utils/with-modal";
import { Save } from "lucide-react";
import { redirect, useNavigation, type LoaderFunctionArgs } from "react-router";
import type { Route } from "../details-page/+types/page";
import { ProgressCircle } from "components/ui/progress-circle";

export const handle = {
  breadcrumb: () => "Create Workflow",
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const workflowId = params.workflowsId;
  if (workflowId) {
    const workflow = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflowId);
    if (workflow.error) {
      throw new Response(workflow.error.message, { status: 500 });
    }
    const isClone = request.url.includes("clone");
    if (isClone) workflow.data[0].name = `Clone of ${workflow.data?.[0].name}`;
    return { workflow: workflow.data?.[0] };
  }

  return { workflow: {} };
}

function mapSupabaseError(error: {
  code?: string;
  message: string;
  details?: string;
}) {
  switch (error.code) {
    case "23505": // unique_violation
      return "A workflow with this name already exists.";
    case "23503": // foreign_key_violation
      return "Invalid reference to related data.";
    case "22P02": // invalid_text_representation (like invalid UUID)
      return "Invalid input format (check your IDs).";
    default:
      return error.message;
  }
}

export async function action({ request }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const formData = await request.formData();
  const user = await supabase.auth.getUser();
  const isEdit = request.url.includes("edit");
  if (!isEdit) formData.delete("id");
  formData.set("owner", user.data.user?.id || "");

  const { error } = await supabase
    .from("workflows")
    .upsert(Object.fromEntries(formData))
    .select();
  console.log("Workflow upsert error:", error);
  if (error) {
    return {
      error: mapSupabaseError(error),
    };
  }
  return redirect("/camel/workflows");
}

export default withModal<Route.ComponentProps>(function ModalPage({
  isOpen,
  closeModal,
  loaderData,
  actionData,
}) {
  const navigation = useNavigation();

  return (
    <Modal isOpen={isOpen} onOpenChange={closeModal}>
      <Modal.Content isBlurred>
        <form method="post">
          <Modal.Header>
            <Modal.Title>Create new workflow</Modal.Title>
            <Modal.Description>
              Enter a name and description for your new workflow. You can change
              it later.
            </Modal.Description>
          </Modal.Header>
          <Modal.Body>
            <input
              type="hidden"
              name="id"
              value={loaderData?.workflow?.id || ""}
            />
            <TextField
              autoFocus
              aria-label="Name"
              placeholder="Enter a name"
              name="name"
              defaultValue={loaderData?.workflow?.name || ""}
            />
            <Textarea
              className="mt-4"
              aria-label="Description"
              placeholder="Enter a description"
              name="description"
              defaultValue={loaderData?.workflow?.description || ""}
            />
            <span aria-label="error" className="text-red-500">
              {actionData?.error}
            </span>
          </Modal.Body>
          <Modal.Footer>
            <Button onPress={closeModal} intent="plain">
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
                  ) : (
                    <Save size={16} />
                  )}
                  {isPending ? "Saving workflow..." : "Save workflow"}
                </>
              )}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal>
  );
});
