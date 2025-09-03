import React from "react";
import type { NodeType } from "core";
import { DefaultNode } from "./custom-component-node";
import { CustomAddNode } from "./custom-add-node";
export * from "./custom-edges";

export const nodeTypes: Record<NodeType, React.ExoticComponent<any>> = {
  "camel-step": DefaultNode,
  "add-step": CustomAddNode,
};
