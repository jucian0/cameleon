import type { Edge, Node, Step, StepType } from "../../topology-types";
import { parseChoiceStep } from "./choice";
import { parseDoTryStep } from "./do-try";
import { parseMulticastStep } from "./multicast";
import { parseDefaultSteps } from "./default";
import { BRANCHING_NODE_TYPES, generateUniqueId } from "../utils";
import { createNode } from "../creation";
import { ensurePlaceholderBetween } from "../add-placeholders";
import { parseLoadbalanceStep } from "./loadbalance";

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
  parentNodeId: string,
  nextNodeIdOrPlaceholder: string | null,
  baseAbsolutePath: string,
): parseStepsResult {
  let previousNodeId = parentNodeId;
  let lookaheadNodeIdOrPlaceholder: string | null = null;

  for (const [i, step] of steps.entries()) {
    const nodeType = Object.keys(step)[0] as StepType;
    const currentStepId =
      lookaheadNodeIdOrPlaceholder ||
      generateUniqueId(`${nodeType}-${parentNodeId}`);
    const currentAbsolutePath = `${baseAbsolutePath}.steps.${i}`;

    // Look ahead for next step
    lookaheadNodeIdOrPlaceholder =
      i < steps.length - 1
        ? generateUniqueId(`${Object.keys(steps[i + 1])[0]}-${parentNodeId}`)
        : nextNodeIdOrPlaceholder;

    let lastProcessedStepId = currentStepId;
    if (BRANCHING_NODE_TYPES.has(nodeType)) {
      switch (nodeType) {
        case "choice":
          lastProcessedStepId = parseChoiceStep(
            step,
            currentStepId,
            nodes,
            edges,
            lookaheadNodeIdOrPlaceholder,
            `${currentAbsolutePath}.choice`,
            parseSteps,
          );
          break;
        case "doTry":
          lastProcessedStepId = parseDoTryStep(
            step,
            currentStepId,
            nodes,
            edges,
            lookaheadNodeIdOrPlaceholder,
            `${currentAbsolutePath}.doTry`,
            parseSteps,
          );
          break;
        case "multicast":
          lastProcessedStepId = parseMulticastStep(
            step,
            nodeType,
            currentStepId,
            nodes,
            edges,
            lookaheadNodeIdOrPlaceholder,
            `${currentAbsolutePath}.multicast`,
            parseSteps,
          );
          break;
        case "loadBalance":
          lastProcessedStepId = parseLoadbalanceStep(
            step,
            nodeType,
            currentStepId,
            nodes,
            edges,
            lookaheadNodeIdOrPlaceholder,
            `${currentAbsolutePath}.loadBalance`,
            parseSteps,
          );
          break;
      }
    } else {
      lastProcessedStepId = parseDefaultSteps(
        step,
        nodeType,
        nodes,
        edges,
        currentStepId,
        lastProcessedStepId,
        currentAbsolutePath,
        parseSteps,
      );
    }

    nodes.push(createNode(currentStepId, nodeType, currentAbsolutePath));
    ensurePlaceholderBetween(
      nodes,
      edges,
      previousNodeId,
      currentStepId,
      currentAbsolutePath,
    );
    previousNodeId = lastProcessedStepId;
  }

  return {
    nodes,
    edges,
    lastStepId: previousNodeId,
    nextStepId: lookaheadNodeIdOrPlaceholder,
    absolutePath: baseAbsolutePath,
  };
}
