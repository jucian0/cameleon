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
import { generateUniqueId } from "../utils";

export function parseChoiceStep(
  step: Step,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextStepId: string | null,
  initialAbsolutePath: string,
  parseSteps: any,
  addNodeId: string,
): string {
  const branchEndIds: string[] = [];
  const { choice } = step;
  //const placeholderId = generateUniqueId("add");

  // Process 'when' branches
  if (Array.isArray(choice?.when)) {
    for (const [i, when] of choice.when.entries()) {
      const absolutePath = `${initialAbsolutePath}.when.${i}`;
      const whenId = generateUniqueId(`when-${stepId}`);

      nodes.push(createNode(whenId, STEP_TYPE.WHEN, absolutePath));
      edges.push(createEdge(generateUniqueId("edge"), stepId, whenId));

      const whenResult = parseSteps(
        when?.steps ?? [],
        nodes,
        edges,
        whenId,
        null,
        absolutePath,
      );

      const betweenId = ensurePlaceholderBetween(
        nodes,
        edges,
        whenResult.lastStepId,
        nextStepId ?? addNodeId, //placeholderId,
        `${absolutePath}.steps.${(when?.steps ?? []).length}`,
      );
      branchEndIds.push(betweenId ?? whenResult.lastStepId);
    }

    // Always add placeholder for 'when' branches
    ensurePlaceholderNext(
      nodes,
      edges,
      stepId,
      `${initialAbsolutePath}.when.${(choice?.when ?? []).length}`,
      STEP_TYPE.ADD_WHEN,
    );
  }

  // Process 'otherwise' branch
  if (choice?.otherwise?.steps) {
    const absolutePath = `${initialAbsolutePath}.otherwise`;
    const otherwiseId = generateUniqueId(`otherwise-${stepId}`);

    nodes.push(createNode(otherwiseId, STEP_TYPE.OTHERWISE, absolutePath));
    edges.push(createEdge(generateUniqueId("edge"), stepId, otherwiseId));

    const otherwiseResult = parseSteps(
      choice.otherwise.steps,
      nodes,
      edges,
      otherwiseId,
      null,
      absolutePath,
    );
    const betweenId = ensurePlaceholderBetween(
      nodes,
      edges,
      otherwiseResult.lastStepId,
      nextStepId ?? addNodeId,
      `${absolutePath}.steps.${choice.otherwise.steps.length}`,
    );
    branchEndIds.push(betweenId ?? otherwiseResult.lastStepId);
  }

  // Connect branches to next step if it exists
  if (nextStepId && branchEndIds.length > 0) {
  } else {
    // Add placeholder to connect all branches to the next step
    // need to remove last part of the absolutePath to ensure the placeholder give the correct path
    for (const endId of branchEndIds) {
      edges.push(createEdge(generateUniqueId("edge"), endId, addNodeId));
    }
    branchEndIds.push(addNodeId);
  }

  return branchEndIds[branchEndIds.length - 1] || stepId;
}
