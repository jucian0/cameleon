import { type Node, type Edge, type Step } from "../../topology-types";
import {
  ensurePlaceholderBetween,
  ensurePlaceholderNext,
} from "../add-placeholders";

export function parseAggregateStep(
  step: Step,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextOrAddId: string | null,
  absolutePath: string,
  parseSteps: any,
): string {
  const aggregateSteps = Array.isArray(step.aggregate?.steps)
    ? step.aggregate.steps
    : [];
  const endAbsolutePath = `${absolutePath}.steps.${aggregateSteps.length}`;

  if (aggregateSteps.length === 0) {
    if (nextOrAddId) {
      ensurePlaceholderBetween(nodes, edges, stepId, nextOrAddId, endAbsolutePath);
      return nextOrAddId;
    }

    return ensurePlaceholderNext(nodes, edges, stepId, endAbsolutePath);
  }

  const aggregateResult = parseSteps(
    aggregateSteps,
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
      aggregateResult.lastStepId,
      nextOrAddId,
      endAbsolutePath,
    );
    return nextOrAddId;
  }

  return ensurePlaceholderNext(
    nodes,
    edges,
    aggregateResult.lastStepId,
    endAbsolutePath,
  );
}
