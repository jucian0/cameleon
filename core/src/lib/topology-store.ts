/**
 * Topology Store
 *
 * This store manages the state of the topology editor, including the Camel configuration,
 * the current Camel route, and the canvas (nodes and edges).
 *
 * Key Points:
 * - `camelConfig` holds the data for all routes and comments.
 * - `currentCamelRouteId` identifies the currently selected Camel route.
 * - The `canvas` state (nodes and edges) reflects the current Camel route configuration.
 *
 * Important:
 * - Do not modify the `canvas` (nodes and edges) directly.
 *   Any changes to the canvas should reflect in the `currentCamelRoute` configuration.
 * - To update the current Camel route, use `updateCamelRoute`.
 * - To update the entire Camel configuration, use `setCamelConfig`.
 * - The nodes and edges are automatically laid out using Dagre, so their positions are set automatically.
 */
import { create } from "zustand";
import {
  applyEdgeChanges,
  applyNodeChanges,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { jsonToCanvasBuilder } from "./canvas-parser/parser";
import { jsonToYaml } from "./yaml-json";
import type { CamelConfig, Edge, Route, Node } from "./topology-types";
import { generateStepId } from "./topology-operations/topology-operations";

type TopologyStore = {
  camelConfig: CamelConfig;
  setCamelConfig: (json: CamelConfig) => void;
  // updateCamelRoute: (json: any, routeId: string) => void;
  getCamelConfigYaml: () => string;
  canvas: {
    nodes: Node[];
    edges: Edge[];
    setCanvas: (nodes: Node[], edges: Edge[]) => void;
    onNodesChange: (nodes: NodeChange<Node>[]) => void;
    onEdgesChange: (edges: EdgeChange<Edge>[]) => void;
  };
};

export const INITIAL_STATE = {
  data: [
    {
      route: {
        id: generateStepId("route"),
        nodePrefixId: "route1-",
        from: { uri: "init", id: "1", steps: [] },
      },
    },
  ],
  comments: {},
};

export const INITIAL_STATE_YAML = jsonToYaml(INITIAL_STATE);

export const useTopologyStore = create<TopologyStore>((set, get) => ({
  camelConfig: INITIAL_STATE,
  setCamelConfig: (json = INITIAL_STATE) => {
    set({ camelConfig: json });
  },

  getCamelConfigYaml: () => {
    const state = get();
    return jsonToYaml(state.camelConfig);
  },

  /**
   * Canvas state
   * This state is used to manage canvas's nodes and edges.
   * Important: Do not modify the nodes and edges directly, it will reflect in the currentCamelRoute state automatically.
   * Always change the Camel route state using `updateCamelRoute`.
   * The nodes and edges are layouted using Dagre, so the position of the nodes is set automatically.
   */
  canvas: {
    nodes: [],
    edges: [],
    setCanvas: (nodes, edges) => {
      set({
        canvas: { ...get().canvas, nodes, edges },
      });
    },
    onNodesChange: (nodes) => {
      const newNodes = applyNodeChanges(nodes, get().canvas.nodes);
      set({ canvas: { ...get().canvas, nodes: newNodes } });
    },
    onEdgesChange: (edges) => {
      const newEdges = applyEdgeChanges(edges, get().canvas.edges);
      set({ canvas: { ...get().canvas, edges: newEdges } });
    },
  },
}));
