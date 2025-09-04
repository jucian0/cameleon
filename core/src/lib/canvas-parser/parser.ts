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
import type { Edge, Node, Route, StepType } from "../topology-types";

import { CAMEL_NODE_TYPE, generateUniqueId } from "./utils";
import { createNode } from "./creation";
import { ensurePlaceholderNext } from "./add-placeholders";
import { ParsedTopologyModel, parseSteps } from "./parsers/steps";

// ==================== Main Export Function ====================
export function jsonToCanvasBuilder(
  route: Route,
  routeIndex: number,
): ParsedTopologyModel {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let lastNodeId: string | null = null;
  let initialAbsolutePath = `data.${routeIndex}.route.from`;

  if (!route) {
    ensurePlaceholderNext(
      nodes,
      edges,
      "route.from",
      initialAbsolutePath,
      "Add route",
    );
    return { nodes, edges };
  }

  const fromId = route.route?.id ? route.route.id : generateUniqueId("route");
  nodes.push(
    createNode(
      fromId,
      CAMEL_NODE_TYPE,
      route.route?.from.uri as StepType,
      "route.from",
    ),
  );
  const routeSteps = route.route?.from.steps || [];

  if (routeSteps) {
    const result = parseSteps(
      routeSteps,
      nodes,
      edges,
      fromId,
      null,
      initialAbsolutePath,
    );
    lastNodeId = result.lastStepId;
    initialAbsolutePath = result.absolutePath || initialAbsolutePath;

    // Add placeholder if needed
    if (lastNodeId && !lastNodeId.includes("add")) {
      ensurePlaceholderNext(
        nodes,
        edges,
        lastNodeId,
        `${initialAbsolutePath}.steps.${routeSteps.length}`,
      );
    }
  }
  return { nodes, edges };
}
