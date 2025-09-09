import {
  type Node,
  type Edge,
  type Step,
  STEP_TYPE,
} from "../../topology-types";
import {
  ensurePlaceholderBetween,
  ensurePlaceholderNext,
} from "../add-placeholders";
import { createNode, createEdge } from "../creation";
import { generateUniqueId } from "../utils";

export function parseDoTryStep(
  step: Step,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextOrAddId: string | null,
  initialAbsolutePath: string,
  parseSteps: any,
): string {
  const branchLastNodeIds: string[] = [];
  const { doTry } = step;

  const betweenId = ensurePlaceholderNext(
    nodes,
    edges,
    stepId,
    `${initialAbsolutePath}.doCatch.${(doTry?.doCatch?.steps ?? []).length}`,
    STEP_TYPE.ADD_DO_CATCH,
  );

  // Process doCatch branch
  if (Array.isArray(doTry?.doCatch)) {
    for (const [i, doCatch] of doTry.doCatch.entries()) {
      const absolutePath = `${initialAbsolutePath}.doCatch.${i}`;
      const doCatchId = generateUniqueId(`doCatch-${stepId}`);
      nodes.push(createNode(doCatchId, STEP_TYPE.DO_CATCH, absolutePath));
      edges.push(createEdge(generateUniqueId("edge"), stepId, doCatchId));

      const doCatchResult = parseSteps(
        doCatch.steps ?? [],
        nodes,
        edges,
        doCatchId,
        nextOrAddId,
        absolutePath,
      );

      ensurePlaceholderBetween(
        nodes,
        edges,
        doCatchResult.lastStepId,
        nextOrAddId!,
        `${absolutePath}.steps.${(doCatch.steps ?? []).length}`,
      );
    }
  }

  // Process doFinally branch
  if (doTry?.doFinally?.steps) {
    const absolutePath = `${initialAbsolutePath}.doFinally`;
    const doFinallyId = generateUniqueId(`doFinally-${stepId}`);

    nodes.push(createNode(doFinallyId, STEP_TYPE.DO_FINALLY, absolutePath));
    edges.push(createEdge(generateUniqueId("edge"), stepId, doFinallyId));

    const doFinallyResult = parseSteps(
      doTry.doFinally.steps ?? [],
      nodes,
      edges,
      doFinallyId,
      nextOrAddId,
      absolutePath,
    );
    ensurePlaceholderBetween(
      nodes,
      edges,
      doFinallyResult.lastStepId,
      nextOrAddId!,
      `${absolutePath}.steps.${doTry.doFinally?.steps.length}`,
    );
  }

  // Process main try branch
  if (doTry?.steps) {
    const absolutePath = initialAbsolutePath;
    edges.push(createEdge(generateUniqueId("edge"), stepId, stepId));

    const doTryResult = parseSteps(
      doTry.steps,
      nodes,
      edges,
      stepId,
      nextOrAddId,
      absolutePath,
    );

    ensurePlaceholderBetween(
      nodes,
      edges,
      doTryResult.lastStepId,
      nextOrAddId!,
      `${absolutePath}.steps.${doTry.steps?.length}`,
    );
  }

  // Connect branch endings to the next step or to a placeholder
  if (nextOrAddId) {
    for (const endId of branchLastNodeIds) {
      edges.push(createEdge(generateUniqueId("edge"), endId, nextOrAddId));
    }
  }

  return betweenId || stepId;
}
