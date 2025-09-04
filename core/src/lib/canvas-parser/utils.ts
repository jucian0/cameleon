import { v4 as uuidV4 } from "uuid";
import { NodeType } from "../topology-types";

export const ADD_NODE_TYPE = "add-step";
export const ADD_BETWEEN_NODE_TYPE = "add-between";
export const CAMEL_NODE_TYPE = "camel-step";

export const BRANCHING_NODE_TYPES = new Set([
  "choice",
  "doTry",
  "multicast",
  "loadBalance",
]);

export function generateUniqueId(prefix: string): string {
  return `${prefix}-${uuidV4()}`;
}

export function resolveNodeType(type: NodeType): NodeType {
  return type === ADD_NODE_TYPE || type === ADD_BETWEEN_NODE_TYPE
    ? type
    : CAMEL_NODE_TYPE;
}
