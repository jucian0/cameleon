import { type Node, type Edge, type Step } from "../../topology-types";
import {
  ensurePlaceholderBetween,
  ensurePlaceholderNext,
} from "../add-placeholders";

export function parseLoopStep(
  step: Step,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextOrAddId: string | null,
  absolutePath: string,
  parseSteps: any,
): string {
  const loopSteps = Array.isArray(step.loop?.steps) ? step.loop.steps : [];
  const endAbsolutePath = `${absolutePath}.steps.${loopSteps.length}`;

  if (loopSteps.length === 0) {
    if (nextOrAddId) {
      ensurePlaceholderBetween(nodes, edges, stepId, nextOrAddId, endAbsolutePath);
      return nextOrAddId;
    }

    return ensurePlaceholderNext(nodes, edges, stepId, endAbsolutePath);
  }

  const loopResult = parseSteps(
    loopSteps,
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
      loopResult.lastStepId,
      nextOrAddId,
      endAbsolutePath,
    );
    return nextOrAddId;
  }

  return ensurePlaceholderNext(
    nodes,
    edges,
    loopResult.lastStepId,
    endAbsolutePath,
  );
}
