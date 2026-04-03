import { type Node, type Edge, type Step } from "../../topology-types";
import {
  ensurePlaceholderBetween,
  ensurePlaceholderNext,
} from "../add-placeholders";

export function parseFilterStep(
  step: Step,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextOrAddId: string | null,
  absolutePath: string,
  parseSteps: any,
): string {
  const filterSteps = Array.isArray(step.filter?.steps) ? step.filter.steps : [];
  const endAbsolutePath = `${absolutePath}.steps.${filterSteps.length}`;

  if (filterSteps.length === 0) {
    if (nextOrAddId) {
      ensurePlaceholderBetween(nodes, edges, stepId, nextOrAddId, endAbsolutePath);
      return nextOrAddId;
    }

    return ensurePlaceholderNext(nodes, edges, stepId, endAbsolutePath);
  }

  const filterResult = parseSteps(
    filterSteps,
    nodes,
    edges,
    stepId,
    null,
    absolutePath,
  );

  if (nextOrAddId) {
    ensurePlaceholderBetween(
      nodes,
      edges,
      filterResult.lastStepId,
      nextOrAddId,
      endAbsolutePath,
    );
    return nextOrAddId;
  }

  return ensurePlaceholderNext(
    nodes,
    edges,
    filterResult.lastStepId,
    endAbsolutePath,
  );
}
