import { type Node, type Edge, type Step } from "../../topology-types";
import {
  ensurePlaceholderBetween,
  ensurePlaceholderNext,
} from "../add-placeholders";

export function parseSplitStep(
  step: Step,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextOrAddId: string | null,
  absolutePath: string,
  parseSteps: any,
): string {
  const splitSteps = Array.isArray(step.split?.steps) ? step.split.steps : [];
  const endAbsolutePath = `${absolutePath}.steps.${splitSteps.length}`;

  if (splitSteps.length === 0) {
    if (nextOrAddId) {
      ensurePlaceholderBetween(nodes, edges, stepId, nextOrAddId, endAbsolutePath);
      return nextOrAddId;
    }

    return ensurePlaceholderNext(nodes, edges, stepId, endAbsolutePath);
  }

  const splitResult = parseSteps(
    splitSteps,
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
      splitResult.lastStepId,
      nextOrAddId,
      endAbsolutePath,
    );
    return nextOrAddId;
  }

  return ensurePlaceholderNext(
    nodes,
    edges,
    splitResult.lastStepId,
    endAbsolutePath,
  );
}
