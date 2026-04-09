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
    nodesep: 72,
    ranksep: 112,
    marginx: 32,
    marginy: 32,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    const dimensions =
      node.data.kind === "contract" ||
      node.data.kind === "workflow" ||
      node.data.kind === "security"
        ? { width: 210, height: 88 }
        : node.data.kind === "api"
          ? { width: 280, height: 96 }
          : { width: 250, height: 96 };
    graph.setNode(node.id, dimensions);
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
        meta:
          spec.servers.length > 1
            ? `${spec.servers.length} servers`
            : spec.tags.length
              ? `${spec.tags.length} tags`
              : "Root",
        flags: [
          ...(spec.servers.length > 1 ? [`${spec.servers.length} servers`] : []),
          ...spec.tags.slice(0, 2).map((tag) => tag.name),
        ],
        isSelected: selected?.kind === "api",
      },
    },
  ];

  const edges: ApiCanvasEdge[] = [];
  const schemaNodeIds = new Set<string>();

  function ensureSchemaNode(schemaId: string) {
    const schema = spec.schemas.find(
      (currentSchema) => currentSchema.id === schemaId,
    );
    if (!schema) return null;

    const schemaNodeId = `schema:${schema.id}`;
    if (!schemaNodeIds.has(schemaNodeId)) {
      schemaNodeIds.add(schemaNodeId);
      nodes.push({
        id: schemaNodeId,
        type: "studio",
        position: { x: 0, y: 0 },
        targetPosition,
        sourcePosition,
        data: {
          kind: "schema",
          title: schema.name,
          subtitle: schema.description || "Reusable schema",
          meta: "Schema",
          isSelected:
            selected?.kind === "schema" && selected.schemaId === schema.id,
        },
      });
    }

    return schemaNodeId;
  }

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
          subtitle: `${operation.parameters.length} params · ${operation.responses.length} responses`,
          meta: operation.method.toUpperCase(),
          method: operation.method,
          flags: [
            ...(operation.deprecated ? ["Deprecated"] : []),
            ...operation.tags.slice(0, 2),
          ],
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

        if (operation.requestBody.schemaId) {
          const schemaNodeId = ensureSchemaNode(operation.requestBody.schemaId);
          if (schemaNodeId) {
            edges.push(edge(requestNodeId, schemaNodeId));
          }
        }
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

        if (firstResponse.schemaId) {
          const schemaNodeId = ensureSchemaNode(firstResponse.schemaId);
          if (schemaNodeId) {
            edges.push(edge(responseNodeId, schemaNodeId));
          }
        }
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

      if (operation.security.length) {
        const securityNodeId = `security:${resource.id}:${operation.id}`;
        nodes.push({
          id: securityNodeId,
          type: "studio",
          position: { x: 0, y: 0 },
          targetPosition,
          sourcePosition,
          data: {
            kind: "security",
            title:
              operation.security.length === 1
                ? operation.security[0].schemeName
                : `${operation.security.length} security rules`,
            subtitle:
              operation.security.length === 1 &&
              operation.security[0].scopes.length
                ? operation.security[0].scopes.join(", ")
                : "Operation security",
            meta: "Security",
          },
        });
        edges.push(edge(operationNodeId, securityNodeId));
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
