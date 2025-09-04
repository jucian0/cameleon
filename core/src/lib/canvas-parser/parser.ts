/**
 * This file contains the implementation of a topology parser for Camel routes.
 * It is responsible for converting a JSON representation of Camel routes into
 * a topology model consisting of nodes and edges. The topology model is used
 * to represent the structure of the routes visually.
 */
import { v4 as uuidV4 } from "uuid";
import type {
  Edge,
  Node,
  NodeType,
  Route,
  Step,
  StepType,
} from "../topology-types";
import { Position } from "@xyflow/react";
import { processChoiceStep } from "./choice";
import { processDoTryStep } from "./do-try";
import { processMulticastOrLoadBalanceStep } from "./multicast-load-balance";
import { processDefaultSteps } from "./default";

// ==================== Types ====================
export type ProcessStepsResult = {
  nodes: Node[];
  edges: Edge[];
  lastStepId: string;
  nextStepId: string | null;
  absolutePath: string;
};

export type ParsedTopologyModel = {
  nodes: Node[];
  edges: Edge[];
};

// ==================== Constants ====================
export const BRANCHING_NODE_TYPES = new Set([
  "choice",
  "doTry",
  "multicast",
  "loadBalance",
]);

export const ADD_NODE_TYPE = "add-step";
export const ADD_BETWEEN_NODE_TYPE = "add-between";
export const CAMEL_NODE_TYPE = "camel-step";

// ==================== Utility Functions ====================
export function generateUniqueId(prefix: string): string {
  return `${prefix}-${uuidV4()}`;
}

export function resolveNodeType(type: NodeType): NodeType {
  return type === ADD_NODE_TYPE || type === ADD_BETWEEN_NODE_TYPE
    ? type
    : CAMEL_NODE_TYPE;
}

// ==================== Core Creation Functions ====================
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
    //	animated: true,
  };
}

// ==================== Placeholder Functions ====================
export function generatePlaceholderNodesAndEdges(
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

// ==================== Step Processing Functions ====================
export function processSteps(
  steps: Step[],
  nodes: Node[] = [],
  edges: Edge[] = [],
  parentId: string,
  nextStepId: string | null = null,
  initialAbsolutePath: string,
): ProcessStepsResult {
  let previousStepId = parentId;
  let currentNextStepId: string | null = nextStepId;

  steps.forEach((step, i) => {
    const nodeType = Object.keys(step)[0] as StepType;
    const stepId =
      currentNextStepId || generateUniqueId(`${nodeType}-${parentId}`);
    const absolutePath = `${initialAbsolutePath}.steps.${i}.${nodeType}`;

    // Determine next step ID
    currentNextStepId =
      i < steps.length - 1
        ? generateUniqueId(`${Object.keys(steps[i + 1])[0]}-${parentId}`)
        : null;

    // Process the step based on its type
    let lastStepId = stepId;
    if (BRANCHING_NODE_TYPES.has(nodeType)) {
      switch (nodeType) {
        case "choice":
          lastStepId = processChoiceStep(
            step,
            stepId,
            nodes,
            edges,
            currentNextStepId,
            absolutePath,
          );
          break;
        case "doTry":
          lastStepId = processDoTryStep(
            step,
            stepId,
            nodes,
            edges,
            currentNextStepId,
            absolutePath,
          );
          break;
        case "multicast":
        case "loadBalance":
          lastStepId = processMulticastOrLoadBalanceStep(
            step,
            nodeType,
            stepId,
            nodes,
            edges,
            currentNextStepId,
            absolutePath,
          );
          break;
      }
    } else {
      lastStepId = processDefaultSteps(
        step,
        nodeType,
        nodes,
        edges,
        stepId,
        lastStepId,
        absolutePath,
      );
    }

    // Cria nó do step
    nodes.push(createNode(stepId, CAMEL_NODE_TYPE, nodeType, absolutePath));

    // Sempre adiciona um add-step entre o anterior e o atual
    ensureAddBetween(nodes, edges, previousStepId, stepId, absolutePath);

    previousStepId = lastStepId;
  });

  return {
    nodes,
    edges,
    lastStepId: previousStepId,
    nextStepId: currentNextStepId,
    absolutePath: initialAbsolutePath,
  };
}

export function ensureAddBetween(
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

  // Helper: detecta se um node é placeholder de branch (ex: Add when, Add doCatch, ...)
  const isBranchPlaceholder = (n?: Node | null) =>
    !!n &&
    (n.type === ADD_NODE_TYPE || n.data?.type === ADD_NODE_TYPE) &&
    (n.data?.isPlaceholder ||
      (typeof n.data?.label === "string" && n.data.label.startsWith("Add ")));

  // Se source ou target for um placeholder de branch, NÃO criamos add-between.
  if (isBranchPlaceholder(sourceNode) || isBranchPlaceholder(targetNode)) {
    return null;
  }

  // Procura se já existe um mid node (add-between ou placeholder) conectando source -> mid -> target
  const outEdges = edges.filter((e) => e.source === sourceId);
  for (const e of outEdges) {
    const midNode = nodes.find((n) => n.id === e.target);
    if (!midNode) continue;

    const hasMidToTarget = edges.some(
      (e2) => e2.source === midNode.id && e2.target === targetId,
    );
    if (!hasMidToTarget) continue;

    // Se mid é add-between OR é um placeholder (Add ...) tratamos como já existente
    const midIsAddBetween =
      midNode.type === ADD_BETWEEN_NODE_TYPE ||
      midNode.data?.type === ADD_BETWEEN_NODE_TYPE;
    if (midIsAddBetween || isBranchPlaceholder(midNode)) {
      return midNode.id;
    }
  }

  // Se existia uma edge direta source -> target, vamos remover (porque vamos substituí-la)
  const directIdx = edges.findIndex(
    (e) => e.source === sourceId && e.target === targetId,
  );
  if (directIdx !== -1) {
    edges.splice(directIdx, 1);
  }

  // Cria add-between
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

// ==================== Main Export Function ====================
export function jsonToCanvasBuilder(
  route: Route,
  routeIndex: number,
): ParsedTopologyModel {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let lastNodeId: string | null = null;
  let initialAbsolutePath = `data.${routeIndex}.route.from`;

  if (!route) {
    generatePlaceholderNodesAndEdges(
      nodes,
      edges,
      "route.from",
      initialAbsolutePath,
      "Add route",
    );
    return { nodes, edges };
  }

  const fromId = route.route?.id ? route.route.id : generateUniqueId("route");
  nodes.push(
    createNode(
      fromId,
      CAMEL_NODE_TYPE,
      route.route?.from.uri as StepType,
      "route.from",
    ),
  );
  const routeSteps = route.route?.from.steps || [];

  if (routeSteps) {
    const result = processSteps(
      routeSteps,
      nodes,
      edges,
      fromId,
      null,
      initialAbsolutePath,
    );
    lastNodeId = result.lastStepId;
    initialAbsolutePath = result.absolutePath || initialAbsolutePath;

    // Add placeholder if needed
    if (lastNodeId && !lastNodeId.includes("add")) {
      generatePlaceholderNodesAndEdges(
        nodes,
        edges,
        lastNodeId,
        `${initialAbsolutePath}.steps.${routeSteps.length}`,
      );
    }
  }
  return { nodes, edges };
}
