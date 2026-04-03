import { type Node, type Edge, type Step } from "../../topology-types";
import { ensurePlaceholderNext } from "../add-placeholders";
import { createNode, createEdge } from "../creation";
import { generateUniqueId, BRANCHING_NODE_TYPES } from "../utils";

export function parseRecipientListStep(
  step: Step,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextOrAddId: string | null,
  absolutePath: string,
  parseSteps: any,
): string {
  const branchSteps = Array.isArray(step.recipientList?.steps)
    ? step.recipientList.steps
    : [];
  const branchLastNodeIds: string[] = [];

  const placeholderId = ensurePlaceholderNext(
    nodes,
    edges,
    stepId,
    `${absolutePath}.steps.${branchSteps.length}`,
  );

  for (const [index, branchStep] of branchSteps.entries()) {
    const branchStepType = Object.keys(branchStep)[0] as string;
    const branchAbsolutePath = `${absolutePath}.steps.${index}`;

    if (branchStep[branchStepType]?.steps) {
      const branchContainerNodeId = generateUniqueId(
        `${branchStepType}-${index}`,
      );
      nodes.push(
        createNode(branchContainerNodeId, branchStepType as any, branchAbsolutePath),
      );
      edges.push(
        createEdge(generateUniqueId("edge"), stepId, branchContainerNodeId),
      );

      let parsedBranchResult: any;
      if (BRANCHING_NODE_TYPES.has(branchStepType)) {
        parsedBranchResult = parseRecipientListStep(
          branchStep,
          branchContainerNodeId,
          nodes,
          edges,
          nextOrAddId,
          `${branchAbsolutePath}.recipientList`,
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
      const directEndpointNodeId = generateUniqueId(
        `${branchStepType}-endpoint-${index}`,
      );
      nodes.push(
        createNode(directEndpointNodeId, branchStepType as any, branchAbsolutePath),
      );
      edges.push(
        createEdge(generateUniqueId("edge"), stepId, directEndpointNodeId),
      );

      branchLastNodeIds.push(directEndpointNodeId);
    }

    if (nextOrAddId) {
      for (const endId of branchLastNodeIds) {
        edges.push(createEdge(generateUniqueId("edge"), endId, nextOrAddId));
      }
    }
  }

  if (branchSteps.length > 0 && nextOrAddId) {
    return nextOrAddId;
  }

  return placeholderId || stepId;
}
