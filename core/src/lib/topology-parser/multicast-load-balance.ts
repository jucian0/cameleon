import { generateUniqueId, ProcessStepsResult } from "./parser";
import { createEdge, createNode } from "./parser";
import { processSteps } from "./parser";
import { ensureAddBetween } from "./parser";
import { generatePlaceholderNodesAndEdges } from "./parser";
import type { Node, Edge, Step, StepType } from "../topology-types";
import { CAMEL_NODE_TYPE, ADD_NODE_TYPE, BRANCHING_NODE_TYPES } from "./parser";

export function processMulticastOrLoadBalanceStep(
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
  for (const [index, branchStep] of steps.entries()) {
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
      branchEndIds.push(
        typeof result === "string" ? result : result.lastStepId,
      );
    } else {
      // Handle direct endpoints
      const endpointId = generateUniqueId(`${nodeType}-endpoint-${index}`);
      nodes.push(createNode(endpointId, CAMEL_NODE_TYPE, nodeType, branchPath));
      edges.push(createEdge(generateUniqueId("edge"), stepId, endpointId));
      branchEndIds.push(endpointId);
    }
  }

  // Connect branches to next step if it exists
  if (nextStepId && branchEndIds.length > 0) {
    for (const endId of branchEndIds) {
      edges.push(createEdge(generateUniqueId("edge"), endId, nextStepId));
      ensureAddBetween(nodes, edges, endId, nextStepId, absolutePath);
    }
  } else {
    // Add placeholder to connect all branches to the next step
    // need to remove last part of the absolutePath to ensure the placeholder give the correct path
    const path = absolutePath
      .replace(/\.multicast.*$/, "")
      .replace(/\.loadBalance.*$/, "");
    const placeholderId = generateUniqueId("add");
    nodes.push(
      createNode(placeholderId, ADD_NODE_TYPE, "add-step", path, "Add"),
    );
    for (const endId of branchEndIds) {
      edges.push(createEdge(generateUniqueId("edge"), endId, placeholderId));
    }
    branchEndIds.push(placeholderId);
  }

  return branchEndIds[branchEndIds.length - 1] || stepId;
}
