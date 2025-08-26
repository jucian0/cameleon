/**
 * This file contains the implementation of a topology parser for Camel routes.
 * It is responsible for converting a JSON representation of Camel routes into
 * a topology model consisting of nodes and edges. The topology model is used
 * to represent the structure of the routes visually.

 * The main export function is `jsonToTopologyBuilder`, which takes a list of
 * routes and a route ID, and returns a parsed topology model.

 * The file is organized into the following sections:
 * 1. Types: Definitions of TypeScript types used throughout the file.
 * 2. Constants: Constants used for node types and branching logic.
 * 3. Utility Functions: Helper functions for generating unique IDs and resolving node types.
 * 4. Core Creation Functions: Functions for creating nodes and edges.
 * 5. Placeholder Functions: Functions for generating placeholder nodes and edges.
 * 6. Step Processing Functions: Functions for processing different types of steps in a route.
 * 7. Main Export Function: The entry point for converting JSON routes to a topology model.
 */
import { v4 as uuidV4 } from "uuid";
import type {
  Edge,
  Node,
  NodeType,
  Route,
  Step,
  StepType,
} from "./topology-types";
import { Position } from "@xyflow/react";

// ==================== Types ====================
type ProcessStepsResult = {
  nodes: Node[];
  edges: Edge[];
  lastStepId: string;
  nextStepId: string | null;
  absolutePath: string;
};

type ParsedTopologyModel = {
  nodes: Node[];
  edges: Edge[];
};

// ==================== Constants ====================
const BRANCHING_NODE_TYPES = new Set([
  "choice",
  "doTry",
  "multicast",
  "loadBalance",
]);

const ADD_NODE_TYPE = "add-step";
const CAMEL_NODE_TYPE = "camel-step";

// ==================== Utility Functions ====================
function generateUniqueId(prefix: string): string {
  return `${prefix}-${uuidV4()}`;
}

function resolveNodeType(type: NodeType): NodeType {
  return type === ADD_NODE_TYPE ? type : CAMEL_NODE_TYPE;
}

// ==================== Core Creation Functions ====================
function createNode(
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
      operation: type === ADD_NODE_TYPE ? "add-step" : "add-step-between",
      label: label || stepType,
    },
    position: { x: 0, y: 0 },
    type: resolveNodeType(type),
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };
}

function createEdge(id: string, source: string, target: string): Edge {
  return {
    id,
    source,
    target,
    //	animated: true,
  };
}

// ==================== Placeholder Functions ====================
function generatePlaceholderNodesAndEdges(
  nodes: Node[],
  edges: Edge[],
  parentId: string,
  absolutePath: string,
  label: string = "Add",
): string {
  const placeholderId = generateUniqueId("add");
  nodes.push(
    createNode(placeholderId, ADD_NODE_TYPE, "add-step", absolutePath, label),
  );
  edges.push(createEdge(generateUniqueId("edge"), parentId, placeholderId));
  return placeholderId;
}

// ==================== Step Processing Functions ====================
function processDefaultSteps(
  step: Step,
  nodeType: string,
  nodes: Node[],
  edges: Edge[],
  stepId: string,
  lastStepId: string,
  absolutePath: string,
): string {
  if (step[nodeType]?.steps) {
    const stepResult = processSteps(
      step[nodeType].steps,
      nodes,
      edges,
      stepId,
      null,
      absolutePath,
    );
    return stepResult.lastStepId;
  }
  return lastStepId;
}

