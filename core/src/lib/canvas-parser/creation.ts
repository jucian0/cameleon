import { Position } from "@xyflow/react";
import type { StepType, Node, Edge } from "../topology-types";

/**
 * Create a node with the given parameters.
 * The node's type is resolved to either a specific type or a generic CAMEL_NODE_TYPE.
 */
export function createNode(
  id: string,
  stepType: StepType,
  absolutePath: string,
  label?: string,
): Node {
  return {
    id,
    data: {
      stepType,
      iconName: stepType,
      absolutePath,
      label: label || stepType,
    },
    position: { x: 0, y: 0 },
    type: stepType.includes("add") ? stepType : "component",
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };
}

export function createEdge(id: string, source: string, target: string): Edge {
  return {
    id,
    source,
    target,
  };
}
