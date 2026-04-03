import type { Edge, Step, Node, StepType } from "../../topology-types";

export function parseDefaultSteps(
  step: Step,
  nodeType: StepType,
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
