import { createServerSupabase } from "@/modules/supabase/supabase-server";
import { Button } from "app/components/ui/button";
import { Modal } from "app/components/ui/modal";
import { TextField } from "app/components/ui/text-field";
import { Textarea } from "app/components/ui/textarea";
import { withModal } from "app/components/utils/with-modal";
import { Save } from "lucide-react";
import { redirect, useNavigation, type LoaderFunctionArgs } from "react-router";
import type { Route } from "../details-page/+types/page";
import { ProgressCircle } from "app/components/ui/progress-circle";
import { encode } from "js-base64";

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

  if (error) {
    return {
      error: error.details || "Failed to save workflow. Please try again.",
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

  function handleClose() {
    closeModal("/camel/workflows");
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose}>
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
              value={loaderData?.workflow?.id ?? ""}
            />
            <input
              type="hidden"
              name="content"
              value={loaderData.workflow.content ?? ""}
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
