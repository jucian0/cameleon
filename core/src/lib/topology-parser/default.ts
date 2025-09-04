import type { Edge, Step, Node } from "../topology-types";
import { processSteps } from "./parser";

export function processDefaultSteps(
  step: Step,
  nodeType: string,
  nodes: Node[],
  edges: Edge[],
  stepId: string,
  lastStepId: string,
  absolutePath: string,
): string {
  if (step[nodeType]?.steps) {
    const stepResult = processSteps(
      step[nodeType].steps,
      nodes,
      edges,
      stepId,
      null,
      absolutePath,
    );
    return stepResult.lastStepId;
  }
  return lastStepId;
}
