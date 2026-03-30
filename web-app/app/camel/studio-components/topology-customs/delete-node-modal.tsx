import { Modal } from "app/components/ui/modal";
import { getStructuralBranchCapability, useTopologyStore } from "core";
import { Button } from "app/components/ui/button";
import { deleteStep } from "core/operations";

type Props = {
  node: any;
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
  routeId: string;
};

export function DeleteNodeModal(props: Readonly<Props>) {
  const { camelConfig, setCamelConfig } = useTopologyStore();
  const { node, onOpenChange, isOpen } = props;
  const structuralBranchCapability = getStructuralBranchCapability(
    camelConfig,
    node.absolutePath,
    node.stepType,
  );

  const handleRemoveStep = () => {
    if (!structuralBranchCapability.canDelete) {
      return;
    }

    const updatedConfig = deleteStep(camelConfig, node.absolutePath);
    setCamelConfig(updatedConfig);
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
          {structuralBranchCapability.canDelete
            ? `This will remove the ${node.label} step from the topology. Are you sure you want to proceed?`
            : structuralBranchCapability.reason}
        </Modal.Description>
      </Modal.Header>
      <Modal.Footer>
        <Modal.Close>Cancel</Modal.Close>
        <Button
          intent="danger"
          onPress={handleRemoveStep}
          isDisabled={!structuralBranchCapability.canDelete}
        >
          Continue
        </Button>
      </Modal.Footer>
    </Modal.Content>
  );
}
