import { Button } from "components/ui/button";
import { Modal } from "components/ui/modal";
import { TextField } from "components/ui/text-field";
import { withModal } from "components/utils/with-modal";

export default withModal(function ModalPage({ isOpen, closeModal }) {
  function close() {
    closeModal(false);
  }
  return (
    <Modal isOpen={isOpen} onOpenChange={closeModal}>
      <Modal.Content isBlurred>
        <>
          <Modal.Header>
            <Modal.Title>Rename project</Modal.Title>
            <Modal.Description>
              Change how this project will appear across the dashboard.
            </Modal.Description>
          </Modal.Header>
          <Modal.Body>
            <TextField autoFocus aria-label="Name" placeholder="Enter a name" />
          </Modal.Body>
          <Modal.Footer>
            <Button onPress={close} intent="plain">
              Cancel
            </Button>
            <Button onPress={close} intent="primary">
              Save changes
            </Button>
          </Modal.Footer>
        </>
      </Modal.Content>
    </Modal>
  );
});
