import { Button } from "components/ui/button";
import { Modal } from "components/ui/modal";
import { TextField } from "components/ui/text-field";
import { Textarea } from "components/ui/textarea";
import { withModal } from "components/utils/with-modal";
import { Save } from "lucide-react";

export default withModal(function ModalPage({ isOpen, closeModal }) {
  function close() {
    closeModal(false);
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
