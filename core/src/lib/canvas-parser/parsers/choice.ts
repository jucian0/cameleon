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
  const branchEndIds: string[] = [];
  const { choice } = step;

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
        null,
        absolutePath,
      );

      const betweenId = ensurePlaceholderBetween(
        nodes,
        edges,
        whenResult.lastStepId,
        nextOrAddId!,
        `${absolutePath}.steps.${(when?.steps ?? []).length}`,
      );
      branchEndIds.push(betweenId ?? whenResult.lastStepId);
    }

    ensurePlaceholderNext(
      nodes,
      edges,
      stepId,
      `${initialAbsolutePath}.when.${(choice?.when ?? []).length}`,
      STEP_TYPE.ADD_WHEN,
    );
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
    branchEndIds.push(otherwiseResult.lastStepId);
    const betweenId = ensurePlaceholderBetween(
      nodes,
      edges,
      otherwiseResult.lastStepId,
      nextOrAddId!,
      `${absolutePath}.steps.${choice.otherwise.steps.length}`,
    );
    branchEndIds.push(betweenId ?? otherwiseResult.lastStepId);
  }

  // Connect branches
  if (!nextOrAddId) {
    for (const endId of branchEndIds) {
      edges.push(createEdge(generateUniqueId("edge"), endId, nextOrAddId!));
    }
    branchEndIds.push(nextOrAddId!);
  }

  return branchEndIds[branchEndIds.length - 1] || stepId;
}
