import { createServerSupabase } from "@/modules/supabase/supabase-server";
import { Button } from "components/ui/button";
import { Modal } from "components/ui/modal";
import { TextField } from "components/ui/text-field";
import { Textarea } from "components/ui/textarea";
import { withModal } from "components/utils/with-modal";
import { Save } from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import type { Route } from "../details-page/+types/page";

export async function loader({ request }: LoaderFunctionArgs) {
  const supabase = createServerSupabase(request);
  const formData = (await request.formData()).entries();
  const data = Object.fromEntries(formData);
  const { data: workflow, error } = await supabase.supabase
    .from("workflows")
    .upsert({
      name: data.name,
      description: data.description,
    })
    .select()
    .single();

  if (error) {
    throw new Response(error.message, { status: 500 });
  }
  return { workflow };
}

export default withModal<Route.ComponentProps>(function ModalPage({
  isOpen,
  closeModal,
  loaderData,
}) {
  function close() {
    closeModal();
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={closeModal}>
      <Modal.Content isBlurred>
        <>
          <Modal.Header>
            <Modal.Title>Create new workflow</Modal.Title>
            <Modal.Description>
              Enter a name and description for your new workflow. You can change
              it later.
            </Modal.Description>
          </Modal.Header>
          <Modal.Body>
            <TextField
              autoFocus
              aria-label="Name"
              placeholder="Enter a name"
              name="name"
            />
            <Textarea
              className="mt-4"
              aria-label="Description"
              placeholder="Enter a description"
              name="description"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onPress={close} intent="plain">
              Cancel
            </Button>
            <Button onPress={close} intent="primary">
              <Save size={16} /> Save workflow
            </Button>
          </Modal.Footer>
        </>
      </Modal.Content>
    </Modal>
  );
});
