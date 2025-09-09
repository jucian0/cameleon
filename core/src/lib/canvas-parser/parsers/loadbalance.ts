import { type Node, type Edge, type Step } from "../../topology-types";
import { ensurePlaceholderNext } from "../add-placeholders";
import { createNode, createEdge } from "../creation";
import { generateUniqueId, BRANCHING_NODE_TYPES } from "../utils";

export function parseLoadbalanceStep(
  step: Step,
  nodeType: "loadBalance",
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextOrAddId: string | null,
  absolutePath: string,
  parseSteps: any,
): string {
  const branchSteps = step[nodeType]?.steps || [];
  const branchLastNodeIds: string[] = [];

  // Add initial placeholder
  const placeholderId = ensurePlaceholderNext(
    nodes,
    edges,
    stepId,
    `${absolutePath}.steps.${branchSteps.length}`,
  );

  // Process each branch
  for (const [index, branchStep] of branchSteps.entries()) {
    const branchStepType = Object.keys(branchStep)[0] as "loadBalance";
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
        parsedBranchResult = parseLoadbalanceStep(
          branchStep,
          branchStepType,
          branchContainerNodeId,
          nodes,
          edges,
          nextOrAddId,
          `${branchAbsolutePath}.${branchStepType}`,
          parseSteps,
        );
        branchLastNodeIds.push(parsedBranchResult);
      } else {
        parsedBranchResult = parseSteps(
          branchStep[branchStepType].steps,
          nodes,
          edges,
          branchContainerNodeId,
          nextOrAddId,
          branchAbsolutePath,
        );
      }

      branchLastNodeIds.push(parsedBranchResult.lastStepId);
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
    if (nextOrAddId) {
      for (const endId of branchLastNodeIds) {
        edges.push(createEdge(generateUniqueId("edge"), endId, nextOrAddId));
      }
    }
  }

  return placeholderId || stepId;
}
