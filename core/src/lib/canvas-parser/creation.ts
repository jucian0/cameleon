import { Position } from "@xyflow/react";
import { NodeType, StepType, Node, Edge } from "../topology-types";
import { ADD_NODE_TYPE, resolveNodeType } from "./utils";

/**
 * Create a node with the given parameters.
 * The node's type is resolved to either a specific type or a generic CAMEL_NODE_TYPE.
 */
export function createNode(
  id: string,
  type: NodeType,
  stepType: StepType,
  absolutePath: string,
  label?: string,
): Node {
  return {
    id,
    data: {
      type,
      stepType,
      iconName: stepType,
      absolutePath,
      operation: type === ADD_NODE_TYPE ? "add-step" : "read",
      label: label || stepType,
    },
    position: { x: 0, y: 0 },
    type: resolveNodeType(type),
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
