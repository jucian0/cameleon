import { generateUniqueId } from "./parser";
import { createEdge, createNode } from "./parser";
import { processSteps } from "./parser";
import { ensureAddBetween } from "./parser";
import { generatePlaceholderNodesAndEdges } from "./parser";
import type { Node, Edge, Step } from "../topology-types";
import { CAMEL_NODE_TYPE, ADD_NODE_TYPE } from "./parser";

export function processChoiceStep(
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
    for (const [i, when] of choice.when.entries()) {
      const absolutePath = `${initialAbsolutePath}.when.${i}`;
      const whenId = generateUniqueId(`when-${stepId}`);

      nodes.push(createNode(whenId, CAMEL_NODE_TYPE, "when", absolutePath));
      edges.push(createEdge(generateUniqueId("edge"), stepId, whenId));

      const whenResult = processSteps(
        when?.steps ?? [],
        nodes,
        edges,
        whenId,
        null,
        absolutePath,
      );
      branchEndIds.push(whenResult.lastStepId);
    }

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
    for (const endId of branchEndIds) {
      edges.push(createEdge(generateUniqueId("edge"), endId, nextStepId));
      ensureAddBetween(nodes, edges, endId, nextStepId, initialAbsolutePath);
    }
  } else {
    // Add placeholder to connect all branches to the next step
    // need to remove last part of the absolutePath to ensure the placeholder give the correct path
    const path = initialAbsolutePath.replace(/\.choice.*$/, "");
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
