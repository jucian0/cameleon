import type { Edge, Node, Step, StepType } from "../../topology-types";
import { parseChoiceStep } from "./choice";
import { parseDoTryStep } from "./do-try";
import { parseMulticastOrLoadBalanceStep } from "./multicast-load-balance";
import { parseDefaultSteps } from "./default";
import { BRANCHING_NODE_TYPES, generateUniqueId } from "../utils";
import { createNode } from "../creation";
import { ensurePlaceholderBetween } from "../add-placeholders";

// ==================== Types ====================
export type parseStepsResult = {
  nodes: Node[];
  edges: Edge[];
  lastStepId: string;
  nextStepId: string | null;
  absolutePath: string;
};

export type ParsedTopologyModel = {
  nodes: Node[];
  edges: Edge[];
};

/**
 * Process a list of steps, creating nodes and edges for each step.
 * Handles branching nodes (choice, doTry, multicast, loadBalance) and
 */
export function parseSteps(
  steps: Step[],
  nodes: Node[] = [],
  edges: Edge[] = [],
  parentId: string,
  nextStepId: string | null = null,
  initialAbsolutePath: string,
  addNodeId: string,
): parseStepsResult {
  let previousStepId = parentId;
  let currentNextStepId: string | null = nextStepId;

  steps.forEach((step, i) => {
    const nodeType = Object.keys(step)[0] as StepType;
    const stepId =
      currentNextStepId || generateUniqueId(`${nodeType}-${parentId}`);
    const absolutePath = `${initialAbsolutePath}.steps.${i}`;

    // Determine next step ID
    currentNextStepId =
      i < steps.length - 1
        ? generateUniqueId(`${Object.keys(steps[i + 1])[0]}-${parentId}`)
        : null;

    // Process the step based on its type
    let lastStepId = stepId;
    if (BRANCHING_NODE_TYPES.has(nodeType)) {
      switch (nodeType) {
        case "choice":
          lastStepId = parseChoiceStep(
            step,
            stepId,
            nodes,
            edges,
            currentNextStepId,
            `${absolutePath}.choice`,
            parseSteps,
            addNodeId,
          );
          break;
        case "doTry":
          lastStepId = parseDoTryStep(
            step,
            stepId,
            nodes,
            edges,
            currentNextStepId,
            absolutePath,
            parseSteps,
          );
          break;
        case "multicast":
        case "loadBalance":
          lastStepId = parseMulticastOrLoadBalanceStep(
            step,
            nodeType,
            stepId,
            nodes,
            edges,
            currentNextStepId,
            absolutePath,
            parseSteps,
          );
          break;
      }
    } else {
      lastStepId = parseDefaultSteps(
        step,
        nodeType,
        nodes,
        edges,
        stepId,
        lastStepId,
        absolutePath,
        parseSteps,
      );
    }

    nodes.push(createNode(stepId, nodeType, absolutePath));
    ensurePlaceholderBetween(
      nodes,
      edges,
      previousStepId,
      stepId,
      absolutePath,
    );
    previousStepId = lastStepId;
  });

  return {
    nodes,
    edges,
    lastStepId: previousStepId,
    nextStepId: currentNextStepId,
    absolutePath: initialAbsolutePath,
  };
}
