import { Node, Edge } from "../topology-types";
import { createEdge, createNode } from "./creation";
import {
  ADD_BETWEEN_NODE_TYPE,
  ADD_NODE_TYPE,
  generateUniqueId,
} from "./utils";
/**
 * Ensure there is an "add-between" node between sourceId and targetId.
 * If such a node already exists, return its ID. If not, create it.
 * If sourceId or targetId is a placeholder node (add-step), do not create an add-between.
 * Useful for maintaining the ability to add steps between existing steps.
 */
export function ensurePlaceholderBetween(
  nodes: Node[],
  edges: Edge[],
  sourceId: string,
  targetId: string,
  absolutePath: string,
  label = "Add between",
): string | null {
  if (!sourceId || !targetId || sourceId === targetId) return null;

  const sourceNode = nodes.find((n) => n.id === sourceId);
  const targetNode = nodes.find((n) => n.id === targetId);

  // Helper: detects if a node is a branch placeholder (e.g., Add when, Add doCatch, ...)
  const isBranchPlaceholder = (n?: Node | null) =>
    !!n &&
    (n.type === ADD_NODE_TYPE || n.data?.type === ADD_NODE_TYPE) &&
    (n.data?.isPlaceholder ||
      (typeof n.data?.label === "string" && n.data.label.startsWith("Add ")));

  // If either source or target is a branch placeholder, we do NOT create an add-between.
  if (isBranchPlaceholder(sourceNode) || isBranchPlaceholder(targetNode)) {
    return null;
  }

  // Search for an existing mid node (add-between or placeholder) connecting source -> mid -> target
  const outEdges = edges.filter((e) => e.source === sourceId);
  for (const e of outEdges) {
    const midNode = nodes.find((n) => n.id === e.target);
    if (!midNode) continue;

    const hasMidToTarget = edges.some(
      (e2) => e2.source === midNode.id && e2.target === targetId,
    );
    if (!hasMidToTarget) continue;

    // If mid is add-between OR is a placeholder (Add ...), we treat it as already existing
    const midIsAddBetween =
      midNode.type === ADD_BETWEEN_NODE_TYPE ||
      midNode.data?.type === ADD_BETWEEN_NODE_TYPE;
    if (midIsAddBetween || isBranchPlaceholder(midNode)) {
      return midNode.id;
    }
  }

  // If there was a direct edge from source to target, we will remove it (because we will replace it)
  // This can happen when adding a step between two existing steps that were directly connected.
  // Note: We do not remove edges if the source or target is a placeholder node (add-step).
  const directIdx = edges.findIndex(
    (e) => e.source === sourceId && e.target === targetId,
  );
  if (directIdx !== -1) {
    edges.splice(directIdx, 1);
  }

  // Creates the add-between node and connects it
  const betweenId = generateUniqueId("add-between");
  nodes.push(
    createNode(
      betweenId,
      ADD_BETWEEN_NODE_TYPE,
      "add-between",
      absolutePath,
      label,
    ),
  );
  edges.push(createEdge(generateUniqueId("edge"), sourceId, betweenId));
  edges.push(createEdge(generateUniqueId("edge"), betweenId, targetId));
  return betweenId;
}

/**
 * Generate a placeholder node (add-step) and connect it to the parent node.
 * Useful for indicating where new steps can be added in the topology.
 */
export function ensurePlaceholderNext(
  nodes: Node[],
  edges: Edge[],
  parentId: string,
  absolutePath: string,
  label = "Add",
): string {
  const placeholderId = generateUniqueId("add");
  nodes.push({
    ...createNode(
      placeholderId,
      ADD_NODE_TYPE,
      "add-step",
      absolutePath,
      label,
    ),
    data: {
      ...createNode(
        placeholderId,
        ADD_NODE_TYPE,
        "add-step",
        absolutePath,
        label,
      ).data,
      isPlaceholder: true,
    },
  });
  edges.push(createEdge(generateUniqueId("edge"), parentId, placeholderId));
  return placeholderId;
}
