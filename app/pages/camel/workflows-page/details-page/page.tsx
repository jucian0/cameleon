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
    return { workflow: workflow.data?.[0] };
  }

  return { workflow: {} };
}

export async function action({ request }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const formData = await request.formData();
  const user = await supabase.auth.getSession();

  const payload = {
    name: formData.get("name"),
    description: formData.get("description"),
    owner: user.data.session?.user.id,
  };
  const id = formData.get("id");
  if (id) {
    payload.id = id;
  }

  const { error } = await supabase.from("workflows").upsert(payload);

  if (error) {
    throw new Response(error.message, { status: 500 });
  }
  return redirect("/camel/workflows");
}

export default withModal<Route.ComponentProps>(function ModalPage({
  isOpen,
  closeModal,
  loaderData,
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
