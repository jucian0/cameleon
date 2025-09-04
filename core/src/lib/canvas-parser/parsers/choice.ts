import type { Node, Edge, Step } from "../../topology-types";
import {
  ensurePlaceholderNext,
  ensurePlaceholderBetween,
} from "../add-placeholders";
import { createNode, createEdge } from "../creation";
import { generateUniqueId, CAMEL_NODE_TYPE, ADD_NODE_TYPE } from "../utils";

export function parseChoiceStep(
  step: Step,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextStepId: string | null,
  initialAbsolutePath: string,
  parseSteps: any,
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

      const whenResult = parseSteps(
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
    const placeholderResult = ensurePlaceholderNext(
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

    const otherwiseResult = parseSteps(
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
      ensurePlaceholderBetween(
        nodes,
        edges,
        endId,
        nextStepId,
        initialAbsolutePath,
      );
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
