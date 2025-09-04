import React from "react";
import type { NodeType } from "core";
import { DefaultNode } from "./default-node";
import { AddNode } from "./add-node";
import { AddBetweenNode } from "./between-node";
export * from "./default-edges";

export const nodeTypes: Record<NodeType, React.ExoticComponent<any>> = {
  "camel-step": DefaultNode,
  "add-step": AddNode,
  "add-between": AddBetweenNode,
};
