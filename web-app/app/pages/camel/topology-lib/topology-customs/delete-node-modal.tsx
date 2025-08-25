import { Modal } from "app/components/ui/modal";
import { removeStep } from "../topology-operations";
import { useTopologyStore } from "../topology-store";
import { Button } from "app/components/ui/button";

type Props = {
  node: any;
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
};

export function DeleteNodeModal(props: Readonly<Props>) {
  const { getCurrentCamelRoute, setCurrentCamelRoute } = useTopologyStore();
  const { node, onOpenChange, isOpen } = props;

  const handleRemoveStep = () => {
    const selectedRoute = getCurrentCamelRoute();
    const updatedRoute = removeStep(selectedRoute, node.absolutePath);
    setCurrentCamelRoute(updatedRoute);
    onOpenChange(false);
  };

  return (
    <Modal.Content
      role="alertdialog"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Modal.Header>
        <Modal.Title>Delete {node.label} step</Modal.Title>
        <Modal.Description>
          This will remove the {node.label} step from the topology. Are you sure
          you want to proceed?
        </Modal.Description>
      </Modal.Header>
      <Modal.Footer>
        <Modal.Close>Cancel</Modal.Close>
        <Button intent="danger" onPress={handleRemoveStep}>
          Continue
        </Button>
      </Modal.Footer>
    </Modal.Content>
  );
}
