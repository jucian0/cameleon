declare module "dagre" {
  type GraphConfig = {
    rankdir?: "LR" | "TB" | "RL" | "BT";
    nodesep?: number;
    ranksep?: number;
    marginx?: number;
    marginy?: number;
  };

  type NodeConfig = {
    width: number;
    height: number;
  };

  type PositionedNode = {
    x: number;
    y: number;
  };

  class Graph {
    setGraph(config: GraphConfig): void;
    setDefaultEdgeLabel(factory: () => Record<string, unknown>): void;
    setNode(id: string, config: NodeConfig): void;
    setEdge(source: string, target: string): void;
    node(id: string): PositionedNode;
  }

  export const graphlib: {
    Graph: new () => Graph;
  };

  export function layout(graph: Graph): void;
}
