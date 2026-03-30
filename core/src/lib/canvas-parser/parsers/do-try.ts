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
  const emptyDoCatchBranches: Array<{ id: string; absolutePath: string }> = [];
  const hasTrySteps = (doTry?.steps ?? []).length > 0;

  const betweenId = ensurePlaceholderNext(
    nodes,
    edges,
    stepId,
    `${initialAbsolutePath}.doCatch.${doCatchList.length}`,
    STEP_TYPE.ADD_DO_CATCH,
  );

  // Main try path.
  if (hasTrySteps) {
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
        emptyDoCatchBranches.push({ id: doCatchId, absolutePath });
      }
    }
  }

  // Shared finally path.
  if (doTry?.doFinally) {
    const absolutePath = `${initialAbsolutePath}.doFinally`;
    const doFinallyId = generateUniqueId(`doFinally-${stepId}`);
    const doFinallySteps = doTry.doFinally.steps ?? [];

    nodes.push(createNode(doFinallyId, STEP_TYPE.DO_FINALLY, absolutePath));

    if (!hasTrySteps) {
      ensurePlaceholderBetween(
        nodes,
        edges,
        stepId,
        doFinallyId,
        `${initialAbsolutePath}.steps.0`,
      );
    }

    for (const endId of branchEndIds) {
      if (!hasTrySteps && endId === stepId) {
        continue;
      }

      const emptyDoCatchBranch = emptyDoCatchBranches.find(
        (branch) => branch.id === endId,
      );
      if (emptyDoCatchBranch) {
        ensurePlaceholderBetween(
          nodes,
          edges,
          endId,
          doFinallyId,
          `${emptyDoCatchBranch.absolutePath}.steps.0`,
        );
        continue;
      }

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
      ensurePlaceholderBetween(
        nodes,
        edges,
        doFinallyId,
        nextOrAddId,
        `${absolutePath}.steps.0`,
      );
    } else {
      ensurePlaceholderNext(
        nodes,
        edges,
        doFinallyId,
        `${absolutePath}.steps.0`,
      );
    }

    return betweenId || doFinallyId;
  }

  if (nextOrAddId) {
    if (!hasTrySteps) {
      ensurePlaceholderBetween(
        nodes,
        edges,
        stepId,
        nextOrAddId,
        `${initialAbsolutePath}.steps.0`,
      );
    }

    for (const endId of branchEndIds) {
      if (!hasTrySteps && endId === stepId) {
        continue;
      }

      const emptyDoCatchBranch = emptyDoCatchBranches.find(
        (branch) => branch.id === endId,
      );
      if (emptyDoCatchBranch) {
        ensurePlaceholderBetween(
          nodes,
          edges,
          endId,
          nextOrAddId,
          `${emptyDoCatchBranch.absolutePath}.steps.0`,
        );
        continue;
      }

      ensurePlaceholderBetween(
        nodes,
        edges,
        endId,
        nextOrAddId,
        `${initialAbsolutePath}.steps.${doTry?.steps?.length ?? 0}`,
      );
    }
  } else {
    if (!hasTrySteps) {
      ensurePlaceholderNext(
        nodes,
        edges,
        stepId,
        `${initialAbsolutePath}.steps.0`,
      );
    }

    for (const emptyDoCatchBranch of emptyDoCatchBranches) {
      ensurePlaceholderNext(
        nodes,
        edges,
        emptyDoCatchBranch.id,
        `${emptyDoCatchBranch.absolutePath}.steps.0`,
      );
    }
  }

  return betweenId || stepId;
}
