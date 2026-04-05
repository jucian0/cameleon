import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { Badge } from "@/components/ui/badge";
import { Link } from "app/components/ui/link";
import { buttonStyles } from "app/components/ui/button";
import {
  Boxes,
  Database,
  FolderTree,
  Route,
  Server,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import React from "react";

type PreviewNodeData = {
  title: string;
  subtitle?: string;
  meta?: string;
  kind:
    | "api"
    | "resource"
    | "operation"
    | "contract"
    | "workflow"
    | "security";
};

function ApiPreviewNode({ data }: NodeProps<Node<PreviewNodeData>>) {
  const kindStyles: Record<
    PreviewNodeData["kind"],
    {
      icon: React.ComponentType<{ className?: string }>;
      badge: string;
      badgeIntent: "secondary" | "info" | "warning" | "outline";
    }
  > = {
    api: { icon: Server, badge: "API", badgeIntent: "secondary" },
    resource: { icon: FolderTree, badge: "Resource", badgeIntent: "info" },
    operation: { icon: Route, badge: "Operation", badgeIntent: "secondary" },
    contract: { icon: Database, badge: "Contract", badgeIntent: "outline" },
    workflow: { icon: Workflow, badge: "Workflow", badgeIntent: "warning" },
    security: { icon: ShieldCheck, badge: "Security", badgeIntent: "outline" },
  };

  const style = kindStyles[data.kind];
  const Icon = style.icon;

  return (
    <div className="min-w-[220px] max-w-[260px] rounded-xl border border-border/60 bg-gradient-card p-3 shadow-card">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-0 !bg-primary"
      />
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/60 bg-secondary/40">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge intent={style.badgeIntent}>{style.badge}</Badge>
            {data.meta ? (
              <span className="truncate text-xs text-muted-fg">{data.meta}</span>
            ) : null}
          </div>
          <p className="mt-2 font-medium text-foreground">{data.title}</p>
          {data.subtitle ? (
            <p className="mt-1 text-sm text-muted-fg">{data.subtitle}</p>
          ) : null}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-0 !bg-primary"
      />
    </div>
  );
}

const nodeTypes = {
  preview: ApiPreviewNode,
};

function layoutGraph(nodes: Node[], edges: Edge[]) {
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({
    rankdir: "LR",
    nodesep: 48,
    ranksep: 80,
    marginx: 24,
    marginy: 24,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    graph.setNode(node.id, { width: 260, height: 96 });
  }

  for (const edge of edges) {
    graph.setEdge(edge.source, edge.target);
  }

  dagre.layout(graph);

  return nodes.map((node) => {
    const position = graph.node(node.id);
    return {
      ...node,
      position: {
        x: position.x - 130,
        y: position.y - 48,
      },
    };
  });
}

export function RestFlowPreview() {
  const nodes = React.useMemo<Node<PreviewNodeData>[]>(
    () => [
      {
        id: "api",
        type: "preview",
        position: { x: 0, y: 0 },
        data: {
          kind: "api",
          title: "Orders API",
          subtitle: "v1.0.0 · https://api.example.com",
          meta: "Root",
        },
      },
      {
        id: "security",
        type: "preview",
        position: { x: 0, y: 0 },
        data: {
          kind: "security",
          title: "Bearer authentication",
          subtitle: "JWT required for protected routes",
          meta: "Shared",
        },
      },
      {
        id: "orders",
        type: "preview",
        position: { x: 0, y: 0 },
        data: {
          kind: "resource",
          title: "/orders",
          subtitle: "Collection resource for listing and creating orders",
        },
      },
      {
        id: "order-by-id",
        type: "preview",
        position: { x: 0, y: 0 },
        data: {
          kind: "resource",
          title: "/orders/{id}",
          subtitle: "Single order resource with path parameter",
        },
      },
      {
        id: "get-orders",
        type: "preview",
        position: { x: 0, y: 0 },
        data: {
          kind: "operation",
          title: "GET list orders",
          subtitle: "Query params: status, page, pageSize",
          meta: "200 / 400",
        },
      },
      {
        id: "post-orders",
        type: "preview",
        position: { x: 0, y: 0 },
        data: {
          kind: "operation",
          title: "POST create order",
          subtitle: "Body: CreateOrderRequest",
          meta: "201 / 422",
        },
      },
      {
        id: "get-order",
        type: "preview",
        position: { x: 0, y: 0 },
        data: {
          kind: "operation",
          title: "GET order by id",
          subtitle: "Path param: id",
          meta: "200 / 404",
        },
      },
      {
        id: "patch-order",
        type: "preview",
        position: { x: 0, y: 0 },
        data: {
          kind: "operation",
          title: "PATCH update status",
          subtitle: "Body: UpdateOrderStatusRequest",
          meta: "200 / 409",
        },
      },
      {
        id: "list-response",
        type: "preview",
        position: { x: 0, y: 0 },
        data: {
          kind: "contract",
          title: "OrderListResponse",
          subtitle: "items[], pagination metadata",
        },
      },
      {
        id: "create-request",
        type: "preview",
        position: { x: 0, y: 0 },
        data: {
          kind: "contract",
          title: "CreateOrderRequest",
          subtitle: "customerId, items[], paymentMethod",
        },
      },
      {
        id: "workflow-create-order",
        type: "preview",
        position: { x: 0, y: 0 },
        data: {
          kind: "workflow",
          title: "camel:create-order",
          subtitle: "Linked Camel workflow for fulfillment",
        },
      },
    ],
    [],
  );

  const edges = React.useMemo<Edge[]>(
    () => [
      ["api", "orders"],
      ["api", "order-by-id"],
      ["api", "security"],
      ["orders", "get-orders"],
      ["orders", "post-orders"],
      ["order-by-id", "get-order"],
      ["order-by-id", "patch-order"],
      ["get-orders", "list-response"],
      ["post-orders", "create-request"],
      ["post-orders", "workflow-create-order"],
      ["patch-order", "workflow-create-order"],
    ].map(([source, target], index) => ({
      id: `edge-${index}`,
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
    })),
    [],
  );

  const layoutedNodes = React.useMemo(
    () => layoutGraph(nodes, edges),
    [nodes, edges],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-gradient-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge intent="secondary">Concept</Badge>
              <Badge intent="outline">Mocked data</Badge>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-foreground">
              REST Studio visual concept
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-fg">
              This is a structural canvas, not an execution flow. It maps the API
              root, resources, operations, shared contracts, and optional workflow
              links to show how a more visual REST Studio could feel.
            </p>
          </div>
          <Link
            href="/app/apis"
            className={buttonStyles({ intent: "secondary", size: "sm" })}
          >
            <Boxes className="h-4 w-4" />
            Back to APIs
          </Link>
        </div>
      </div>

      <div className="h-[calc(100vh-240px)] min-h-[620px] overflow-hidden rounded-xl border border-border/60 bg-background">
        <ReactFlow
          nodes={layoutedNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
