import { Modal } from "app/components/ui/modal";
import { removeStep } from "core";
import { useTopologyStore } from "core";
import { Button } from "app/components/ui/button";

type Props = {
  node: any;
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
  routeId: string;
};

export function DeleteNodeModal(props: Readonly<Props>) {
  const { camelConfig, updateCamelRoute } = useTopologyStore();
  const { node, onOpenChange, isOpen } = props;

  const handleRemoveStep = () => {
    const selectedRoute = camelConfig?.data?.find(
      (route) => route.route?.id === node.routeId,
    );
    if (!selectedRoute) return;
    const updatedRoute = removeStep(selectedRoute, node.absolutePath);
    updateCamelRoute(updatedRoute, props.routeId);
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
