import { generateUniqueId } from "./parser";
import { createEdge, createNode } from "./parser";
import { processSteps } from "./parser";
import { ensureAddBetween } from "./parser";
import { generatePlaceholderNodesAndEdges } from "./parser";
import type { Node, Edge, Step } from "../topology-types";
import { CAMEL_NODE_TYPE, ADD_NODE_TYPE } from "./parser";

export function processDoTryStep(
  step: Step,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextStepId: string | null,
  initialAbsolutePath: string,
): string {
  const branchEndIds: string[] = [];
  const { doTry } = step;

  // Process doCatch branch
  if (Array.isArray(doTry?.doCatch)) {
    for (const [i, doCatch] of doTry.doCatch.entries()) {
      const absolutePath = `${initialAbsolutePath}.doCatch.${i}`;
      const doCatchId = generateUniqueId(`doCatch-${stepId}-${i}`);

      nodes.push(
        createNode(doCatchId, CAMEL_NODE_TYPE, "doCatch", absolutePath),
      );
      edges.push(createEdge(generateUniqueId("edge"), stepId, doCatchId));

      const doCatchResult = processSteps(
        doCatch.steps ?? [],
        nodes,
        edges,
        doCatchId,
        null,
        absolutePath,
      );
      branchEndIds.push(doCatchResult.lastStepId);
    }
  }

  // Process doFinally branch
  if (doTry?.doFinally) {
    const absolutePath = `${initialAbsolutePath}.doFinally`;
    const doFinallyId = generateUniqueId(`doFinally-${stepId}`);

    nodes.push(
      createNode(doFinallyId, CAMEL_NODE_TYPE, "doFinally", absolutePath),
    );
    edges.push(createEdge(generateUniqueId("edge"), stepId, doFinallyId));

    const doFinallyResult = processSteps(
      doTry.doFinally.steps ?? [],
      nodes,
      edges,
      doFinallyId,
      null,
      absolutePath,
    );
    branchEndIds.push(doFinallyResult.lastStepId);
  }

  // Process main try branch
  if (doTry?.steps) {
    const absolutePath = initialAbsolutePath;
    edges.push(createEdge(generateUniqueId("edge"), stepId, stepId));

    const doTryResult = processSteps(
      doTry.steps,
      nodes,
      edges,
      stepId,
      null,
      absolutePath,
    );
    branchEndIds.push(doTryResult.lastStepId);
  }

  // Always add placeholder for doCatch
  const placeholderResult = generatePlaceholderNodesAndEdges(
    nodes,
    edges,
    stepId,
    initialAbsolutePath,
    "Add doCatch",
  );
  branchEndIds.push(placeholderResult);

  // Connect branches to next step if it exists
  if (nextStepId && branchEndIds.length > 0) {
    for (const endId of branchEndIds) {
      edges.push(createEdge(generateUniqueId("edge"), endId, nextStepId));
      ensureAddBetween(nodes, edges, endId, nextStepId, initialAbsolutePath);
    }
  } else {
    // Add placeholder to connect all branches to the next step
    // need to remove last part of the absolutePath to ensure the placeholder give the correct path
    const path = initialAbsolutePath.replace(/\.doTry.*$/, "");
    const placeholderId = generateUniqueId("add");
    nodes.push(
      createNode(placeholderId, ADD_NODE_TYPE, "add-step", path, "Add"),
    );
    for (const endId of branchEndIds) {
      edges.push(createEdge(generateUniqueId("edge"), endId, placeholderId));
    }
    branchEndIds.push(placeholderId);
  }

  return branchEndIds[branchEndIds.length - 1] || stepId;
}
