import React from "react";
import { NodeType } from "../topology-types";
import { CustomAddNode, DefaultNode } from "./custom-nodes";
export * from "./custom-edges";

export const nodeTypes: Record<NodeType, React.ExoticComponent<any>> = {
	"camel-step": DefaultNode,
	"add-step": CustomAddNode,
};
