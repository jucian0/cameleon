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
import { jsonToTopologyBuilder } from "./topology-parser";
import { jsonToYaml } from "./yaml-json";
import type { CamelConfig, Edge, Route, Node } from "./topology-types";

type TopologyStore = {
  camelConfig: CamelConfig;
  setCamelRoute: (routeId: string) => void;
  setCamelConfig: (json: any) => void;
  updateCamelRoute: (json: any, routeId: string) => void;
  getCamelConfigYaml: () => any;
  canvas: {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: (nodes: NodeChange<Node>[]) => void;
    onEdgesChange: (edges: EdgeChange<Edge>[]) => void;
  };
};

const INITIAL_STATE = {
  data: [
    {
      route: {
        id: "route1",
        nodePrefixId: "route1-",
        from: { uri: "timer:foo", id: "1" },
      },
    },
  ],
  comments: {},
};

export const useTopologyStore = create<TopologyStore>((set, get) => ({
  camelConfig: INITIAL_STATE,

  setCamelRoute: (routeId) => {
    const currentRoute = get().camelConfig.data.find(
      (route) => route.route?.id === routeId,
    );
    const { nodes, edges } = jsonToTopologyBuilder(currentRoute ?? {});
    set({
      canvas: { ...get().canvas, nodes, edges },
    });
  },

  setCamelConfig: (json) => {
    set({ camelConfig: json });
    const parsedCanvas = { nodes: [], edges: [] } as any;
    for (const route of json.data) {
      if (route.route) {
        const { nodes, edges } = jsonToTopologyBuilder(route);
        console.log("Processing route:", nodes, edges);
        parsedCanvas.nodes.push(...nodes);
        parsedCanvas.edges.push(...edges);
      }
    }
    set({ canvas: { ...get().canvas, ...parsedCanvas } });
  },

  updateCamelRoute: (json, routeId) => {
    const state = get();
    const updatedJson = {
      ...state.camelConfig,
      data: state.camelConfig.data
        ? state.camelConfig.data.map((route) => {
            if (route.route?.id === routeId) {
              return {
                ...route,
                ...json,
              };
            }
            return route;
          })
        : [json],
    };
    // set({ canvas: { ...get().canvas, nodes, edges } });
    set({ camelConfig: updatedJson });
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
