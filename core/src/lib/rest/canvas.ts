import { MarkerType, Position } from "@xyflow/react";
// @ts-ignore dagre is provided by the workspace and declared in core/package.json for runtime resolution
import dagre from "dagre";
import type {
  ApiCanvasDirection,
  ApiCanvasEdge,
  ApiCanvasNode,
  ApiCanvasSelection,
  ApiSpec,
} from "./types";

function edge(source: string, target: string): ApiCanvasEdge {
  return {
    id: `${source}->${target}`,
    source,
    target,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "hsl(181, 70%, 48%)",
    },
    style: {
      stroke: "hsl(181, 70%, 48%)",
      strokeWidth: 1.5,
    },
  };
}

function layoutGraph(
  nodes: ApiCanvasNode[],
  edges: ApiCanvasEdge[],
  direction: ApiCanvasDirection,
) {
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({
    rankdir: direction,
    nodesep: 48,
    ranksep: 80,
    marginx: 24,
    marginy: 24,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    graph.setNode(node.id, { width: 260, height: 100 });
  }
  for (const currentEdge of edges) {
    graph.setEdge(currentEdge.source, currentEdge.target);
  }
  dagre.layout(graph);

  return nodes.map((node) => {
    const position = graph.node(node.id);
    return {
      ...node,
      position: {
        x: position.x - 130,
        y: position.y - 50,
      },
    };
  });
}

export function buildApiCanvas(
  spec: ApiSpec,
  selected: ApiCanvasSelection | null,
  direction: ApiCanvasDirection,
) {
  const targetPosition = direction === "TB" ? Position.Top : Position.Left;
  const sourcePosition = direction === "TB" ? Position.Bottom : Position.Right;

  const nodes: ApiCanvasNode[] = [
    {
      id: "api",
      type: "studio",
      position: { x: 0, y: 0 },
      targetPosition,
      sourcePosition,
      data: {
        kind: "api",
        title: spec.info.title || "Untitled API",
        subtitle: `${spec.info.version || "1.0.0"}${spec.servers[0]?.url ? ` · ${spec.servers[0].url}` : ""}`,
        meta: "Root",
        isSelected: selected?.kind === "api",
      },
    },
  ];

  const edges: ApiCanvasEdge[] = [];

  spec.resources.forEach((resource) => {
    const resourceNodeId = `resource:${resource.id}`;
    nodes.push({
      id: resourceNodeId,
      type: "studio",
      position: { x: 0, y: 0 },
      targetPosition,
      sourcePosition,
      data: {
        kind: "resource",
        title: resource.path,
        subtitle: resource.summary || "No resource summary yet.",
        meta: `${resource.operations.length} ops`,
        isSelected:
          selected?.kind === "resource" && selected.resourceId === resource.id,
      },
    });
    edges.push(edge("api", resourceNodeId));

    resource.operations.forEach((operation) => {
      const operationNodeId = `operation:${resource.id}:${operation.id}`;
      nodes.push({
        id: operationNodeId,
        type: "studio",
        position: { x: 0, y: 0 },
        targetPosition,
        sourcePosition,
        data: {
          kind: "operation",
          title:
            operation.summary ||
            `${operation.method.toUpperCase()} ${resource.path}`,
          subtitle:
            operation.description ||
            `${operation.parameters.length} params · ${operation.responses.length} responses`,
          meta: operation.method.toUpperCase(),
          method: operation.method,
          isSelected:
            selected?.kind === "operation" &&
            selected.resourceId === resource.id &&
            selected.operationId === operation.id,
        },
      });
      edges.push(edge(resourceNodeId, operationNodeId));

      if (operation.requestBody) {
        const requestNodeId = `request:${resource.id}:${operation.id}`;
        nodes.push({
          id: requestNodeId,
          type: "studio",
          position: { x: 0, y: 0 },
          targetPosition,
          sourcePosition,
          data: {
            kind: "contract",
            title: "Request body",
            subtitle:
              operation.requestBody.description ||
              operation.requestBody.contentType,
            meta: operation.requestBody.required ? "required" : "optional",
          },
        });
        edges.push(edge(operationNodeId, requestNodeId));
      }

      const firstResponse = operation.responses[0];
      if (firstResponse) {
        const responseNodeId = `response:${resource.id}:${operation.id}`;
        nodes.push({
          id: responseNodeId,
          type: "studio",
          position: { x: 0, y: 0 },
          targetPosition,
          sourcePosition,
          data: {
            kind: "contract",
            title: `${firstResponse.statusCode} response`,
            subtitle: firstResponse.description || "Response contract",
          },
        });
        edges.push(edge(operationNodeId, responseNodeId));
      }

      if (operation.workflowId) {
        const workflowNodeId = `workflow:${resource.id}:${operation.id}`;
        nodes.push({
          id: workflowNodeId,
          type: "studio",
          position: { x: 0, y: 0 },
          targetPosition,
          sourcePosition,
          data: {
            kind: "workflow",
            title: operation.workflowId,
            subtitle: "Linked Camel workflow",
          },
        });
        edges.push(edge(operationNodeId, workflowNodeId));
      }
    });
  });

  const incomingTargets = new Set(
    edges.map((currentEdge) => currentEdge.target),
  );
  const outgoingSources = new Set(
    edges.map((currentEdge) => currentEdge.source),
  );

  return {
    nodes: layoutGraph(
      nodes.map((node) => ({
        ...node,
        targetPosition: incomingTargets.has(node.id)
          ? targetPosition
          : undefined,
        sourcePosition: outgoingSources.has(node.id)
          ? sourcePosition
          : undefined,
      })),
      edges,
      direction,
    ),
    edges,
  };
}
