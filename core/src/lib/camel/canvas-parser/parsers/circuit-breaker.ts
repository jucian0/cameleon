import { type Node, type Edge, type Step } from "../../topology-types";
import {
  ensurePlaceholderBetween,
  ensurePlaceholderNext,
} from "../add-placeholders";
import { createNode, createEdge } from "../creation";
import { generateUniqueId } from "../utils";

export function parseCircuitBreakerStep(
  step: Step,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextOrAddId: string | null,
  absolutePath: string,
  parseSteps: any,
): string {
  const circuitBreakerSteps = Array.isArray(step.circuitBreaker?.steps)
    ? step.circuitBreaker.steps
    : [];
  const fallbackSteps = Array.isArray(step.circuitBreaker?.onFallback?.steps)
    ? step.circuitBreaker.onFallback.steps
    : [];
  const branchEndIds: string[] = [];

  if (circuitBreakerSteps.length > 0) {
    const mainResult = parseSteps(
      circuitBreakerSteps,
      nodes,
      edges,
      stepId,
      null,
      absolutePath,
    );
    branchEndIds.push(mainResult.lastStepId);
  } else {
    branchEndIds.push(stepId);
  }

  if (step.circuitBreaker?.onFallback) {
    const fallbackAbsolutePath = `${absolutePath}.onFallback`;
    const fallbackId = generateUniqueId(`fallback-${stepId}`);
    nodes.push(createNode(fallbackId, "fallback", fallbackAbsolutePath));
    edges.push(createEdge(generateUniqueId("edge"), stepId, fallbackId));

    if (fallbackSteps.length > 0) {
      const fallbackResult = parseSteps(
        fallbackSteps,
        nodes,
        edges,
        fallbackId,
        null,
        fallbackAbsolutePath,
      );
      branchEndIds.push(fallbackResult.lastStepId);
    } else {
      branchEndIds.push(fallbackId);
    }
  }

  if (nextOrAddId) {
    for (const endId of branchEndIds) {
      ensurePlaceholderBetween(
        nodes,
        edges,
        endId,
        nextOrAddId,
        `${absolutePath}.steps.${circuitBreakerSteps.length}`,
      );
    }
    return nextOrAddId;
  }

  return ensurePlaceholderNext(
    nodes,
    edges,
    branchEndIds[branchEndIds.length - 1] ?? stepId,
    `${absolutePath}.steps.${circuitBreakerSteps.length}`,
  );
}
