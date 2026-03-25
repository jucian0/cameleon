import { type Node, type Edge, type Step } from "../../topology-types";
import {
  ensurePlaceholderBetween,
  ensurePlaceholderNext,
} from "../add-placeholders";

export function parseSagaStep(
  step: Step,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextOrAddId: string | null,
  absolutePath: string,
  parseSteps: any,
): string {
  const sagaSteps = Array.isArray(step.saga?.steps) ? step.saga.steps : [];
  const endAbsolutePath = `${absolutePath}.steps.${sagaSteps.length}`;

  if (sagaSteps.length === 0) {
    if (nextOrAddId) {
      ensurePlaceholderBetween(nodes, edges, stepId, nextOrAddId, endAbsolutePath);
      return nextOrAddId;
    }

    return ensurePlaceholderNext(nodes, edges, stepId, endAbsolutePath);
  }

  const sagaResult = parseSteps(
    sagaSteps,
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
      sagaResult.lastStepId,
      nextOrAddId,
      endAbsolutePath,
    );
    return nextOrAddId;
  }

  return ensurePlaceholderNext(
    nodes,
    edges,
    sagaResult.lastStepId,
    endAbsolutePath,
  );
}
