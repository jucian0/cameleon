import { Button } from "components/ui/button";
import { Modal } from "components/ui/modal";
import { ProgressCircle } from "components/ui/progress-circle";
import { useNavigation, useSubmit } from "react-router";

export function DeleteModal({
  id,
  isOpen,
  onClose,
}: {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const deleteSubmit = useSubmit();
  const navigation = useNavigation();

  const deleteAction = () => {
    deleteSubmit({ action: "delete", id }, { method: "post" }).then(() => {
      onClose();
    });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Content role="alertdialog" isBlurred>
        <Modal.Header>
          <Modal.Title>
            Are you sure you want to delete this workflow?
          </Modal.Title>
          <Modal.Description>
            This action cannot be undone. All data associated with this workflow
            will be permanently deleted.
          </Modal.Description>
        </Modal.Header>
        <Modal.Footer>
          <Modal.Close onPress={onClose}>Cancel</Modal.Close>
          <Button
            intent="danger"
            onPress={deleteAction}
            isPending={navigation.state === "submitting"}
          >
            {({ isPending }) => (
              <>
                {isPending && (
                  <ProgressCircle isIndeterminate aria-label="Creating..." />
                )}
                {isPending ? "Deleting..." : "Delete"}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
