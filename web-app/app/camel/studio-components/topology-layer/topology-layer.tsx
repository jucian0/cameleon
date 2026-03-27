import { TopologyLibrary } from "./topology-library";
import { Form } from "./topology-form";
import { create } from "zustand";
import { EIPSListNames, type Node } from "core";
import { Sheet } from "app/components/ui/sheet";
import React from "react";
import { FallbackImage } from "app/components/fallback-image";
import { Badge } from "@/components/ui/badge";
import { useOutletContext } from "react-router";

function getPanelCopy(node?: Node["data"]) {
  if (!node) {
    return {
      title: "Camel Authoring",
      description: "Select a node to edit or add a new Camel step.",
    };
  }

  if (node.operation.includes("add")) {
    return {
      title: "Add Camel Step",
      description: `Choose a Camel EIP or component to insert at ${node.absolutePath}.`,
    };
  }

  return {
    title: node.label,
    description: `Editing Camel properties at ${node.absolutePath}. Unsupported structures stay in advanced mode.`,
  };
}

export function TopologyLibraryLayer() {
  const { node, setNode } = useLayer();
  const { visibility } = useOutletContext<{
    visibility: "public" | "private";
  }>();
  const isOpen = !!node;
  const onUnSelectedNode = () => {
    setNode();
  };
  const panelCopy = React.useMemo(() => getPanelCopy(node), [node]);

  const iconPath = React.useMemo(() => {
    if (node?.stepType && EIPSListNames.includes(node.stepType)) {
      return `/camel-icons/eips/${node.stepType}.svg`;
    }
    return `/camel-icons/components/${node?.stepType ?? "generic"}.svg`;
  }, [node?.stepType]);

  return (
    <Sheet isOpen={isOpen} onOpenChange={onUnSelectedNode}>
      <Sheet.Content isDismissable>
        <Sheet.Header className="px-4 py-4 pb-3">
          <div className="flex items-center gap-2 pb-2">
            <Badge
              intent={node?.operation.includes("add") ? "info" : "secondary"}
            >
              {node?.operation.includes("add") ? "Insert" : "Edit"}
            </Badge>
            <Badge intent={visibility === "public" ? "warning" : "info"}>
              {visibility}
            </Badge>
          </div>
          <Sheet.Title className="flex items-center gap-2">
            {!node?.operation.includes("add") && (
              <FallbackImage
                src={iconPath}
                fallback="/camel-icons/components/generic.svg"
                alt={node?.iconName || "generic"}
                className="w-6 h-auto"
              />
            )}
            {panelCopy.title}
          </Sheet.Title>
          <Sheet.Description>{panelCopy.description}</Sheet.Description>
        </Sheet.Header>
        <Sheet.Body className="space-y-4 px-4 py-2 pb-4">
          {node?.absolutePath && (
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
                Config Path
              </p>
              <code className="text-xs text-foreground">
                {node.absolutePath}
              </code>
            </div>
          )}
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
