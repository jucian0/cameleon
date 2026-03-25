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
  const { doTry } = step;
  const doCatchList = Array.isArray(doTry?.doCatch) ? doTry.doCatch : [];
  const branchEndIds: string[] = [];

  const betweenId = ensurePlaceholderNext(
    nodes,
    edges,
    stepId,
    `${initialAbsolutePath}.doCatch.${doCatchList.length}`,
    STEP_TYPE.ADD_DO_CATCH,
  );

  // Main try path.
  if ((doTry?.steps ?? []).length > 0) {
    const doTryResult = parseSteps(
      doTry?.steps ?? [],
      nodes,
      edges,
      stepId,
      null,
      initialAbsolutePath,
    );
    branchEndIds.push(doTryResult.lastStepId);
  } else {
    branchEndIds.push(stepId);
  }

  // Exception paths.
  if (doCatchList.length > 0) {
    for (const [i, doCatch] of doCatchList.entries()) {
      const absolutePath = `${initialAbsolutePath}.doCatch.${i}`;
      const doCatchId = generateUniqueId(`doCatch-${stepId}`);
      nodes.push(createNode(doCatchId, STEP_TYPE.DO_CATCH, absolutePath));
      edges.push(createEdge(generateUniqueId("edge"), stepId, doCatchId));

      const doCatchSteps = doCatch.steps ?? [];
      if (doCatchSteps.length > 0) {
        const doCatchResult = parseSteps(
          doCatchSteps,
          nodes,
          edges,
          doCatchId,
          null,
          absolutePath,
        );
        branchEndIds.push(doCatchResult.lastStepId);
      } else {
        branchEndIds.push(doCatchId);
      }
    }
  }

  // Shared finally path.
  if (doTry?.doFinally) {
    const absolutePath = `${initialAbsolutePath}.doFinally`;
    const doFinallyId = generateUniqueId(`doFinally-${stepId}`);
    const doFinallySteps = doTry.doFinally.steps ?? [];

    nodes.push(createNode(doFinallyId, STEP_TYPE.DO_FINALLY, absolutePath));

    for (const endId of branchEndIds) {
      if (endId !== doFinallyId) {
        edges.push(createEdge(generateUniqueId("edge"), endId, doFinallyId));
      }
    }

    if (doFinallySteps.length > 0) {
      const doFinallyResult = parseSteps(
        doFinallySteps,
        nodes,
        edges,
        doFinallyId,
        nextOrAddId,
        absolutePath,
      );

      if (nextOrAddId) {
        ensurePlaceholderBetween(
          nodes,
          edges,
          doFinallyResult.lastStepId,
          nextOrAddId,
          `${absolutePath}.steps.${doFinallySteps.length}`,
        );
      }
    } else if (nextOrAddId) {
      edges.push(
        createEdge(generateUniqueId("edge"), doFinallyId, nextOrAddId),
      );
    }

    return betweenId || doFinallyId;
  }

  if (nextOrAddId) {
    for (const endId of branchEndIds) {
      ensurePlaceholderBetween(
        nodes,
        edges,
        endId,
        nextOrAddId,
        `${initialAbsolutePath}.steps.${doTry?.steps?.length ?? 0}`,
      );
    }
  }

  return betweenId || stepId;
}
