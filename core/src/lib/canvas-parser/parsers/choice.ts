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
  nextOrAddId: string | null,
  initialAbsolutePath: string,
  parseSteps: any,
): string {
  const branchLastNodeIds: string[] = [];
  const { choice } = step;

  const placeholderId = ensurePlaceholderNext(
    nodes,
    edges,
    stepId,
    `${initialAbsolutePath}.when.${(choice?.when ?? []).length}`,
    STEP_TYPE.ADD_WHEN,
  );

  // when branches
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
        nextOrAddId,
        absolutePath,
      );

      ensurePlaceholderBetween(
        nodes,
        edges,
        whenResult.lastStepId,
        nextOrAddId!,
        `${absolutePath}.steps.${(when?.steps ?? []).length}`,
      );
    }
  }

  // otherwise branch
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
      nextOrAddId,
      absolutePath,
    );
    ensurePlaceholderBetween(
      nodes,
      edges,
      otherwiseResult.lastStepId,
      nextOrAddId!,
      `${absolutePath}.steps.${choice.otherwise.steps.length}`,
    );
  }

  // Connect branch endings to the next step or to a placeholder
  if (nextOrAddId) {
    for (const endId of branchLastNodeIds) {
      edges.push(createEdge(generateUniqueId("edge"), endId, nextOrAddId));
    }
  }

  return placeholderId || stepId;
}
