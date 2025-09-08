import {
  type Node,
  type Edge,
  type Step,
  STEP_TYPE,
} from "../../topology-types";
import {
  ensurePlaceholderNext,
  ensurePlaceholderBetween,
} from "../add-placeholders";
import { createNode, createEdge } from "../creation";
import { generateUniqueId, BRANCHING_NODE_TYPES } from "../utils";

export function parseMulticastStep(
  step: Step,
  nodeType: "multicast" | "loadBalance",
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextStepId: string | null,
  absolutePath: string,
  parseSteps: any,
  addNodeId: string,
): string {
  const steps = step[nodeType]?.steps || [];
  const branchEndIds: string[] = [];

  // Add initial placeholder
  const placeholderResult = ensurePlaceholderNext(
    nodes,
    edges,
    stepId,
    absolutePath,
  );
  branchEndIds.push(placeholderResult);

  // Process each branch
  for (const [index, branchStep] of steps.entries()) {
    const nodeType = Object.keys(branchStep)[0] as "multicast";
    const branchPath = `${absolutePath}.steps.${index}`;
    if (branchStep[nodeType]?.steps) {
      const branchNodeId = generateUniqueId(`${nodeType}-${index}`);
      nodes.push(createNode(branchNodeId, nodeType, branchPath));
      edges.push(createEdge(generateUniqueId("edge"), stepId, branchNodeId));

      let result: any;
      if (BRANCHING_NODE_TYPES.has(nodeType)) {
        result = parseMulticastStep(
          branchStep,
          nodeType,
          branchNodeId,
          nodes,
          edges,
          null,
          branchPath,
          parseSteps,
          addNodeId,
        );
      } else {
        result = parseSteps(
          branchStep[nodeType].steps,
          nodes,
          edges,
          branchNodeId,
          null,
          branchPath,
          addNodeId,
        );
      }
      branchEndIds.push(
        typeof result === "string" ? result : result.lastStepId,
      );
    } else {
      // Handle direct endpoints
      const endpointId = generateUniqueId(`${nodeType}-endpoint-${index}`);
      nodes.push(createNode(endpointId, nodeType, branchPath));
      edges.push(createEdge(generateUniqueId("edge"), stepId, endpointId));

      branchEndIds.push(endpointId);
    }
    //connect to the next step or to a placeholder
    branchEndIds.forEach((endId) => {
      edges.push(
        createEdge(generateUniqueId("edge"), endId, nextStepId ?? addNodeId),
      );
    });
  }

  return branchEndIds[branchEndIds.length - 1] || stepId;
}
