import {
  type Node,
  type Edge,
  type Step,
  STEP_TYPE,
} from "../../topology-types";
import {
  ensurePlaceholderNext,
  ensurePlaceholderBetween,
} from "../add-placeholders";
import { createNode, createEdge } from "../creation";
import { generateUniqueId } from "../utils";

export function parseChoiceStep(
  step: Step,
  stepId: string,
  nodes: Node[],
  edges: Edge[],
  nextOrAddId: string | null,
  initialAbsolutePath: string,
  parseSteps: any,
): string {
  const { choice } = step;
  const whenBranches = Array.isArray(choice?.when) ? choice.when : [];
  const addWhenId = ensurePlaceholderNext(
    nodes,
    edges,
    stepId,
    `${initialAbsolutePath}.when.${whenBranches.length}`,
    STEP_TYPE.ADD_WHEN,
  );
  const joinTargetId = nextOrAddId;
  const emptyWhenBranches: Array<{ id: string; absolutePath: string }> = [];
  let emptyOtherwiseBranch: { id: string; absolutePath: string } | null = null;

  for (const [i, when] of whenBranches.entries()) {
    const absolutePath = `${initialAbsolutePath}.when.${i}`;
    const whenId = generateUniqueId(`when-${stepId}`);
    const whenSteps = when?.steps ?? [];

    nodes.push(createNode(whenId, STEP_TYPE.WHEN, absolutePath));
    edges.push(createEdge(generateUniqueId("edge"), stepId, whenId));

    if (whenSteps.length > 0) {
      const whenResult = parseSteps(
        whenSteps,
        nodes,
        edges,
        whenId,
        joinTargetId,
        absolutePath,
      );

      if (joinTargetId && whenResult.lastStepId !== joinTargetId) {
        ensurePlaceholderBetween(
          nodes,
          edges,
          whenResult.lastStepId,
          joinTargetId,
          `${absolutePath}.steps.${whenSteps.length}`,
        );
      }
    } else {
      emptyWhenBranches.push({ id: whenId, absolutePath });
      if (joinTargetId) {
        ensurePlaceholderBetween(
          nodes,
          edges,
          whenId,
          joinTargetId,
          `${absolutePath}.steps.0`,
        );
      } else {
        ensurePlaceholderNext(nodes, edges, whenId, `${absolutePath}.steps.0`);
      }
    }
  }

  if (choice?.otherwise) {
    const absolutePath = `${initialAbsolutePath}.otherwise`;
    const otherwiseId = generateUniqueId(`otherwise-${stepId}`);
    const otherwiseSteps = choice.otherwise.steps ?? [];

    nodes.push(createNode(otherwiseId, STEP_TYPE.OTHERWISE, absolutePath));
    edges.push(createEdge(generateUniqueId("edge"), stepId, otherwiseId));

    if (otherwiseSteps.length > 0) {
      const otherwiseResult = parseSteps(
        otherwiseSteps,
        nodes,
        edges,
        otherwiseId,
        joinTargetId,
        absolutePath,
      );

      if (joinTargetId && otherwiseResult.lastStepId !== joinTargetId) {
        ensurePlaceholderBetween(
          nodes,
          edges,
          otherwiseResult.lastStepId,
          joinTargetId,
          `${absolutePath}.steps.${otherwiseSteps.length}`,
        );
      }
    } else {
      emptyOtherwiseBranch = { id: otherwiseId, absolutePath };
      if (joinTargetId) {
        ensurePlaceholderBetween(
          nodes,
          edges,
          otherwiseId,
          joinTargetId,
          `${absolutePath}.steps.0`,
        );
      } else {
        ensurePlaceholderNext(
          nodes,
          edges,
          otherwiseId,
          `${absolutePath}.steps.0`,
        );
      }
    }
  }

  if (joinTargetId) {
    if (whenBranches.length === 0 && !choice?.otherwise) {
      edges.push(createEdge(generateUniqueId("edge"), stepId, joinTargetId));
    }
    return joinTargetId;
  }

  if (whenBranches.length > 0 || choice?.otherwise) {
    return (
      emptyOtherwiseBranch?.id ??
      emptyWhenBranches[emptyWhenBranches.length - 1]?.id ??
      addWhenId ??
      stepId
    );
  }

  return addWhenId || stepId;
}