function processChoiceStep(
  step: Step,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextStepId: string | null,
  initialAbsolutePath: string,
): string {
  const branchEndIds: string[] = [];
  const { choice } = step;

  // Process 'when' branches
  if (Array.isArray(choice?.when)) {
    choice.when.forEach((when: any, i: number) => {
      const absolutePath = `${initialAbsolutePath}.when.${i}`;
      const whenId = generateUniqueId(`when-${stepId}`);

      nodes.push(createNode(whenId, CAMEL_NODE_TYPE, "when", absolutePath));
      edges.push(createEdge(generateUniqueId("edge"), stepId, whenId));

      const whenResult = processSteps(
        when.steps,
        nodes,
        edges,
        whenId,
        null,
        absolutePath,
      );
      branchEndIds.push(whenResult.lastStepId);
    });

    // Always add placeholder for 'when' branches
    const placeholderResult = generatePlaceholderNodesAndEdges(
      nodes,
      edges,
      stepId,
      initialAbsolutePath,
      "Add when",
    );
    branchEndIds.push(placeholderResult);
  }

  // Process 'otherwise' branch
  if (choice?.otherwise?.steps) {
    const absolutePath = `${initialAbsolutePath}.otherwise`;
    const otherwiseId = generateUniqueId(`otherwise-${stepId}`);

    nodes.push(
      createNode(otherwiseId, CAMEL_NODE_TYPE, "otherwise", absolutePath),
    );
    edges.push(createEdge(generateUniqueId("edge"), stepId, otherwiseId));

    const otherwiseResult = processSteps(
      choice.otherwise.steps,
      nodes,
      edges,
      otherwiseId,
      null,
      absolutePath,
    );
    branchEndIds.push(otherwiseResult.lastStepId);
  }

  // Connect branches to next step if it exists
  if (nextStepId && branchEndIds.length > 0) {
    branchEndIds.forEach((endId) => {
      edges.push(createEdge(generateUniqueId("edge"), endId, nextStepId));
    });
  } else {
    // Add placeholder to connect all branches to the next step
    // need to remove last part of the absolutePath to ensure the placeholder give the correct path
    initialAbsolutePath = initialAbsolutePath.replace(/\.choice.*$/, "");
    const placeholderId = generateUniqueId("add");
    nodes.push(
      createNode(
        placeholderId,
        ADD_NODE_TYPE,
        "add-step",
        initialAbsolutePath,
        "Add",
      ),
    );
    branchEndIds.forEach((endId) => {
      edges.push(createEdge(generateUniqueId("edge"), endId, placeholderId));
    });
    branchEndIds.push(placeholderId);
  }

  return branchEndIds[branchEndIds.length - 1] || stepId;
}

function processDoTryStep(
  step: Step,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextStepId: string | null,
  initialAbsolutePath: string,
): string {
  const branchEndIds: string[] = [];
  const { doTry } = step;

  // Process doCatch branch
  if (Array.isArray(doTry?.doCatch)) {
    doTry.doCatch.forEach((doCatch: any, i: number) => {
      const absolutePath = `${initialAbsolutePath}.doCatch.${i}`;
      const doCatchId = generateUniqueId(`doCatch-${stepId}-${i}`);

      nodes.push(
        createNode(doCatchId, CAMEL_NODE_TYPE, "doCatch", absolutePath),
      );
      edges.push(createEdge(generateUniqueId("edge"), stepId, doCatchId));

      const doCatchResult = processSteps(
        doCatch.steps,
        nodes,
        edges,
        doCatchId,
        null,
        absolutePath,
      );
      branchEndIds.push(doCatchResult.lastStepId);
    });
  }

  // Process doFinally branch
  if (doTry?.doFinally) {
    const absolutePath = `${initialAbsolutePath}.doFinally`;
    const doFinallyId = generateUniqueId(`doFinally-${stepId}`);

    nodes.push(
      createNode(doFinallyId, CAMEL_NODE_TYPE, "doFinally", absolutePath),
    );
    edges.push(createEdge(generateUniqueId("edge"), stepId, doFinallyId));

    const doFinallyResult = processSteps(
      doTry.doFinally.steps,
      nodes,
      edges,
      doFinallyId,
      null,
      absolutePath,
    );
    branchEndIds.push(doFinallyResult.lastStepId);
  }

  // Process main try branch
  if (doTry?.steps) {
    const absolutePath = initialAbsolutePath;
    edges.push(createEdge(generateUniqueId("edge"), stepId, stepId));

    const doTryResult = processSteps(
      doTry.steps,
      nodes,
      edges,
      stepId,
      null,
      absolutePath,
    );
    branchEndIds.push(doTryResult.lastStepId);
  }

  // Always add placeholder for doCatch
  const placeholderResult = generatePlaceholderNodesAndEdges(
    nodes,
    edges,
    stepId,
    initialAbsolutePath,
    "Add doCatch",
  );
  branchEndIds.push(placeholderResult);

  // Connect branches to next step if it exists
  if (nextStepId && branchEndIds.length > 0) {
    branchEndIds.forEach((endId) => {
      edges.push(createEdge(generateUniqueId("edge"), endId, nextStepId));
    });
  } else {
    // Add placeholder to connect all branches to the next step
    // need to remove last part of the absolutePath to ensure the placeholder give the correct path
    initialAbsolutePath = initialAbsolutePath.replace(/\.doTry.*$/, "");
    const placeholderId = generateUniqueId("add");
    nodes.push(
      createNode(
        placeholderId,
        ADD_NODE_TYPE,
        "add-step",
        initialAbsolutePath,
        "Add",
      ),
    );
    branchEndIds.forEach((endId) => {
      edges.push(createEdge(generateUniqueId("edge"), endId, placeholderId));
    });
    branchEndIds.push(placeholderId);
  }

  return branchEndIds[branchEndIds.length - 1] || stepId;
}

