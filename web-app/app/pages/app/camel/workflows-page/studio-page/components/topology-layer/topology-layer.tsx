import { TopologyLibrary } from "./topology-library";
import { Form } from "./topology-form";
import { create } from "zustand";
import { EIPSListNames, type Node } from "core";
import { Sheet } from "app/components/ui/sheet";
import React from "react";
import { FallbackImage } from "@/components/fallback-image";

export function TopologyLayer() {
  const { node, setNode } = useLayer();
  const isOpen = !!node;
  const onUnSelectedNode = () => {
    setNode();
  };

  const iconPath = React.useMemo(() => {
    if (EIPSListNames.includes(node?.stepType!)) {
      return `/camel-icons/eips/${node?.stepType}.svg`;
    } else {
      return `/camel-icons/components/${node?.stepType}.svg`;
    }
  }, [node?.iconName]);

  return (
    <Sheet isOpen={isOpen} onOpenChange={onUnSelectedNode}>
      <Sheet.Content isDismissable>
        <Sheet.Header>
          <Sheet.Title className="gap-2">
            {/* <img src={iconPath} className="w-6 h-auto" /> */}
            <FallbackImage
              src={iconPath}
              fallback="/camel-icons/components/generic.svg"
              alt={node?.iconName || "generic"}
              className="w-6 h-auto"
            />
            {node?.stepType}
          </Sheet.Title>
        </Sheet.Header>
        <Sheet.Body className="space-y-4">
          {node?.operation.includes("add") ? <TopologyLibrary /> : <Form />}
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
}

type LayerStore = {
  node?: Node["data"];
  setNode: (node?: Node["data"]) => void;
  getNode: () => Node["data"] | undefined;
};

export const useLayer = create<LayerStore>((set, get) => ({
  node: undefined,
  setNode: (node) => set({ node }),
  getNode: () => get().node,
}));
