import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type ReactFlowInstance,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "app/components/ui/button";
import { Link } from "app/components/ui/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { Checkbox } from "app/components/ui/checkbox";
import { Sheet } from "app/components/ui/sheet";
import { Tooltip } from "app/components/ui/tooltip";
import {
  Select,
  SelectList,
  SelectOption,
  SelectTrigger,
} from "app/components/ui/select";
import { TextField } from "app/components/ui/text-field";
import { Textarea } from "app/components/ui/textarea";
import { RestToolbar } from "./rest-toolbar";
import {
  buildApiCanvas,
  createApiOperation,
  createApiParameter,
  createApiResource,
  createApiResponse,
  type ApiCanvasDirection,
  updateApiOperation,
  updateApiParameter,
  updateApiResource,
  updateApiResponse,
  type ApiCanvasEdge,
  type ApiCanvasNode,
  type ApiCanvasNodeData,
  type ApiHttpMethod,
  type ApiOperation,
  type ApiParameter,
  type ApiResource,
  type ApiResponse,
  type ApiSpec,
  useApiStore,
} from "./rest-spec";
import {
  Database,
  FolderTree,
  Plus,
  Route,
  Server,
  Settings2,
  Trash2,
  Workflow,
  Code2,
} from "lucide-react";
import React from "react";
import { useLocation } from "react-router";
import type { ApiCanvasSelection } from "./rest-spec";

type VisualNodeKind = ApiCanvasNodeData["kind"];
type SetApiSpec = (value: ApiSpec | ((current: ApiSpec) => ApiSpec)) => void;

const HTTP_METHODS: ApiHttpMethod[] = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
];

const PARAMETER_LOCATIONS: ApiParameter["in"][] = ["path", "query", "header"];
const PARAMETER_TYPES: ApiParameter["type"][] = [
  "string",
  "number",
  "integer",
  "boolean",
];

const METHOD_DOT_CLASS: Record<ApiHttpMethod, string> = {
  get: "bg-emerald-400",
  post: "bg-sky-400",
  put: "bg-amber-400",
  patch: "bg-violet-400",
  delete: "bg-rose-400",
  head: "bg-cyan-400",
  options: "bg-orange-400",
};

