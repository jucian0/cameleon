import { create } from "zustand";
import {
  applyEdgeChanges,
  applyNodeChanges,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { serializeApiSpec } from "./api-spec";
import { createDefaultApiSpec } from "./templates";
import type { ApiCanvasEdge, ApiCanvasNode, ApiSpec } from "./types";

type ApiStore = {
  apiSpec: ApiSpec;
  setApiSpec: (spec: ApiSpec | ((current: ApiSpec) => ApiSpec)) => void;
  getApiSpecContent: () => string;
  canvas: {
    nodes: ApiCanvasNode[];
    edges: ApiCanvasEdge[];
    setCanvas: (nodes: ApiCanvasNode[], edges: ApiCanvasEdge[]) => void;
    onNodesChange: (nodes: NodeChange<ApiCanvasNode>[]) => void;
    onEdgesChange: (edges: EdgeChange<ApiCanvasEdge>[]) => void;
  };
};

export const INITIAL_API_STATE = createDefaultApiSpec();
export const INITIAL_API_STATE_CONTENT = serializeApiSpec(INITIAL_API_STATE);

export const useApiStore = create<ApiStore>((set, get) => ({
  apiSpec: INITIAL_API_STATE,
  setApiSpec: (spec = INITIAL_API_STATE) => {
    set((state) => ({
      apiSpec: typeof spec === "function" ? spec(state.apiSpec) : spec,
    }));
  },
  getApiSpecContent: () => serializeApiSpec(get().apiSpec),
  canvas: {
    nodes: [],
    edges: [],
    setCanvas: (nodes, edges) => {
      set({
        canvas: { ...get().canvas, nodes, edges },
      });
    },
    onNodesChange: (nodes) => {
      const nextNodes = applyNodeChanges(nodes, get().canvas.nodes);
      set({ canvas: { ...get().canvas, nodes: nextNodes } });
    },
    onEdgesChange: (edges) => {
      const nextEdges = applyEdgeChanges(edges, get().canvas.edges);
      set({ canvas: { ...get().canvas, edges: nextEdges } });
    },
  },
}));
