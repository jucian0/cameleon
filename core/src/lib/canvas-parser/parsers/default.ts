import type { Edge, Step, Node } from "../../topology-types";

export function parseDefaultSteps(
  step: Step,
  nodeType: string,
  nodes: Node[],
  edges: Edge[],
  stepId: string,
  lastStepId: string,
  absolutePath: string,
  parseSteps: any,
): string {
  if (step[nodeType]?.steps) {
    const stepResult = parseSteps(
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