function processMulticastOrLoadBalanceStep(
  step: Step,
  nodeType: string,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextStepId: string | null,
  absolutePath: string,
): string {
  const steps = step[nodeType]?.steps || [];
  const branchEndIds: string[] = [];

  // Add initial placeholder
  const placeholderResult = generatePlaceholderNodesAndEdges(
    nodes,
    edges,
    stepId,
    absolutePath,
  );
  branchEndIds.push(placeholderResult);

  // Process each branch
  steps.forEach((branchStep: any, index: number) => {
    const nodeType = Object.keys(branchStep)[0] as StepType;
    const branchPath = `${absolutePath}.steps.${index}`;

    if (branchStep[nodeType]?.steps) {
      const branchNodeId = generateUniqueId(`${nodeType}-${index}`);
      nodes.push(
        createNode(branchNodeId, CAMEL_NODE_TYPE, nodeType, branchPath),
      );
      edges.push(createEdge(generateUniqueId("edge"), stepId, branchNodeId));

      let result: ProcessStepsResult | string;
      if (BRANCHING_NODE_TYPES.has(nodeType)) {
        result = processMulticastOrLoadBalanceStep(
          branchStep,
          nodeType,
          branchNodeId,
          nodes,
          edges,
          null,
          branchPath,
        );
      } else {
        result = processSteps(
          branchStep[nodeType].steps,
          nodes,
          edges,
          branchNodeId,
          null,
          branchPath,
        );
      }
      branchEndIds.push((result as any).lastStepId);
    } else {
      // Handle direct endpoints
      const endpointId = generateUniqueId(`${nodeType}-endpoint-${index}`);
      nodes.push(createNode(endpointId, CAMEL_NODE_TYPE, nodeType, branchPath));
      edges.push(createEdge(generateUniqueId("edge"), stepId, endpointId));
      branchEndIds.push(endpointId);
    }
  });

  // Connect branches to next step if it exists
  if (nextStepId && branchEndIds.length > 0) {
    branchEndIds.forEach((endId) => {
      edges.push(createEdge(generateUniqueId("edge"), endId, nextStepId));
    });
  } else {
    // Add placeholder to connect all branches to the next step
    // need to remove last part of the absolutePath to ensure the placeholder give the correct path
    absolutePath = absolutePath
      .replace(/\.multicast.*$/, "")
      .replace(/\.loadBalance.*$/, "");
    const placeholderId = generateUniqueId("add");
    nodes.push(
      createNode(placeholderId, ADD_NODE_TYPE, "add-step", absolutePath, "Add"),
    );
    branchEndIds.forEach((endId) => {
      edges.push(createEdge(generateUniqueId("edge"), endId, placeholderId));
    });
    branchEndIds.push(placeholderId);
  }

  return branchEndIds[branchEndIds.length - 1] || stepId;
}

function processSteps(
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

    // Add the node and edge
    nodes.push(createNode(stepId, CAMEL_NODE_TYPE, nodeType, absolutePath));
    edges.push(createEdge(generateUniqueId("edge"), previousStepId, stepId));
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

// ==================== Main Export Function ====================
export function jsonToTopologyBuilder(
  routes: Route[],
  routeId: string,
): ParsedTopologyModel {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let lastNodeId: string | null = null;
  let initialAbsolutePath = "route.from";

  if (!routeId) {
    generatePlaceholderNodesAndEdges(
      nodes,
      edges,
      "route.from",
      initialAbsolutePath,
      "Add route",
    );
    return { nodes, edges };
  }

  const route = routes?.find((route) => route.route?.id === routeId);
  if (!route) {
    throw new Error(`Route with ID ${routeId} not found`);
  }

  const fromId = generateUniqueId("from");
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
        `${initialAbsolutePath}.steps`,
      );
    }
  }
  return { nodes, edges };
}
