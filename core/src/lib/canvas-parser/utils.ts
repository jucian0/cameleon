import { v4 as uuidV4 } from "uuid";

export const BRANCHING_NODE_TYPES = new Set([
  "choice",
  "doTry",
  "multicast",
  "loadBalance",
]);

export function generateUniqueId(prefix: string): string {
  return `${prefix}-${uuidV4()}`;
}
