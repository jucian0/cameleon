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
 * - To update the current Camel route, use `setCurrentCamelRoute`.
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
  currentCamelRouteId: string;
  setCurrentCamelRouteId: (routeId: string) => void;
  setCamelConfig: (json: any) => void;
  setCurrentCamelRoute: (json: any) => void;
  getCurrentCamelRoute: () => Route | undefined;
  getCamelConfigYaml: () => any;
  canvas: {
    direction: "LR" | "TB";
    nodes: Node[];
    edges: Edge[];
    onNodesChange: (nodes: NodeChange<Node>[]) => void;
    onEdgesChange: (edges: EdgeChange<Edge>[]) => void;
    setDirection: (direction: "LR" | "TB") => void;
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
  currentCamelRouteId: "",

  setCurrentCamelRouteId: (routeId) => {
    const { nodes, edges } = jsonToTopologyBuilder(
      get().camelConfig.data,
      routeId,
    );
    set({
      canvas: { ...get().canvas, nodes, edges },
      currentCamelRouteId: routeId,
    });
  },
  setCamelConfig: (json) => {
    set({ camelConfig: json });
    const { nodes, edges } = jsonToTopologyBuilder(
      json.data,
      get().currentCamelRouteId,
    );
    set({ canvas: { ...get().canvas, nodes, edges } });
  },
  setCurrentCamelRoute: (json) => {
    const state = get();
    const updatedJson = {
      ...state.camelConfig,
      data: state.camelConfig.data
        ? state.camelConfig.data.map((route) => {
            if (route.route?.id === state.currentCamelRouteId) {
              return {
                ...route,
                ...json,
              };
            }
            return route;
          })
        : [json],
    };
    const { nodes, edges } = jsonToTopologyBuilder(
      updatedJson.data,
      state.currentCamelRouteId,
    );
    set({ canvas: { ...get().canvas, nodes, edges } });
    set({ camelConfig: updatedJson });
  },
  getCurrentCamelRoute: () => {
    return get().camelConfig.data?.find(
      (route) => route.route?.id === get().currentCamelRouteId,
    );
  },
  getCamelConfigYaml: () => {
    const state = get();
    return jsonToYaml(state.camelConfig);
  },

  /**
   * Canvas state
   * This state is used to manage canvas's nodes and edges.
   * Important: Do not modify the nodes and edges directly, it will reflect in the currentCamelRoute state automatically.
   * Always change the Camel route state using `setCurrentCamelRoute`.
   * The nodes and edges are layouted using Dagre, so the position of the nodes is set automatically.
   */
  canvas: {
    nodes: [],
    edges: [],
    direction: "TB",
    onNodesChange: (nodes) => {
      const newNodes = applyNodeChanges(nodes, get().canvas.nodes);
      set({ canvas: { ...get().canvas, nodes: newNodes } });
    },
    onEdgesChange: (edges) => {
      const newEdges = applyEdgeChanges(edges, get().canvas.edges);
      set({ canvas: { ...get().canvas, edges: newEdges } });
    },
    setDirection: (direction) => {
      set({ canvas: { ...get().canvas, direction } });
    },
  },
}));
