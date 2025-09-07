/**
 * This file contains the implementation of a topology parser for Camel routes.
 * It is responsible for converting a JSON representation of Camel routes into
 * a topology model consisting of nodes and edges. The topology model is used
 * to represent the structure of the routes visually.
 *
 * Summary of main functions:
 * - `jsonToCanvasBuilder`: Main function that takes a Camel route JSON and converts it into nodes and edges.
 * - `parseSteps`: Processes a list of steps, creating nodes and edges for each step, handling branching nodes.
 * - `createNode` and `createEdge`: Utility functions to create node and edge objects.
 * - `ensurePlaceholderNext`: Generates placeholder nodes for adding new steps.
 * - `ensurePlaceholderBetween`: Ensures there is an "add-between" node between two existing nodes if needed.
 *
 * The parser supports various step types including choice, doTry, multicast, and loadBalance,
 * and can handle nested structures within the routes.
 *
 * Terms used:
 * - Node: Represents a step in the Camel route (e.g., from, to, choice).
 * - Edge: Represents a connection between two nodes.
 * - Step: A single operation or action in a Camel route.
 * - Route: A complete Camel route consisting of multiple steps.
 * - Placeholder Node: A special node used to indicate where new steps can be added.
 * - Add-Between Node: A special node used to indicate where new steps can be added between existing steps.
 * - Absolute Path: A string representing the location of a step within the JSON structure.
 * - Branching Node: A node that can have multiple paths (e.g., choice, doTry).
 * - Non-Branching Node: A node that has a single path (e.g., from, to).
 *
 * Note: This implementation assumes the existence of certain types and helper functions
 * for processing specific step types (e.g., parseChoiceStep, parseDoTryStep).
 */
import {
  STEP_TYPE,
  type Edge,
  type Node,
  type Route,
  type StepType,
} from "../topology-types";

import { generateUniqueId } from "./utils";
import { createEdge, createNode } from "./creation";
import { ensurePlaceholderNext } from "./add-placeholders";
import { type ParsedTopologyModel, parseSteps } from "./parsers/steps";

// ==================== Main Export Function ====================
export function jsonToCanvasBuilder(
  route: Route,
  routeIndex: number,
): ParsedTopologyModel {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let initialAbsolutePath = `data.${routeIndex}.route.from`;
  const placeholderId = generateUniqueId("add");
  const placeholderNode = createNode(
    placeholderId,
    STEP_TYPE.ADD_STEP,
    `${initialAbsolutePath}.steps.${route.route?.from.steps?.length || 0}`,
  );

  const fromId = route.route?.id ? route.route.id : generateUniqueId("route");
  const stepType = (route.route?.from.uri || STEP_TYPE.CAMEL) as StepType;
  // Set initial node (from)
  nodes.push(createNode(fromId, stepType, initialAbsolutePath));

  const routeSteps = route.route?.from.steps || [];

  if (routeSteps) {
    const result = parseSteps(
      routeSteps,
      nodes,
      edges,
      fromId,
      null,
      initialAbsolutePath,
      placeholderId,
    );
    initialAbsolutePath = result.absolutePath || initialAbsolutePath;
    edges.push(
      createEdge(generateUniqueId("edge"), result.lastStepId, placeholderId),
    );
  }

  // Always add a placeholder at the end of the route
  nodes.push(placeholderNode);

  return { nodes, edges };
}