function ApiStudioNode({ data }: NodeProps<ApiCanvasNode>) {
  const config: Record<
    VisualNodeKind,
    {
      icon: React.ComponentType<{ className?: string }>;
      badge: string;
      intent: "secondary" | "info" | "warning" | "outline";
    }
  > = {
    api: { icon: Server, badge: "API", intent: "secondary" },
    resource: { icon: FolderTree, badge: "Resource", intent: "info" },
    operation: { icon: Route, badge: "Operation", intent: "secondary" },
    contract: { icon: Database, badge: "Contract", intent: "outline" },
    workflow: { icon: Workflow, badge: "Workflow", intent: "warning" },
  };
  const current = config[data.kind];
  const Icon = current.icon;

  return (
    <div
      className={`min-w-[220px] max-w-[260px] rounded-xl border p-3 shadow-card transition ${
        data.isSelected
          ? "border-primary/70 bg-primary/10"
          : "border-border/60 bg-gradient-card"
      }`}
    >
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
            <Badge intent={current.intent}>{current.badge}</Badge>
            {data.meta ? (
              <span className="truncate text-xs text-muted-fg">
                {data.meta}
              </span>
            ) : null}
            {data.kind === "operation" && data.method ? (
              <span
                className={`ml-auto h-2.5 w-2.5 rounded-full ${METHOD_DOT_CLASS[data.method]}`}
              />
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
  studio: ApiStudioNode,
};

export function RestVisualStudio({
  initialSpec,
  initialName,
  initialDescription,
  canEdit,
  initialSnapshot,
}: {
  initialSpec: ApiSpec;
  initialName: string;
  initialDescription: string;
  canEdit: boolean;
  initialSnapshot: string;
}) {
  const apiSpec = useApiStore((state) => state.apiSpec);
  const setApiSpec = useApiStore((state) => state.setApiSpec);
  const canvasNodes = useApiStore((state) => state.canvas.nodes);
  const canvasEdges = useApiStore((state) => state.canvas.edges);
  const setCanvas = useApiStore((state) => state.canvas.setCanvas);
  const [name, setName] = React.useState(initialName);
  const [description, setDescription] = React.useState(initialDescription);
  const [focusedTarget, setFocusedTarget] =
    React.useState<ApiCanvasSelection | null>(null);
  const [sheetTarget, setSheetTarget] =
    React.useState<ApiCanvasSelection | null>(null);
  const [direction, setDirection] = React.useState<ApiCanvasDirection>("LR");
  const [zoom, setZoom] = React.useState(1);
  const [saveState, setSaveState] = React.useState<
    "unsaved" | "saving" | "synced" | "failed"
  >("synced");
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const flowRef = React.useRef<ReactFlowInstance<
    ApiCanvasNode,
    ApiCanvasEdge
  > | null>(null);
  const location = useLocation();
  const spec = apiSpec;
  const setSpec = setApiSpec;

  React.useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
    setApiSpec(initialSpec);
  }, [initialDescription, initialName, initialSpec, setApiSpec]);

  const graph = React.useMemo(
    () => buildApiCanvas(spec, focusedTarget, direction),
    [direction, spec, focusedTarget],
  );

  React.useEffect(() => {
    setCanvas(graph.nodes, graph.edges);
  }, [graph.edges, graph.nodes, setCanvas]);

  React.useEffect(() => {
    if (!flowRef.current) return;
    window.requestAnimationFrame(() => {
      flowRef.current?.fitView({ duration: 300, padding: 0.18 });
    });
  }, [direction, canvasNodes, canvasEdges]);

  React.useEffect(() => {
    setApiSpec((current) => ({
      ...current,
      info: {
        ...current.info,
        title: name,
        description,
      },
    }));
  }, [name, description, setApiSpec]);

  const selectedResource =
    focusedTarget?.kind === "resource"
      ? spec.resources.find(
          (resource) => resource.id === focusedTarget.resourceId,
        )
      : focusedTarget?.kind === "operation" ||
          focusedTarget?.kind === "requestBody" ||
          focusedTarget?.kind === "response"
        ? spec.resources.find(
            (resource) => resource.id === focusedTarget.resourceId,
          )
        : undefined;

  const selectedOperation =
    focusedTarget?.kind === "operation" ||
    focusedTarget?.kind === "requestBody" ||
    focusedTarget?.kind === "response"
      ? selectedResource?.operations.find(
          (operation) => operation.id === focusedTarget.operationId,
        )
      : undefined;

  const isApiFocused = focusedTarget?.kind === "api";
  const isResourceFocused = focusedTarget?.kind === "resource";
  const isOperationFocused =
    focusedTarget?.kind === "operation" ||
    focusedTarget?.kind === "requestBody" ||
    focusedTarget?.kind === "response";

  const inspectedResource =
    sheetTarget?.kind === "resource"
      ? spec.resources.find(
          (resource) => resource.id === sheetTarget.resourceId,
        )
      : sheetTarget?.kind === "operation" ||
          sheetTarget?.kind === "requestBody" ||
          sheetTarget?.kind === "response"
        ? spec.resources.find(
            (resource) => resource.id === sheetTarget.resourceId,
          )
        : undefined;

  const inspectedOperation =
    sheetTarget?.kind === "operation" ||
    sheetTarget?.kind === "requestBody" ||
    sheetTarget?.kind === "response"
      ? inspectedResource?.operations.find(
          (operation) => operation.id === sheetTarget.operationId,
        )
      : undefined;

  function focusTarget(target: ApiCanvasSelection) {
    setFocusedTarget(target);
  }

  function openInspector(target: ApiCanvasSelection) {
    setFocusedTarget(target);
    setSheetTarget(target);
  }

  function closeInspector() {
    setSheetTarget(null);
  }

  function openFocusedInspector() {
    if (!focusedTarget) return;
    openInspector(focusedTarget);
  }

  function addResource() {
    const resource = createApiResource({
      path: `/resource-${spec.resources.length + 1}`,
    });
    setApiSpec((current) => ({
      ...current,
      resources: [...current.resources, resource],
    }));
    openInspector({ kind: "resource", resourceId: resource.id });
  }

  function addOperation(method: ApiHttpMethod) {
    if (!selectedResource) return;
    const operation = createApiOperation(method);
    setApiSpec((current) =>
      updateApiResource(current, selectedResource.id, (resource) => ({
        ...resource,
        operations: [...resource.operations, operation],
      })),
    );
    openInspector({
      kind: "operation",
      resourceId: selectedResource.id,
      operationId: operation.id,
    });
  }

  function removeResource(resourceId: string) {
    setApiSpec((current) => {
      const resources = current.resources.filter(
        (resource) => resource.id !== resourceId,
      );
      return {
        ...current,
        resources: resources.length ? resources : [createApiResource()],
      };
    });
    setFocusedTarget({ kind: "api" });
    closeInspector();
  }

  function removeOperation(resourceId: string, operationId: string) {
    setApiSpec((current) =>
      updateApiResource(current, resourceId, (resource) => {
        const operations = resource.operations.filter(
          (operation) => operation.id !== operationId,
        );
        return {
          ...resource,
          operations: operations.length
            ? operations
            : [createApiOperation("get")],
        };
      }),
    );
    setFocusedTarget({ kind: "resource", resourceId });
    closeInspector();
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="content" value={JSON.stringify(spec)} />

      <div className="relative h-[calc(100vh-240px)] min-h-[680px] overflow-hidden rounded-xl border border-border/60 bg-background">
        <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge intent="secondary">
              {spec.resources.length} resource
              {spec.resources.length === 1 ? "" : "s"}
            </Badge>
            <Button
              type="button"
              intent="secondary"
              size="sm"
              onPress={() => openInspector({ kind: "api" })}
            >
              <Settings2 className="h-4 w-4" />
              API info
            </Button>
            {isApiFocused ? (
              <Button
                type="button"
                intent="secondary"
                size="sm"
                onPress={addResource}
                isDisabled={!canEdit}
              >
                <Plus className="h-4 w-4" />
                Resource
              </Button>
            ) : null}
            {isResourceFocused && selectedResource ? (
              <>
                <Button
                  type="button"
                  intent="secondary"
                  size="sm"
                  onPress={openFocusedInspector}
                >
                  <Settings2 className="h-4 w-4" />
                  Edit resource
                </Button>
                <Button
                  type="button"
                  intent="secondary"
                  size="sm"
                  onPress={() => addOperation("get")}
                  isDisabled={!canEdit}
                >
                  <Plus className="h-4 w-4" />
                  Add operation
                </Button>
              </>
            ) : null}
            {isOperationFocused && selectedOperation ? (
              <Button
                type="button"
                intent="secondary"
                size="sm"
                onPress={openFocusedInspector}
              >
                <Settings2 className="h-4 w-4" />
                Edit operation
              </Button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <Badge
                intent={
                  saveState === "failed"
                    ? "danger"
                    : saveState === "saving"
                      ? "warning"
                      : saveState === "unsaved"
                        ? "secondary"
                        : "success"
                }
              >
                {saveState === "failed"
                  ? "Sync failed"
                  : saveState === "saving"
                    ? "Syncing"
                    : saveState === "unsaved"
                      ? "Unsaved"
                      : "Synced"}
              </Badge>
              <Tooltip.Content>
                {saveError
                  ? saveError
                  : saveState === "unsaved"
                    ? "Changes will autosave shortly."
                    : saveState === "saving"
                      ? "Syncing API changes."
                      : "All changes synced."}
              </Tooltip.Content>
            </Tooltip>
            <Tooltip>
              <Link
                href={`${location.pathname}/code${location.search}`}
                aria-label="Open code view"
                className={buttonStyles({ size: "sq-sm", intent: "secondary" })}
              >
                <Code2 size={16} />
              </Link>
              <Tooltip.Content>Code view</Tooltip.Content>
            </Tooltip>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 z-10">
          <RestToolbar
            name={name}
            description={description}
            spec={spec}
            canEdit={canEdit}
            initialSnapshot={initialSnapshot}
            zoom={zoom}
            minZoom={0.5}
            maxZoom={2}
            direction={direction}
            onZoomIn={() => flowRef.current?.zoomIn({ duration: 300 })}
            onZoomOut={() => flowRef.current?.zoomOut({ duration: 300 })}
            onZoomTo={(value) =>
              flowRef.current?.zoomTo(value, { duration: 200 })
            }
            onFitView={() =>
              flowRef.current?.fitView({ duration: 300, padding: 0.18 })
            }
            onToggleDirection={() =>
              setDirection((current) => (current === "LR" ? "TB" : "LR"))
            }
            orientation="horizontal"
            onSaveStateChange={({ saveError, saveState }) => {
              setSaveError(saveError);
              setSaveState(saveState);
            }}
          />
        </div>

        <ReactFlow
          onInit={(instance) => {
            flowRef.current = instance;
            setZoom(instance.getZoom());
          }}
          nodes={canvasNodes}
          edges={canvasEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.5}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          onPaneClick={() => {
            setFocusedTarget(null);
            setSheetTarget(null);
          }}
          onMove={(_, viewport) => {
            setZoom(viewport.zoom);
          }}
          onNodeClick={(_, node) => {
            if (node.id === "api") {
              focusTarget({ kind: "api" });
              return;
            }
            if (node.id.startsWith("resource:")) {
              focusTarget({
                kind: "resource",
                resourceId: node.id.replace("resource:", ""),
              });
              return;
            }
            if (node.id.startsWith("operation:")) {
              const [, resourceId, operationId] = node.id.split(":");
              focusTarget({
                kind: "operation",
                resourceId,
                operationId,
              });
              return;
            }
            if (node.id.startsWith("request:")) {
              const [, resourceId, operationId] = node.id.split(":");
              openInspector({
                kind: "requestBody",
                resourceId,
                operationId,
              });
              return;
            }
            if (node.id.startsWith("response:")) {
              const [, resourceId, operationId] = node.id.split(":");
              const responseId =
                spec.resources
                  .find((resource) => resource.id === resourceId)
                  ?.operations.find((operation) => operation.id === operationId)
                  ?.responses[0]?.id ?? undefined;
              openInspector({
                kind: "response",
                resourceId,
                operationId,
                responseId,
              });
            }
          }}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <Sheet
        isOpen={!!sheetTarget}
        onOpenChange={(nextIsOpen) => {
          if (!nextIsOpen) {
            closeInspector();
          }
        }}
      >
        <Sheet.Content isDismissable>
          <Sheet.Header className="px-4 py-4 pb-3">
            <div className="flex items-center gap-2 pb-2">
              <Badge intent="secondary">Edit</Badge>
              {sheetTarget?.kind === "api" ? (
                <Badge intent="outline">API</Badge>
              ) : null}
              {sheetTarget?.kind === "resource" ? (
                <Badge intent="info">Resource</Badge>
              ) : null}
              {sheetTarget?.kind === "operation" ||
              sheetTarget?.kind === "requestBody" ||
              sheetTarget?.kind === "response" ? (
                <Badge intent="secondary">Operation</Badge>
              ) : null}
            </div>
            <Sheet.Title>
              {sheetTarget?.kind === "api"
                ? "API info"
                : sheetTarget?.kind === "resource"
                  ? inspectedResource?.path || "Resource"
                  : sheetTarget?.kind === "requestBody"
                    ? "Request body"
                    : sheetTarget?.kind === "response"
                      ? "Response contract"
                      : inspectedOperation?.summary ||
                        inspectedOperation?.method.toUpperCase() ||
                        "Operation"}
            </Sheet.Title>
            <Sheet.Description>
              {sheetTarget?.kind === "api"
                ? "Edit the top-level REST API metadata."
                : sheetTarget?.kind === "resource"
                  ? "Shape the path and semantics of this resource."
                  : sheetTarget?.kind === "requestBody"
                    ? "Edit the request payload contract for this operation."
                    : sheetTarget?.kind === "response"
                      ? "Edit the response contract for this operation."
                      : "Edit request contract, metadata, and response details for this operation."}
            </Sheet.Description>
          </Sheet.Header>
          <Sheet.Body className="space-y-4 px-4 py-2 pb-4">
            {sheetTarget?.kind === "api" ? (
              <ApiInspector
                canEdit={canEdit}
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                spec={spec}
                setSpec={setSpec}
              />
            ) : null}
            {sheetTarget?.kind === "resource" && inspectedResource ? (
              <ResourceInspector
                canEdit={canEdit}
                resource={inspectedResource}
                removeResource={removeResource}
                setSpec={setSpec}
              />
            ) : null}
            {sheetTarget?.kind === "operation" &&
            inspectedResource &&
            inspectedOperation ? (
              <OperationInspector
                canEdit={canEdit}
                resource={inspectedResource}
                operation={inspectedOperation}
                removeOperation={removeOperation}
                spec={spec}
                setSpec={setSpec}
              />
            ) : null}
            {(sheetTarget?.kind === "requestBody" ||
              sheetTarget?.kind === "response") &&
            inspectedResource &&
            inspectedOperation ? (
              <ContractInspector
                canEdit={canEdit}
                resource={inspectedResource}
                operation={inspectedOperation}
                initialFocus={
                  sheetTarget.kind === "requestBody"
                    ? "requestBody"
                    : "responses"
                }
                spec={spec}
                setSpec={setSpec}
              />
            ) : null}
          </Sheet.Body>
        </Sheet.Content>
      </Sheet>
    </div>
  );
}

function ApiInspector({
  canEdit,
  name,
  setName,
  description,
  setDescription,
  spec,
  setSpec,
}: {
  canEdit: boolean;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  spec: ApiSpec;
  setSpec: SetApiSpec;
}) {
  return (
    <div className="space-y-4">
      <TextField
        label="API name"
        value={name}
        onChange={setName}
        isDisabled={!canEdit}
      />
      <TextField
        label="Version"
        value={spec.info.version}
        onChange={(value) =>
          setSpec((current) => ({
            ...current,
            info: { ...current.info, version: value },
          }))
        }
        isDisabled={!canEdit}
      />
      <TextField
        label="Base server URL"
        value={spec.servers[0]?.url ?? ""}
        prefix={<Server className="h-4 w-4 text-muted-fg" />}
        onChange={(value) =>
          setSpec((current) => ({
            ...current,
            servers: current.servers.length
              ? current.servers.map((server, index) =>
                  index === 0 ? { ...server, url: value } : server,
                )
              : [
                  {
                    id: `server-${crypto.randomUUID()}`,
                    url: value,
                    description: "",
                  },
                ],
          }))
        }
        isDisabled={!canEdit}
      />
      <Textarea
        label="Description"
        value={description}
        onChange={setDescription}
        isDisabled={!canEdit}
      />
    </div>
  );
}

function ResourceInspector({
  canEdit,
  resource,
  removeResource,
  setSpec,
}: {
  canEdit: boolean;
  resource: ApiResource;
  removeResource: (resourceId: string) => void;
  setSpec: SetApiSpec;
}) {
  return (
    <div className="space-y-4">
      <TextField
        label="Path"
        description="Use REST-style paths like /orders or /orders/{id}."
        value={resource.path}
        onChange={(value) =>
          setSpec((current) =>
            updateApiResource(current, resource.id, (currentResource) => ({
              ...currentResource,
              path: value,
            })),
          )
        }
        isDisabled={!canEdit}
      />
      <TextField
        label="Summary"
        value={resource.summary}
        onChange={(value) =>
          setSpec((current) =>
            updateApiResource(current, resource.id, (currentResource) => ({
              ...currentResource,
              summary: value,
            })),
          )
        }
        isDisabled={!canEdit}
      />
      <Textarea
        label="Description"
        value={resource.description}
        onChange={(value) =>
          setSpec((current) =>
            updateApiResource(current, resource.id, (currentResource) => ({
              ...currentResource,
              description: value,
            })),
          )
        }
        isDisabled={!canEdit}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          intent="danger"
          size="sm"
          onPress={() => removeResource(resource.id)}
          isDisabled={!canEdit}
        >
          <Trash2 className="h-4 w-4" />
          Delete resource
        </Button>
      </div>
    </div>
  );
}

function OperationInspector({
  canEdit,
  resource,
  operation,
  removeOperation,
  spec,
  setSpec,
}: {
  canEdit: boolean;
  resource: ApiResource;
  operation: ApiOperation;
  removeOperation: (resourceId: string, operationId: string) => void;
  spec: ApiSpec;
  setSpec: SetApiSpec;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Select
          label="Method"
          selectedKey={operation.method}
          isDisabled={!canEdit}
          onSelectionChange={(key) =>
            setSpec((current) =>
              updateApiOperation(
                current,
                resource.id,
                operation.id,
                (currentOperation) => ({
                  ...currentOperation,
                  method: String(key) as ApiHttpMethod,
                }),
              ),
            )
          }
        >
          <SelectTrigger />
          <SelectList>
            {HTTP_METHODS.map((method) => (
              <SelectOption key={method} id={method}>
                {method.toUpperCase()}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
        <TextField
          label="Operation ID"
          value={operation.operationId}
          onChange={(value) =>
            setSpec((current) =>
              updateApiOperation(
                current,
                resource.id,
                operation.id,
                (currentOperation) => ({
                  ...currentOperation,
                  operationId: value,
                }),
              ),
            )
          }
          isDisabled={!canEdit}
        />
        <TextField
          label="Summary"
          value={operation.summary}
          onChange={(value) =>
            setSpec((current) =>
              updateApiOperation(
                current,
                resource.id,
                operation.id,
                (currentOperation) => ({
                  ...currentOperation,
                  summary: value,
                }),
              ),
            )
          }
          isDisabled={!canEdit}
        />
        <TextField
          label="Linked workflow"
          value={operation.workflowId ?? ""}
          placeholder="Optional workflow id"
          onChange={(value) =>
            setSpec((current) =>
              updateApiOperation(
                current,
                resource.id,
                operation.id,
                (currentOperation) => ({
                  ...currentOperation,
                  workflowId: value || null,
                }),
              ),
            )
          }
          isDisabled={!canEdit}
        />
      </div>
      <Textarea
        label="Description"
        value={operation.description}
        onChange={(value) =>
          setSpec((current) =>
            updateApiOperation(
              current,
              resource.id,
              operation.id,
              (currentOperation) => ({
                ...currentOperation,
                description: value,
              }),
            ),
          )
        }
        isDisabled={!canEdit}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          intent="danger"
          size="sm"
          onPress={() => removeOperation(resource.id, operation.id)}
          isDisabled={!canEdit}
        >
          <Trash2 className="h-4 w-4" />
          Delete operation
        </Button>
      </div>
    </div>
  );
}

function ContractInspector({
  canEdit,
  resource,
  operation,
  initialFocus,
  spec,
  setSpec,
}: {
  canEdit: boolean;
  resource: ApiResource;
  operation: ApiOperation;
  initialFocus: "requestBody" | "responses";
  spec: ApiSpec;
  setSpec: SetApiSpec;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          intent={initialFocus === "requestBody" ? "secondary" : "outline"}
        >
          Request body
        </Badge>
        <Badge intent={initialFocus === "responses" ? "secondary" : "outline"}>
          Responses
        </Badge>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-medium text-foreground">Parameters</h3>
            <p className="text-sm text-muted-fg">
              Path, query, and header inputs for this operation.
            </p>
          </div>
          <Button
            type="button"
            intent="secondary"
            size="sm"
            onPress={() =>
              setSpec((current) =>
                updateApiOperation(
                  current,
                  resource.id,
                  operation.id,
                  (currentOperation) => ({
                    ...currentOperation,
                    parameters: [
                      ...currentOperation.parameters,
                      createApiParameter(),
                    ],
                  }),
                ),
              )
            }
            isDisabled={!canEdit}
          >
            <Plus />
            Add parameter
          </Button>
        </div>
        <div className="space-y-3">
          {operation.parameters.map((parameter) => (
            <div
              key={parameter.id}
              className="rounded-lg border border-border/60 p-3"
            >
              <div className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.9fr_auto]">
                <TextField
                  label="Name"
                  value={parameter.name}
                  onChange={(value) =>
                    setSpec((current) =>
                      updateApiParameter(
                        current,
                        resource.id,
                        operation.id,
                        parameter.id,
                        (currentParameter) => ({
                          ...currentParameter,
                          name: value,
                        }),
                      ),
                    )
                  }
                  isDisabled={!canEdit}
                />
                <Select
                  label="In"
                  selectedKey={parameter.in}
                  isDisabled={!canEdit}
                  onSelectionChange={(key) =>
                    setSpec((current) =>
                      updateApiParameter(
                        current,
                        resource.id,
                        operation.id,
                        parameter.id,
                        (currentParameter) => ({
                          ...currentParameter,
                          in: String(key) as ApiParameter["in"],
                        }),
                      ),
                    )
                  }
                >
                  <SelectTrigger />
                  <SelectList>
                    {PARAMETER_LOCATIONS.map((location) => (
                      <SelectOption key={location} id={location}>
                        {location}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
                <Select
                  label="Type"
                  selectedKey={parameter.type}
                  isDisabled={!canEdit}
                  onSelectionChange={(key) =>
                    setSpec((current) =>
                      updateApiParameter(
                        current,
                        resource.id,
                        operation.id,
                        parameter.id,
                        (currentParameter) => ({
                          ...currentParameter,
                          type: String(key) as ApiParameter["type"],
                        }),
                      ),
                    )
                  }
                >
                  <SelectTrigger />
                  <SelectList>
                    {PARAMETER_TYPES.map((type) => (
                      <SelectOption key={type} id={type}>
                        {type}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
                <Button
                  type="button"
                  intent="plain"
                  size="sq-sm"
                  className="self-end"
                  onPress={() =>
                    setSpec((current) =>
                      updateApiOperation(
                        current,
                        resource.id,
                        operation.id,
                        (currentOperation) => ({
                          ...currentOperation,
                          parameters: currentOperation.parameters.filter(
                            (currentParameter) =>
                              currentParameter.id !== parameter.id,
                          ),
                        }),
                      ),
                    )
                  }
                  isDisabled={!canEdit}
                >
                  <Trash2 />
                </Button>
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
                <TextField
                  label="Description"
                  value={parameter.description}
                  onChange={(value) =>
                    setSpec((current) =>
                      updateApiParameter(
                        current,
                        resource.id,
                        operation.id,
                        parameter.id,
                        (currentParameter) => ({
                          ...currentParameter,
                          description: value,
                        }),
                      ),
                    )
                  }
                  isDisabled={!canEdit}
                />
                <Checkbox
                  className="self-end pb-2"
                  isSelected={parameter.required}
                  onChange={(isSelected) =>
                    setSpec((current) =>
                      updateApiParameter(
                        current,
                        resource.id,
                        operation.id,
                        parameter.id,
                        (currentParameter) => ({
                          ...currentParameter,
                          required: isSelected,
                        }),
                      ),
                    )
                  }
                  isDisabled={!canEdit}
                  label="Required"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {(operation.method === "post" ||
        operation.method === "put" ||
        operation.method === "patch" ||
        operation.requestBody) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-foreground">Request body</h3>
              <p className="text-sm text-muted-fg">
                Describe payload expectations for body-based requests.
              </p>
            </div>
            {!operation.requestBody ? (
              <Button
                type="button"
                intent="secondary"
                size="sm"
                onPress={() =>
                  setSpec((current) =>
                    updateApiOperation(
                      current,
                      resource.id,
                      operation.id,
                      (currentOperation) => ({
                        ...currentOperation,
                        requestBody: {
                          contentType: "application/json",
                          required: true,
                          description: "",
                          example: "",
                        },
                      }),
                    ),
                  )
                }
                isDisabled={!canEdit}
              >
                <Plus />
                Add body
              </Button>
            ) : (
              <Button
                type="button"
                intent="plain"
                size="sm"
                onPress={() =>
                  setSpec((current) =>
                    updateApiOperation(
                      current,
                      resource.id,
                      operation.id,
                      (currentOperation) => ({
                        ...currentOperation,
                        requestBody: null,
                      }),
                    ),
                  )
                }
                isDisabled={!canEdit}
              >
                <Trash2 />
                Remove
              </Button>
            )}
          </div>

          {operation.requestBody ? (
            <div className="rounded-lg border border-border/60 p-3">
              <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
                <TextField
                  label="Content type"
                  value={operation.requestBody.contentType}
                  onChange={(value) =>
                    setSpec((current) =>
                      updateApiOperation(
                        current,
                        resource.id,
                        operation.id,
                        (currentOperation) => ({
                          ...currentOperation,
                          requestBody: currentOperation.requestBody
                            ? {
                                ...currentOperation.requestBody,
                                contentType: value,
                              }
                            : null,
                        }),
                      ),
                    )
                  }
                  isDisabled={!canEdit}
                />
                <TextField
                  label="Description"
                  value={operation.requestBody.description}
                  onChange={(value) =>
                    setSpec((current) =>
                      updateApiOperation(
                        current,
                        resource.id,
                        operation.id,
                        (currentOperation) => ({
                          ...currentOperation,
                          requestBody: currentOperation.requestBody
                            ? {
                                ...currentOperation.requestBody,
                                description: value,
                              }
                            : null,
                        }),
                      ),
                    )
                  }
                  isDisabled={!canEdit}
                />
              </div>
              <Checkbox
                className="mt-3"
                isSelected={operation.requestBody.required}
                onChange={(isSelected) =>
                  setSpec((current) =>
                    updateApiOperation(
                      current,
                      resource.id,
                      operation.id,
                      (currentOperation) => ({
                        ...currentOperation,
                        requestBody: currentOperation.requestBody
                          ? {
                              ...currentOperation.requestBody,
                              required: isSelected,
                            }
                          : null,
                      }),
                    ),
                  )
                }
                isDisabled={!canEdit}
                label="Required body"
              />
              <Textarea
                label="Example"
                className="mt-3"
                value={operation.requestBody.example}
                onChange={(value) =>
                  setSpec((current) =>
                    updateApiOperation(
                      current,
                      resource.id,
                      operation.id,
                      (currentOperation) => ({
                        ...currentOperation,
                        requestBody: currentOperation.requestBody
                          ? {
                              ...currentOperation.requestBody,
                              example: value,
                            }
                          : null,
                      }),
                    ),
                  )
                }
                isDisabled={!canEdit}
              />
            </div>
          ) : null}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-medium text-foreground">Responses</h3>
            <p className="text-sm text-muted-fg">
              Status codes and payload examples returned by this operation.
            </p>
          </div>
          <Button
            type="button"
            intent="secondary"
            size="sm"
            onPress={() =>
              setSpec((current) =>
                updateApiOperation(
                  current,
                  resource.id,
                  operation.id,
                  (currentOperation) => ({
                    ...currentOperation,
                    responses: [
                      ...currentOperation.responses,
                      createApiResponse(),
                    ],
                  }),
                ),
              )
            }
            isDisabled={!canEdit}
          >
            <Plus />
            Add response
          </Button>
        </div>
        <div className="space-y-3">
          {operation.responses.map((response) => (
            <div
              key={response.id}
              className="rounded-lg border border-border/60 p-3"
            >
              <div className="grid gap-3 lg:grid-cols-[140px_1fr_auto]">
                <TextField
                  label="Status"
                  value={response.statusCode}
                  onChange={(value) =>
                    setSpec((current) =>
                      updateApiResponse(
                        current,
                        resource.id,
                        operation.id,
                        response.id,
                        (currentResponse) => ({
                          ...currentResponse,
                          statusCode: value,
                        }),
                      ),
                    )
                  }
                  isDisabled={!canEdit}
                />
                <TextField
                  label="Description"
                  value={response.description}
                  onChange={(value) =>
                    setSpec((current) =>
                      updateApiResponse(
                        current,
                        resource.id,
                        operation.id,
                        response.id,
                        (currentResponse) => ({
                          ...currentResponse,
                          description: value,
                        }),
                      ),
                    )
                  }
                  isDisabled={!canEdit}
                />
                <Button
                  type="button"
                  intent="plain"
                  size="sq-sm"
                  className="self-end"
                  onPress={() =>
                    setSpec((current) =>
                      updateApiOperation(
                        current,
                        resource.id,
                        operation.id,
                        (currentOperation) => ({
                          ...currentOperation,
                          responses: currentOperation.responses.filter(
                            (currentResponse) =>
                              currentResponse.id !== response.id,
                          ),
                        }),
                      ),
                    )
                  }
                  isDisabled={!canEdit}
                >
                  <Trash2 />
                </Button>
              </div>
              <Textarea
                label="Example"
                className="mt-3"
                value={response.example}
                onChange={(value) =>
                  setSpec((current) =>
                    updateApiResponse(
                      current,
                      resource.id,
                      operation.id,
                      response.id,
                      (currentResponse) => ({
                        ...currentResponse,
                        example: value,
                      }),
                    ),
                  )
                }
                isDisabled={!canEdit}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
