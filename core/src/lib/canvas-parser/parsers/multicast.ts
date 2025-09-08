import { type Node, type Edge, type Step } from "../../topology-types";
import { ensurePlaceholderNext } from "../add-placeholders";
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
): string {
  const branchSteps = step[nodeType]?.steps || [];
  const branchLastNodeIds: string[] = [];

  // Add initial placeholder
  const initialPlaceholderId = ensurePlaceholderNext(
    nodes,
    edges,
    stepId,
    absolutePath,
  );
  branchLastNodeIds.push(initialPlaceholderId);

  // Process each branch
  for (const [index, branchStep] of branchSteps.entries()) {
    const branchStepType = Object.keys(branchStep)[0] as "multicast";
    const branchAbsolutePath = `${absolutePath}.steps.${index}`;

    if (branchStep[branchStepType]?.steps) {
      const branchContainerNodeId = generateUniqueId(
        `${branchStepType}-${index}`,
      );
      nodes.push(
        createNode(branchContainerNodeId, branchStepType, branchAbsolutePath),
      );
      edges.push(
        createEdge(generateUniqueId("edge"), stepId, branchContainerNodeId),
      );

      let parsedBranchResult: any;
      if (BRANCHING_NODE_TYPES.has(branchStepType)) {
        parsedBranchResult = parseMulticastStep(
          branchStep,
          branchStepType,
          branchContainerNodeId,
          nodes,
          edges,
          null,
          branchAbsolutePath,
          parseSteps,
        );
      } else {
        parsedBranchResult = parseSteps(
          branchStep[branchStepType].steps,
          nodes,
          edges,
          branchContainerNodeId,
          null,
          branchAbsolutePath,
        );
      }

      branchLastNodeIds.push(
        typeof parsedBranchResult === "string"
          ? parsedBranchResult
          : parsedBranchResult.lastStepId,
      );
    } else {
      // Handle direct endpoints
      const directEndpointNodeId = generateUniqueId(
        `${branchStepType}-endpoint-${index}`,
      );
      nodes.push(
        createNode(directEndpointNodeId, branchStepType, branchAbsolutePath),
      );
      edges.push(
        createEdge(generateUniqueId("edge"), stepId, directEndpointNodeId),
      );

      branchLastNodeIds.push(directEndpointNodeId);
    }

    // Connect branch endings to the next step or to a placeholder
    for (const endId of branchLastNodeIds) {
      edges.push(createEdge(generateUniqueId("edge"), endId, nextStepId));
    }
  }

  return branchLastNodeIds[branchLastNodeIds.length - 1] || stepId;
}
