import {
  Background,
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
import { Menu } from "app/components/ui/menu";
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
  apiSpecToJson,
  apiSpecToYaml,
  buildApiCanvas,
  createApiOperation,
  createApiParameter,
  createApiResource,
  createApiResponse,
  createApiResponseHeader,
  createApiSchema,
  createApiSecurityScheme,
  createApiTag,
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
  type ApiSecurityScheme,
  type ApiSchema,
  type ApiSpec,
  useApiStore,
} from "./rest-spec";
import {
  Database,
  Download,
  FolderTree,
  History,
  LayoutTemplate,
  Plus,
  Route,
  Server,
  Settings2,
  Share2,
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
const RESPONSE_PRESETS = [
  { statusCode: "200", description: "Successful response" },
  { statusCode: "201", description: "Created" },
  { statusCode: "400", description: "Bad request" },
  { statusCode: "404", description: "Not found" },
  { statusCode: "500", description: "Internal server error" },
] as const;
const REQUEST_BODY_PRESETS = [
  {
    contentType: "application/json",
    description: "JSON request payload",
  },
  {
    contentType: "multipart/form-data",
    description: "Multipart form payload",
  },
  {
    contentType: "application/x-www-form-urlencoded",
    description: "URL-encoded form payload",
  },
] as const;

function summarizeSchemaContent(content: string) {
  try {
    const parsed = JSON.parse(content);
    const type =
      typeof parsed?.type === "string"
        ? parsed.type
        : parsed?.properties
          ? "object"
          : "unknown";
    const properties = parsed?.properties
      ? Object.keys(parsed.properties).length
      : 0;
    const required = Array.isArray(parsed?.required) ? parsed.required.length : 0;
    const enumCount = Array.isArray(parsed?.enum) ? parsed.enum.length : 0;
    const itemsType =
      parsed?.items && typeof parsed.items.type === "string"
        ? parsed.items.type
        : null;

    return {
      type,
      properties,
      required,
      enumCount,
      itemsType,
    };
  } catch {
    return {
      type: null,
      properties: null,
      required: 0,
      enumCount: 0,
      itemsType: null,
    };
  }
}

function parseSchemaObject(content: string) {
  try {
    const parsed = JSON.parse(content);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function stringifySchemaObject(schemaObject: Record<string, any>) {
  return JSON.stringify(schemaObject, null, 2);
}

function updateStructuredSchemaContent(
  content: string,
  updater: (schemaObject: Record<string, any>) => Record<string, any>,
) {
  const current = parseSchemaObject(content);
  return stringifySchemaObject(updater(current));
}

const METHOD_DOT_CLASS: Record<ApiHttpMethod, string> = {
  get: "bg-emerald-400",
  post: "bg-sky-400",
  put: "bg-amber-400",
  patch: "bg-violet-400",
  delete: "bg-rose-400",
  head: "bg-cyan-400",
  options: "bg-orange-400",
};

function ApiStudioNode({
  data,
  sourcePosition,
  targetPosition,
}: NodeProps<ApiCanvasNode>) {
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
    schema: { icon: Code2, badge: "Schema", intent: "outline" },
    security: { icon: Settings2, badge: "Security", intent: "warning" },
    workflow: { icon: Workflow, badge: "Workflow", intent: "warning" },
  };
  const current = config[data.kind];
  const Icon = current.icon;
  const sizeClass =
    data.kind === "contract" ||
    data.kind === "workflow" ||
    data.kind === "schema" ||
    data.kind === "security"
      ? "min-w-[180px] max-w-[210px]"
      : data.kind === "api"
        ? "min-w-[240px] max-w-[280px]"
        : "min-w-[220px] max-w-[250px]";

  return (
    <div
      className={`${sizeClass} rounded-xl border p-3 shadow-card transition ${
        data.isSelected
          ? "border-primary/70 bg-primary/10 ring-1 ring-primary/30"
          : "border-border/60 bg-gradient-card hover:border-primary/30"
      }`}
    >
      {targetPosition ? (
        <Handle
          type="target"
          position={targetPosition}
          className="!h-2 !w-2 !border-0 !bg-primary"
        />
      ) : null}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-secondary/35 shadow-sm">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
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
          <p className="mt-2 line-clamp-2 text-[13px] font-medium text-foreground">
            {data.title}
          </p>
          {data.flags?.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {data.flags.map((flag) => (
                <Badge key={flag} intent="outline">
                  {flag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {sourcePosition ? (
        <Handle
          type="source"
          position={sourcePosition}
          className="!h-2 !w-2 !border-0 !bg-primary"
        />
      ) : null}
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
  workflows,
  canEdit,
  initialSnapshot,
}: {
  initialSpec: ApiSpec;
  initialName: string;
  initialDescription: string;
  workflows: {
    id: string;
    name: string;
    description: string | null;
    owner: string;
    visibility: "public" | "private";
  }[];
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
  const [isApiCollapsed, setIsApiCollapsed] = React.useState(false);
  const [collapsedResourceIds, setCollapsedResourceIds] = React.useState<
    Set<string>
  >(new Set());
  const [collapsedOperationIds, setCollapsedOperationIds] = React.useState<
    Set<string>
  >(new Set());
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
  const codeHref = React.useMemo(() => {
    const pathname = location.pathname.endsWith("/studio")
      ? `${location.pathname}/code`
      : `${location.pathname.replace(/\/$/, "")}/code`;
    return `${pathname}${location.search}`;
  }, [location.pathname, location.search]);
  const historyHref = React.useMemo(() => {
    const pathname = location.pathname.endsWith("/studio")
      ? `${location.pathname}/history`
      : `${location.pathname.replace(/\/$/, "")}/history`;
    return `${pathname}${location.search}`;
  }, [location.pathname, location.search]);
  const templateHref = React.useMemo(() => {
    const pathname = location.pathname.endsWith("/studio")
      ? `${location.pathname}/template`
      : `${location.pathname.replace(/\/$/, "")}/template`;
    return `${pathname}${location.search}`;
  }, [location.pathname, location.search]);
  const spec = apiSpec;
  const setSpec = setApiSpec;

  React.useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
    setApiSpec(initialSpec);
  }, [initialDescription, initialName, initialSpec, setApiSpec]);

  const graph = React.useMemo(
    () =>
      buildApiCanvas(spec, focusedTarget, direction, {
        api: isApiCollapsed,
        resources: collapsedResourceIds,
        operations: collapsedOperationIds,
      }),
    [collapsedOperationIds, collapsedResourceIds, direction, isApiCollapsed, spec, focusedTarget],
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
  const selectedResourceMethods = React.useMemo(
    () =>
      new Set(
        selectedResource?.operations.map((operation) => operation.method) ?? [],
      ),
    [selectedResource],
  );

  const isApiFocused = focusedTarget?.kind === "api";
  const isResourceFocused = focusedTarget?.kind === "resource";
  const isOperationFocused =
    focusedTarget?.kind === "operation" ||
    focusedTarget?.kind === "requestBody" ||
    focusedTarget?.kind === "response";

  const inspectedResource =
    sheetTarget?.kind === "schema"
      ? undefined
      : sheetTarget?.kind === "resource"
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
  const inspectedSchema =
    sheetTarget?.kind === "schema"
      ? spec.schemas.find((schema) => schema.id === sheetTarget.schemaId)
      : null;
  const isSelectedResourceCollapsed = selectedResource
    ? collapsedResourceIds.has(selectedResource.id)
    : false;
  const isSelectedOperationCollapsed = selectedOperation
    ? collapsedOperationIds.has(selectedOperation.id)
    : false;

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

  function toggleApiCollapse() {
    setIsApiCollapsed((current) => {
      const next = !current;
      if (next) {
        setFocusedTarget({ kind: "api" });
        setSheetTarget((sheet) => (sheet?.kind === "api" ? sheet : null));
      }
      return next;
    });
  }

  function toggleSelectedResourceCollapse() {
    if (!selectedResource) return;
    setCollapsedResourceIds((current) => {
      const next = new Set(current);
      if (next.has(selectedResource.id)) {
        next.delete(selectedResource.id);
      } else {
        next.add(selectedResource.id);
        if (
          focusedTarget?.kind === "operation" ||
          focusedTarget?.kind === "requestBody" ||
          focusedTarget?.kind === "response"
        ) {
          setFocusedTarget({
            kind: "resource",
            resourceId: selectedResource.id,
          });
        }
        if (
          sheetTarget?.kind === "operation" ||
          sheetTarget?.kind === "requestBody" ||
          sheetTarget?.kind === "response"
        ) {
          setSheetTarget({
            kind: "resource",
            resourceId: selectedResource.id,
          });
        }
      }
      return next;
    });
  }

  function toggleSelectedOperationCollapse() {
    if (!selectedResource || !selectedOperation) return;
    setCollapsedOperationIds((current) => {
      const next = new Set(current);
      if (next.has(selectedOperation.id)) {
        next.delete(selectedOperation.id);
      } else {
        next.add(selectedOperation.id);
        if (
          focusedTarget?.kind === "requestBody" ||
          focusedTarget?.kind === "response"
        ) {
          setFocusedTarget({
            kind: "operation",
            resourceId: selectedResource.id,
            operationId: selectedOperation.id,
          });
        }
        if (
          sheetTarget?.kind === "requestBody" ||
          sheetTarget?.kind === "response"
        ) {
          setSheetTarget({
            kind: "operation",
            resourceId: selectedResource.id,
            operationId: selectedOperation.id,
          });
        }
      }
      return next;
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

  function handleDownloadSpec(format: "json" | "yaml") {
    const exportContent =
      format === "json" ? apiSpecToJson(spec) : apiSpecToYaml(spec);
    const blob = new Blob([exportContent], {
      type: format === "json" ? "application/json" : "application/yaml",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rest-spec.${format === "json" ? "json" : "yaml"}`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  async function handleShareSpec() {
    const exportContent = apiSpecToYaml(spec);
    const file = new File([exportContent], "rest-spec.yaml", {
      type: "application/yaml",
    });

    try {
      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        await navigator.share({
          title: "Rest spec",
          text: "Rest spec in YAML",
          files: [file],
        });
        return;
      }
    } catch {
      return;
    }

    try {
      await navigator.clipboard.writeText(exportContent);
    } catch {
      // noop
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="content" value={JSON.stringify(spec)} />

      <div className="relative h-full min-h-0 flex-1 overflow-hidden rounded-xl border border-border/60 bg-background">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent_35%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--color-primary)_8%,transparent),transparent_30%)]" />
        <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-background/85 px-3 py-2 shadow-sm backdrop-blur">
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
                <Menu>
                  <Menu.Trigger aria-label="Add operation">
                    <Button
                      type="button"
                      intent="secondary"
                      size="sm"
                      isDisabled={!canEdit || isSelectedResourceCollapsed || isApiCollapsed}
                    >
                      <Plus className="h-4 w-4" />
                      Add operation
                    </Button>
                  </Menu.Trigger>
                  <Menu.Content placement="bottom end">
                    {HTTP_METHODS.map((method) => (
                      <Menu.Item
                        key={method}
                        isDisabled={selectedResourceMethods.has(method)}
                        onAction={() => addOperation(method)}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${METHOD_DOT_CLASS[method]}`}
                          />
                          <Menu.Label>{method.toUpperCase()}</Menu.Label>
                        </div>
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu>
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
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/85 px-3 py-2 shadow-sm backdrop-blur">
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
            <Button
              type="button"
              intent="secondary"
              size="sm"
              onPress={handleShareSpec}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Menu>
              <Menu.Trigger aria-label="Download spec">
                <Button type="button" intent="secondary" size="sm">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </Menu.Trigger>
              <Menu.Content placement="bottom end">
                <Menu.Item onAction={() => handleDownloadSpec("json")}>
                  <Menu.Label>JSON</Menu.Label>
                </Menu.Item>
                <Menu.Item onAction={() => handleDownloadSpec("yaml")}>
                  <Menu.Label>YAML</Menu.Label>
                </Menu.Item>
              </Menu.Content>
            </Menu>
            <Tooltip>
              <Link
                href={templateHref}
                aria-label="Save as template"
                className={buttonStyles({ size: "sq-sm", intent: "secondary" })}
              >
                <LayoutTemplate size={16} />
              </Link>
              <Tooltip.Content>Save as template</Tooltip.Content>
            </Tooltip>
            <Tooltip>
              <Link
                href={historyHref}
                aria-label="Open history"
                className={buttonStyles({ size: "sq-sm", intent: "secondary" })}
              >
                <History size={16} />
              </Link>
              <Tooltip.Content>History</Tooltip.Content>
            </Tooltip>
            <Tooltip>
              <Link
                href={codeHref}
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
          onNodeClick={(event, node) => {
            if (event.detail >= 2) {
              if (node.id === "api") {
                toggleApiCollapse();
                return;
              }
              if (node.id.startsWith("resource:")) {
                const resourceId = node.id.replace("resource:", "");
                setFocusedTarget({ kind: "resource", resourceId });
                setCollapsedResourceIds((current) => {
                  const next = new Set(current);
                  if (next.has(resourceId)) {
                    next.delete(resourceId);
                  } else {
                    next.add(resourceId);
                  }
                  return next;
                });
                return;
              }
              if (node.id.startsWith("operation:")) {
                const [, resourceId, operationId] = node.id.split(":");
                setFocusedTarget({ kind: "operation", resourceId, operationId });
                setCollapsedOperationIds((current) => {
                  const next = new Set(current);
                  if (next.has(operationId)) {
                    next.delete(operationId);
                  } else {
                    next.add(operationId);
                  }
                  return next;
                });
                return;
              }
            }

            if (node.id === "api") {
              focusTarget({ kind: "api" });
              return;
            }
            if (node.id.startsWith("schema:")) {
              openInspector({
                kind: "schema",
                schemaId: node.id.replace("schema:", ""),
              });
              return;
            }
            if (node.id.startsWith("security:")) {
              const [, resourceId, operationId] = node.id.split(":");
              openInspector({
                kind: "operation",
                resourceId,
                operationId,
              });
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
              {sheetTarget?.kind === "schema" ? (
                <Badge intent="outline">Schema</Badge>
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
                : sheetTarget?.kind === "schema"
                  ? inspectedSchema?.name || "Schema"
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
                : sheetTarget?.kind === "schema"
                  ? "Edit a reusable schema referenced by request or response contracts."
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
            {sheetTarget?.kind === "schema" && inspectedSchema ? (
              <SchemaInspector
                canEdit={canEdit}
                schema={inspectedSchema}
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
                workflows={workflows}
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
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-medium text-foreground">Servers</h3>
            <p className="text-sm text-muted-fg">
              Multiple server entries imported from OpenAPI or defined here.
            </p>
          </div>
          <Button
            type="button"
            intent="secondary"
            size="sm"
            onPress={() =>
              setSpec((current) => ({
                ...current,
                servers: [
                  ...current.servers,
                  {
                    id: `server-${crypto.randomUUID()}`,
                    url: "",
                    description: "",
                  },
                ],
              }))
            }
            isDisabled={!canEdit}
          >
            <Plus className="h-4 w-4" />
            Add server
          </Button>
        </div>
        <div className="space-y-3">
          {spec.servers.map((server) => (
            <Card key={server.id} className="gap-0 py-0">
              <CardContent className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_1fr_auto]">
                <TextField
                  label="URL"
                  value={server.url}
                  onChange={(value) =>
                    setSpec((current) => ({
                      ...current,
                      servers: current.servers.map((currentServer) =>
                        currentServer.id === server.id
                          ? { ...currentServer, url: value }
                          : currentServer,
                      ),
                    }))
                  }
                  isDisabled={!canEdit}
                />
                <TextField
                  label="Description"
                  value={server.description}
                  onChange={(value) =>
                    setSpec((current) => ({
                      ...current,
                      servers: current.servers.map((currentServer) =>
                        currentServer.id === server.id
                          ? { ...currentServer, description: value }
                          : currentServer,
                      ),
                    }))
                  }
                  isDisabled={!canEdit}
                />
                <Button
                  type="button"
                  intent="plain"
                  size="sq-sm"
                  className="self-end"
                  onPress={() =>
                    setSpec((current) => ({
                      ...current,
                      servers: current.servers.filter(
                        (currentServer) => currentServer.id !== server.id,
                      ),
                    }))
                  }
                  isDisabled={!canEdit || spec.servers.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <Textarea
        label="Description"
        value={description}
        onChange={setDescription}
        isDisabled={!canEdit}
      />
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-medium text-foreground">Tags</h3>
            <p className="text-sm text-muted-fg">
              Shared tags imported from the spec and reusable across operations.
            </p>
          </div>
          <Button
            type="button"
            intent="secondary"
            size="sm"
            onPress={() =>
              setSpec((current) => ({
                ...current,
                tags: [...current.tags, createApiTag()],
              }))
            }
            isDisabled={!canEdit}
          >
            <Plus className="h-4 w-4" />
            Add tag
          </Button>
        </div>
        <div className="space-y-3">
          {spec.tags.map((tag) => (
            <Card key={tag.id} className="gap-0 py-0">
              <CardContent className="grid gap-3 px-4 py-4 lg:grid-cols-[180px_1fr_auto]">
                <TextField
                  label="Name"
                  value={tag.name}
                  onChange={(value) =>
                    setSpec((current) => ({
                      ...current,
                      tags: current.tags.map((currentTag) =>
                        currentTag.id === tag.id
                          ? { ...currentTag, name: value }
                          : currentTag,
                      ),
                    }))
                  }
                  isDisabled={!canEdit}
                />
                <TextField
                  label="Description"
                  value={tag.description}
                  onChange={(value) =>
                    setSpec((current) => ({
                      ...current,
                      tags: current.tags.map((currentTag) =>
                        currentTag.id === tag.id
                          ? { ...currentTag, description: value }
                          : currentTag,
                      ),
                    }))
                  }
                  isDisabled={!canEdit}
                />
                <Button
                  type="button"
                  intent="plain"
                  size="sq-sm"
                  className="self-end"
                  onPress={() =>
                    setSpec((current) => ({
                      ...current,
                      tags: current.tags.filter((currentTag) => currentTag.id !== tag.id),
                      resources: current.resources.map((resource) => ({
                        ...resource,
                        operations: resource.operations.map((operation) => ({
                          ...operation,
                          tags: operation.tags.filter((currentTag) => currentTag !== tag.name),
                        })),
                      })),
                    }))
                  }
                  isDisabled={!canEdit}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-medium text-foreground">Security schemes</h3>
            <p className="text-sm text-muted-fg">
              Authentication definitions imported from Swagger or OpenAPI.
            </p>
          </div>
          <Button
            type="button"
            intent="secondary"
            size="sm"
            onPress={() =>
              setSpec((current) => ({
                ...current,
                securitySchemes: [
                  ...current.securitySchemes,
                  createApiSecurityScheme(),
                ],
              }))
            }
            isDisabled={!canEdit}
          >
            <Plus className="h-4 w-4" />
            Add scheme
          </Button>
        </div>
        <div className="space-y-3">
          {spec.securitySchemes.map((scheme) => (
            <SecuritySchemeCard
              key={scheme.id}
              canEdit={canEdit}
              scheme={scheme}
              setSpec={setSpec}
            />
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-medium text-foreground">Schemas</h3>
            <p className="text-sm text-muted-fg">
              Reusable request and response models imported from OpenAPI or
              created here.
            </p>
          </div>
          <Button
            type="button"
            intent="secondary"
            size="sm"
            onPress={() =>
              setSpec((current) => ({
                ...current,
                schemas: [...current.schemas, createApiSchema()],
              }))
            }
            isDisabled={!canEdit}
          >
            <Plus className="h-4 w-4" />
            Add schema
          </Button>
        </div>
        {spec.schemas.length === 0 ? (
          <Card className="gap-0 py-0">
            <CardContent className="px-4 py-4 text-sm text-muted-fg">
              No reusable schemas yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {spec.schemas.map((schema) => (
              <Card key={schema.id} className="gap-0 py-0">
                <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 py-4 pb-3">
                  <div className="min-w-0 flex-1">
                    <TextField
                      label="Name"
                      value={schema.name}
                      onChange={(value) =>
                        setSpec((current) => ({
                          ...current,
                          schemas: current.schemas.map((currentSchema) =>
                            currentSchema.id === schema.id
                              ? { ...currentSchema, name: value }
                              : currentSchema,
                          ),
                        }))
                      }
                      isDisabled={!canEdit}
                    />
                  </div>
                  <Button
                    type="button"
                    intent="plain"
                    size="sq-sm"
                    onPress={() =>
                      setSpec((current) => ({
                        ...current,
                        schemas: current.schemas.filter(
                          (currentSchema) => currentSchema.id !== schema.id,
                        ),
                        resources: current.resources.map((resource) => ({
                          ...resource,
                          operations: resource.operations.map((operation) => ({
                            ...operation,
                            requestBody: operation.requestBody
                              ? {
                                  ...operation.requestBody,
                                  schemaId:
                                    operation.requestBody.schemaId === schema.id
                                      ? null
                                      : operation.requestBody.schemaId,
                                }
                              : null,
                            responses: operation.responses.map((response) => ({
                              ...response,
                              schemaId:
                                response.schemaId === schema.id
                                  ? null
                                  : response.schemaId,
                            })),
                          })),
                        })),
                      }))
                    }
                    isDisabled={!canEdit}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4 pt-0">
                  <TextField
                    label="Description"
                    value={schema.description}
                    onChange={(value) =>
                      setSpec((current) => ({
                        ...current,
                        schemas: current.schemas.map((currentSchema) =>
                          currentSchema.id === schema.id
                            ? { ...currentSchema, description: value }
                            : currentSchema,
                        ),
                      }))
                    }
                    isDisabled={!canEdit}
                  />
                  <Textarea
                    label="Schema JSON"
                    value={schema.content}
                    onChange={(value) =>
                      setSpec((current) => ({
                        ...current,
                        schemas: current.schemas.map((currentSchema) =>
                          currentSchema.id === schema.id
                            ? { ...currentSchema, content: value }
                            : currentSchema,
                        ),
                      }))
                    }
                    isDisabled={!canEdit}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
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

function SchemaInspector({
  canEdit,
  schema,
  setSpec,
}: {
  canEdit: boolean;
  schema: ApiSchema;
  setSpec: SetApiSpec;
}) {
  const schemaObject = parseSchemaObject(schema.content);
  const schemaType =
    typeof schemaObject.type === "string" ? schemaObject.type : "object";
  const schemaEnum = Array.isArray(schemaObject.enum)
    ? schemaObject.enum.map(String).join(", ")
    : "";
  const schemaItemsType =
    typeof schemaObject.items?.type === "string"
      ? schemaObject.items.type
      : "string";
  const schemaProperties = Object.entries(schemaObject.properties ?? {}).map(
    ([name, value]) => {
      const property: Record<string, any> =
        typeof value === "object" && value !== null ? (value as Record<string, any>) : {};
      return {
        name,
        type: typeof property.type === "string" ? property.type : "string",
        description:
          typeof property.description === "string" ? property.description : "",
        required:
          Array.isArray(schemaObject.required) &&
          schemaObject.required.includes(name),
        itemsType:
          typeof property.items?.type === "string"
            ? property.items.type
            : "string",
      };
    },
  );

  function updateSchema(
    updater: (schemaObject: Record<string, any>) => Record<string, any>,
  ) {
    setSpec((current) => ({
      ...current,
      schemas: current.schemas.map((currentSchema) =>
        currentSchema.id === schema.id
          ? {
              ...currentSchema,
              content: updateStructuredSchemaContent(
                currentSchema.content,
                updater,
              ),
            }
          : currentSchema,
      ),
    }));
  }

  return (
    <div className="space-y-4">
      <TextField
        label="Name"
        value={schema.name}
        onChange={(value) =>
          setSpec((current) => ({
            ...current,
            schemas: current.schemas.map((currentSchema) =>
              currentSchema.id === schema.id
                ? { ...currentSchema, name: value }
                : currentSchema,
            ),
          }))
        }
        isDisabled={!canEdit}
      />
      <TextField
        label="Description"
        value={schema.description}
        onChange={(value) =>
          setSpec((current) => ({
            ...current,
            schemas: current.schemas.map((currentSchema) =>
              currentSchema.id === schema.id
                ? { ...currentSchema, description: value }
                : currentSchema,
            ),
          }))
        }
        isDisabled={!canEdit}
      />
      <Card className="gap-0 py-0">
        <CardHeader className="px-4 py-4 pb-3">
          <CardTitle>Structured schema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4 pt-0">
          <div className="grid gap-3 lg:grid-cols-2">
            <Select
              label="Type"
              selectedKey={schemaType}
              isDisabled={!canEdit}
              onSelectionChange={(key) =>
                updateSchema((currentSchemaObject) => {
                  const nextType = String(key);
                  const nextSchemaObject: Record<string, any> = {
                    ...currentSchemaObject,
                    type: nextType,
                  };

                  if (nextType === "object") {
                    nextSchemaObject.properties ??= {};
                    nextSchemaObject.required ??= [];
                    delete nextSchemaObject.items;
                  } else if (nextType === "array") {
                    nextSchemaObject.items ??= { type: "string" };
                    delete nextSchemaObject.properties;
                    delete nextSchemaObject.required;
                  } else {
                    delete nextSchemaObject.properties;
                    delete nextSchemaObject.required;
                    delete nextSchemaObject.items;
                  }

                  return nextSchemaObject;
                })
              }
            >
              <SelectTrigger />
              <SelectList>
                <SelectOption id="object">object</SelectOption>
                <SelectOption id="array">array</SelectOption>
                {PARAMETER_TYPES.map((type) => (
                  <SelectOption key={type} id={type}>
                    {type}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
            <TextField
              label="Enum values"
              description="Comma-separated"
              value={schemaEnum}
              onChange={(value) =>
                updateSchema((currentSchemaObject) => {
                  const nextEnum = value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean);
                  if (!nextEnum.length) {
                    const { enum: _enum, ...rest } = currentSchemaObject;
                    return rest;
                  }
                  return {
                    ...currentSchemaObject,
                    enum: nextEnum,
                  };
                })
              }
              isDisabled={!canEdit}
            />
          </div>
          {schemaType === "array" ? (
            <Select
              label="Items type"
              selectedKey={schemaItemsType}
              isDisabled={!canEdit}
              onSelectionChange={(key) =>
                updateSchema((currentSchemaObject) => ({
                  ...currentSchemaObject,
                  items: {
                    ...(typeof currentSchemaObject.items === "object" &&
                    currentSchemaObject.items !== null
                      ? currentSchemaObject.items
                      : {}),
                    type: String(key),
                  },
                }))
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
          ) : null}
          {schemaType === "object" ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-medium text-foreground">Properties</h4>
                  <p className="text-sm text-muted-fg">
                    Define the fields of this object schema.
                  </p>
                </div>
                <Menu>
                  <Menu.Trigger aria-label="Add property">
                    <Button
                      type="button"
                      intent="secondary"
                      size="sm"
                      isDisabled={!canEdit}
                    >
                      <Plus className="h-4 w-4" />
                      Add property
                    </Button>
                  </Menu.Trigger>
                  <Menu.Content placement="bottom end">
                    {[
                      { id: "string", label: "String", property: { type: "string" } },
                      { id: "object", label: "Object", property: { type: "object", properties: {}, required: [] } },
                      { id: "array", label: "Array", property: { type: "array", items: { type: "string" } } },
                    ].map((preset) => (
                      <Menu.Item
                        key={preset.id}
                        onAction={() =>
                          updateSchema((currentSchemaObject) => {
                            const currentProperties =
                              typeof currentSchemaObject.properties === "object" &&
                              currentSchemaObject.properties !== null
                                ? currentSchemaObject.properties
                                : {};
                            let index = Object.keys(currentProperties).length + 1;
                            let nextName = `property${index}`;
                            while (nextName in currentProperties) {
                              index += 1;
                              nextName = `property${index}`;
                            }
                            return {
                              ...currentSchemaObject,
                              properties: {
                                ...currentProperties,
                                [nextName]: preset.property,
                              },
                            };
                          })
                        }
                      >
                        <Menu.Label>{preset.label}</Menu.Label>
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu>
              </div>
              {schemaProperties.length ? (
                <div className="space-y-3">
                  {schemaProperties.map((property) => (
                    <div
                      key={property.name}
                      className="rounded-lg border border-border/60 p-3"
                    >
                      <div className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
                        <TextField
                          label="Name"
                          value={property.name}
                          onChange={(value) =>
                            updateSchema((currentSchemaObject) => {
                              const currentProperties =
                                typeof currentSchemaObject.properties ===
                                  "object" &&
                                currentSchemaObject.properties !== null
                                  ? currentSchemaObject.properties
                                  : {};
                              const currentProperty =
                                currentProperties[property.name] ?? {
                                  type: "string",
                                };
                              const nextProperties = {
                                ...currentProperties,
                              };
                              delete nextProperties[property.name];
                              nextProperties[value || property.name] =
                                currentProperty;

                              const currentRequired = Array.isArray(
                                currentSchemaObject.required,
                              )
                                ? currentSchemaObject.required
                                : [];
                              return {
                                ...currentSchemaObject,
                                properties: nextProperties,
                                required: currentRequired.map((item) =>
                                  item === property.name
                                    ? value || property.name
                                    : item,
                                ),
                              };
                            })
                          }
                          isDisabled={!canEdit}
                        />
                        <Select
                          label="Type"
                          selectedKey={property.type}
                          isDisabled={!canEdit}
                          onSelectionChange={(key) =>
                            updateSchema((currentSchemaObject) => {
                              const nextType = String(key);
                              const currentProperties =
                                typeof currentSchemaObject.properties ===
                                  "object" &&
                                currentSchemaObject.properties !== null
                                  ? currentSchemaObject.properties
                                  : {};
                              const currentProperty =
                                typeof currentProperties[property.name] ===
                                  "object" &&
                                currentProperties[property.name] !== null
                                  ? (currentProperties[property.name] as Record<
                                      string,
                                      any
                                    >)
                                  : {};
                              const nextProperty: Record<string, any> = {
                                ...currentProperty,
                                type: nextType,
                              };

                              if (nextType === "array") {
                                nextProperty.items ??= { type: "string" };
                                delete nextProperty.properties;
                                delete nextProperty.required;
                              } else if (nextType === "object") {
                                nextProperty.properties ??= {};
                                nextProperty.required ??= [];
                                delete nextProperty.items;
                              } else {
                                delete nextProperty.items;
                                delete nextProperty.properties;
                                delete nextProperty.required;
                              }

                              return {
                                ...currentSchemaObject,
                                properties: {
                                  ...currentProperties,
                                  [property.name]: nextProperty,
                                },
                              };
                            })
                          }
                        >
                          <SelectTrigger />
                          <SelectList>
                            <SelectOption id="object">object</SelectOption>
                            <SelectOption id="array">array</SelectOption>
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
                            updateSchema((currentSchemaObject) => {
                              const currentProperties =
                                typeof currentSchemaObject.properties ===
                                  "object" &&
                                currentSchemaObject.properties !== null
                                  ? currentSchemaObject.properties
                                  : {};
                              const nextProperties = {
                                ...currentProperties,
                              };
                              delete nextProperties[property.name];
                              const currentRequired = Array.isArray(
                                currentSchemaObject.required,
                              )
                                ? currentSchemaObject.required
                                : [];
                              return {
                                ...currentSchemaObject,
                                properties: nextProperties,
                                required: currentRequired.filter(
                                  (item) => item !== property.name,
                                ),
                              };
                            })
                          }
                          isDisabled={!canEdit}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
                        <TextField
                          label="Description"
                          value={property.description}
                          onChange={(value) =>
                            updateSchema((currentSchemaObject) => {
                              const currentProperties =
                                typeof currentSchemaObject.properties ===
                                  "object" &&
                                currentSchemaObject.properties !== null
                                  ? currentSchemaObject.properties
                                  : {};
                              return {
                                ...currentSchemaObject,
                                properties: {
                                  ...currentProperties,
                                  [property.name]: {
                                    ...(typeof currentProperties[
                                      property.name
                                    ] === "object" &&
                                    currentProperties[property.name] !== null
                                      ? currentProperties[property.name]
                                      : {}),
                                    description: value,
                                  },
                                },
                              };
                            })
                          }
                          isDisabled={!canEdit}
                        />
                        <Checkbox
                          className="self-end pb-2"
                          isSelected={property.required}
                          onChange={(isSelected) =>
                            updateSchema((currentSchemaObject) => {
                              const currentRequired = Array.isArray(
                                currentSchemaObject.required,
                              )
                                ? currentSchemaObject.required
                                : [];
                              return {
                                ...currentSchemaObject,
                                required: isSelected
                                  ? Array.from(
                                      new Set([
                                        ...currentRequired,
                                        property.name,
                                      ]),
                                    )
                                  : currentRequired.filter(
                                      (item) => item !== property.name,
                                    ),
                              };
                            })
                          }
                          isDisabled={!canEdit}
                          label="Required"
                        />
                      </div>
                      {property.type === "array" ? (
                        <div className="mt-3 grid gap-3 lg:grid-cols-[220px_1fr]">
                          <Select
                            label="Items type"
                            selectedKey={property.itemsType}
                            isDisabled={!canEdit}
                            onSelectionChange={(key) =>
                              updateSchema((currentSchemaObject) => {
                                const currentProperties =
                                  typeof currentSchemaObject.properties ===
                                    "object" &&
                                  currentSchemaObject.properties !== null
                                    ? currentSchemaObject.properties
                                    : {};
                                const currentProperty =
                                  typeof currentProperties[property.name] ===
                                    "object" &&
                                  currentProperties[property.name] !== null
                                    ? (currentProperties[
                                        property.name
                                      ] as Record<string, any>)
                                    : {};
                                return {
                                  ...currentSchemaObject,
                                  properties: {
                                    ...currentProperties,
                                    [property.name]: {
                                      ...currentProperty,
                                      items: {
                                        ...(typeof currentProperty.items ===
                                          "object" &&
                                        currentProperty.items !== null
                                          ? currentProperty.items
                                          : {}),
                                        type: String(key),
                                      },
                                    },
                                  },
                                };
                              })
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
                        </div>
                      ) : null}
                      {property.type === "object" ? (
                        <div className="mt-3 rounded-md border border-border/60 bg-secondary/20 px-3 py-2 text-xs text-muted-fg">
                          Nested object detected. Use the raw JSON editor below for
                          deeper nested properties.
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="gap-0 py-0">
                  <CardContent className="px-4 py-4 text-sm text-muted-fg">
                    No properties defined yet.
                  </CardContent>
                </Card>
              )}
            </section>
          ) : null}
        </CardContent>
      </Card>
      <Textarea
        label="Schema JSON"
        value={schema.content}
        onChange={(value) =>
          setSpec((current) => ({
            ...current,
            schemas: current.schemas.map((currentSchema) =>
              currentSchema.id === schema.id
                ? { ...currentSchema, content: value }
                : currentSchema,
            ),
          }))
        }
        isDisabled={!canEdit}
      />
    </div>
  );
}

function SecuritySchemeCard({
  canEdit,
  scheme,
  setSpec,
}: {
  canEdit: boolean;
  scheme: ApiSecurityScheme;
  setSpec: SetApiSpec;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="grid gap-3 px-4 py-4 lg:grid-cols-[180px_160px_1fr_auto]">
        <TextField
          label="Name"
          value={scheme.name}
          onChange={(value) =>
            setSpec((current) => ({
              ...current,
              securitySchemes: current.securitySchemes.map((currentScheme) =>
                currentScheme.id === scheme.id
                  ? { ...currentScheme, name: value }
                  : currentScheme,
              ),
            }))
          }
          isDisabled={!canEdit}
        />
        <Select
          label="Type"
          selectedKey={scheme.type}
          isDisabled={!canEdit}
          onSelectionChange={(key) =>
            setSpec((current) => ({
              ...current,
              securitySchemes: current.securitySchemes.map((currentScheme) =>
                currentScheme.id === scheme.id
                  ? { ...currentScheme, type: String(key) as ApiSecurityScheme["type"] }
                  : currentScheme,
              ),
            }))
          }
        >
          <SelectTrigger />
          <SelectList>
            <SelectOption id="apiKey">apiKey</SelectOption>
            <SelectOption id="http">http</SelectOption>
            <SelectOption id="oauth2">oauth2</SelectOption>
            <SelectOption id="openIdConnect">openIdConnect</SelectOption>
          </SelectList>
        </Select>
        <TextField
          label="Description"
          value={scheme.description}
          onChange={(value) =>
            setSpec((current) => ({
              ...current,
              securitySchemes: current.securitySchemes.map((currentScheme) =>
                currentScheme.id === scheme.id
                  ? { ...currentScheme, description: value }
                  : currentScheme,
              ),
            }))
          }
          isDisabled={!canEdit}
        />
        <Button
          type="button"
          intent="plain"
          size="sq-sm"
          className="self-end"
          onPress={() =>
            setSpec((current) => ({
              ...current,
              securitySchemes: current.securitySchemes.filter(
                (currentScheme) => currentScheme.id !== scheme.id,
              ),
              resources: current.resources.map((resource) => ({
                ...resource,
                operations: resource.operations.map((operation) => ({
                  ...operation,
                  security: operation.security.filter(
                    (currentSecurity) => currentSecurity.schemeName !== scheme.name,
                  ),
                })),
              })),
            }))
          }
          isDisabled={!canEdit}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function OperationInspector({
  canEdit,
  resource,
  operation,
  removeOperation,
  workflows,
  spec,
  setSpec,
}: {
  canEdit: boolean;
  resource: ApiResource;
  operation: ApiOperation;
  removeOperation: (resourceId: string, operationId: string) => void;
  workflows: {
    id: string;
    name: string;
    description: string | null;
    owner: string;
    visibility: "public" | "private";
  }[];
  spec: ApiSpec;
  setSpec: SetApiSpec;
}) {
  const linkedWorkflow = workflows.find(
    (workflow) => workflow.id === operation.workflowId,
  );
  const availableTags = spec.tags;
  const availableSecuritySchemes = spec.securitySchemes;

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
        <Select
          label="Linked workflow"
          placeholder="No workflow linked"
          selectedKey={operation.workflowId ?? null}
          isDisabled={!canEdit}
          onSelectionChange={(key) =>
            setSpec((current) =>
              updateApiOperation(
                current,
                resource.id,
                operation.id,
                (currentOperation) => ({
                  ...currentOperation,
                  workflowId: key ? String(key) : null,
                }),
              ),
            )
          }
        >
          <SelectTrigger />
          <SelectList>
            <SelectOption id="">No workflow linked</SelectOption>
            {workflows.map((workflow) => (
              <SelectOption key={workflow.id} id={workflow.id}>
                {workflow.name}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
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
      <div className="grid gap-4 lg:grid-cols-2">
        <TextField
          label="Tags"
          description="Comma-separated tags for this operation."
          value={operation.tags.join(", ")}
          onChange={(value) =>
            setSpec((current) =>
              updateApiOperation(
                current,
                resource.id,
                operation.id,
                (currentOperation) => ({
                  ...currentOperation,
                  tags: value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                }),
              ),
            )
          }
          isDisabled={!canEdit}
        />
        <Checkbox
          className="self-end pb-2"
          isSelected={operation.deprecated}
          onChange={(isSelected) =>
            setSpec((current) =>
              updateApiOperation(
                current,
                resource.id,
                operation.id,
                (currentOperation) => ({
                  ...currentOperation,
                  deprecated: isSelected,
                }),
              ),
            )
          }
          isDisabled={!canEdit}
          label="Deprecated"
        />
      </div>
      {availableTags.length ? (
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <Badge
              key={tag.id}
              intent={operation.tags.includes(tag.name) ? "secondary" : "outline"}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      ) : null}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-medium text-foreground">Security</h3>
            <p className="text-sm text-muted-fg">
              Security requirements applied to this operation.
            </p>
          </div>
          <Menu>
            <Menu.Trigger aria-label="Add security requirement">
              <Button
                type="button"
                intent="secondary"
                size="sm"
                isDisabled={!canEdit || availableSecuritySchemes.length === 0}
              >
                <Plus className="h-4 w-4" />
                Add security
              </Button>
            </Menu.Trigger>
            <Menu.Content placement="bottom end">
              {availableSecuritySchemes.map((scheme) => {
                const isUsed = operation.security.some(
                  (currentSecurity) => currentSecurity.schemeName === scheme.name,
                );
                return (
                  <Menu.Item
                    key={scheme.id}
                    isDisabled={isUsed}
                    onAction={() =>
                      setSpec((current) =>
                        updateApiOperation(
                          current,
                          resource.id,
                          operation.id,
                          (currentOperation) => ({
                            ...currentOperation,
                            security: [
                              ...currentOperation.security,
                              {
                                id: `security-requirement-${crypto.randomUUID()}`,
                                schemeName: scheme.name,
                                scopes: [],
                              },
                            ],
                          }),
                        ),
                      )
                    }
                  >
                    <Menu.Label>{scheme.name}</Menu.Label>
                  </Menu.Item>
                );
              })}
            </Menu.Content>
          </Menu>
        </div>
        {operation.security.length ? (
          <div className="space-y-3">
            {operation.security.map((security) => (
              <Card key={security.id} className="gap-0 py-0">
                <CardContent className="grid gap-3 px-4 py-4 lg:grid-cols-[180px_1fr_auto]">
                  <Select
                    label="Scheme"
                    selectedKey={security.schemeName}
                    isDisabled={!canEdit}
                    onSelectionChange={(key) =>
                      setSpec((current) =>
                        updateApiOperation(
                          current,
                          resource.id,
                          operation.id,
                          (currentOperation) => ({
                            ...currentOperation,
                            security: currentOperation.security.map(
                              (currentSecurity) =>
                                currentSecurity.id === security.id
                                  ? {
                                      ...currentSecurity,
                                      schemeName: String(key),
                                    }
                                  : currentSecurity,
                            ),
                          }),
                        ),
                      )
                    }
                  >
                    <SelectTrigger />
                    <SelectList>
                      {availableSecuritySchemes.map((scheme) => (
                        <SelectOption key={scheme.id} id={scheme.name}>
                          {scheme.name}
                        </SelectOption>
                      ))}
                    </SelectList>
                  </Select>
                  <TextField
                    label="Scopes"
                    value={security.scopes.join(", ")}
                    onChange={(value) =>
                      setSpec((current) =>
                        updateApiOperation(
                          current,
                          resource.id,
                          operation.id,
                          (currentOperation) => ({
                            ...currentOperation,
                            security: currentOperation.security.map(
                              (currentSecurity) =>
                                currentSecurity.id === security.id
                                  ? {
                                      ...currentSecurity,
                                      scopes: value
                                        .split(",")
                                        .map((scope) => scope.trim())
                                        .filter(Boolean),
                                    }
                                  : currentSecurity,
                            ),
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
                            security: currentOperation.security.filter(
                              (currentSecurity) => currentSecurity.id !== security.id,
                            ),
                          }),
                        ),
                      )
                    }
                    isDisabled={!canEdit}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="gap-0 py-0">
            <CardContent className="px-4 py-4 text-sm text-muted-fg">
              No security requirements applied to this operation.
            </CardContent>
          </Card>
        )}
      </section>

      {linkedWorkflow ? (
        <Card className="gap-0 py-0">
          <CardHeader className="px-4 py-4 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium">
                  Linked workflow
                </CardTitle>
                <p className="text-sm text-muted-fg">{linkedWorkflow.name}</p>
              </div>
              <Badge
                intent={
                  linkedWorkflow.visibility === "public"
                    ? "warning"
                    : "secondary"
                }
              >
                {linkedWorkflow.visibility === "public" ? "Starter" : "Private"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3 px-4 pb-4 pt-0">
            <p className="line-clamp-2 text-sm text-muted-fg">
              {linkedWorkflow.description || "No workflow description."}
            </p>
            <Link
              href={`/app/camel/workflows/${linkedWorkflow.id}/studio`}
              className={buttonStyles({ intent: "secondary", size: "sm" })}
            >
              Open
            </Link>
          </CardContent>
        </Card>
      ) : null}

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
  const schemaOptions = spec.schemas;
  const selectedRequestSchema = operation.requestBody?.schemaId
    ? schemaOptions.find(
        (schema) => schema.id === operation.requestBody?.schemaId,
      )
    : null;
  const sectionOrder =
    initialFocus === "requestBody"
      ? (["parameters", "requestBody", "responses"] as const)
      : (["parameters", "responses", "requestBody"] as const);

  function updateRequestBody(
    updater: (
      requestBody: NonNullable<ApiOperation["requestBody"]>,
    ) => NonNullable<ApiOperation["requestBody"]>,
  ) {
    setSpec((current) =>
      updateApiOperation(
        current,
        resource.id,
        operation.id,
        (currentOperation) => ({
          ...currentOperation,
          requestBody: currentOperation.requestBody
            ? updater(currentOperation.requestBody)
            : null,
        }),
      ),
    );
  }

  const parameterSection = (
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
          <Plus className="h-4 w-4" />
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
                <Trash2 className="h-4 w-4" />
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
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <TextField
                label="Format"
                value={parameter.format}
                onChange={(value) =>
                  setSpec((current) =>
                    updateApiParameter(
                      current,
                      resource.id,
                      operation.id,
                      parameter.id,
                      (currentParameter) => ({
                        ...currentParameter,
                        format: value,
                      }),
                    ),
                  )
                }
                isDisabled={!canEdit}
              />
              <TextField
                label="Default"
                value={parameter.defaultValue}
                onChange={(value) =>
                  setSpec((current) =>
                    updateApiParameter(
                      current,
                      resource.id,
                      operation.id,
                      parameter.id,
                      (currentParameter) => ({
                        ...currentParameter,
                        defaultValue: value,
                      }),
                    ),
                  )
                }
                isDisabled={!canEdit}
              />
              <TextField
                label="Enum values"
                description="Comma-separated"
                value={parameter.enum.join(", ")}
                onChange={(value) =>
                  setSpec((current) =>
                    updateApiParameter(
                      current,
                      resource.id,
                      operation.id,
                      parameter.id,
                      (currentParameter) => ({
                        ...currentParameter,
                        enum: value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      }),
                    ),
                  )
                }
                isDisabled={!canEdit}
              />
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-[auto_220px]">
              <Checkbox
                isSelected={parameter.isArray}
                onChange={(isSelected) =>
                  setSpec((current) =>
                    updateApiParameter(
                      current,
                      resource.id,
                      operation.id,
                      parameter.id,
                      (currentParameter) => ({
                        ...currentParameter,
                        isArray: isSelected,
                      }),
                    ),
                  )
                }
                isDisabled={!canEdit}
                label="Array parameter"
              />
              {parameter.isArray ? (
                <Select
                  label="Item type"
                  selectedKey={parameter.itemType}
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
                          itemType: String(key) as ApiParameter["type"],
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
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const requestBodySection =
    operation.method === "post" ||
    operation.method === "put" ||
    operation.method === "patch" ||
    operation.requestBody ? (
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-medium text-foreground">Request body</h3>
            <p className="text-sm text-muted-fg">
              Describe payload expectations for body-based requests.
            </p>
          </div>
          {!operation.requestBody ? (
            <Menu>
              <Menu.Trigger aria-label="Add request body">
                <Button
                  type="button"
                  intent="secondary"
                  size="sm"
                  isDisabled={!canEdit}
                >
                  <Plus className="h-4 w-4" />
                  Add body
                </Button>
              </Menu.Trigger>
              <Menu.Content placement="bottom end">
                {REQUEST_BODY_PRESETS.map((preset) => (
                  <Menu.Item
                    key={preset.contentType}
                    onAction={() =>
                      setSpec((current) =>
                        updateApiOperation(
                          current,
                          resource.id,
                          operation.id,
                          (currentOperation) => ({
                            ...currentOperation,
                            requestBody: {
                              contentType: preset.contentType,
                              required: true,
                              description: preset.description,
                              example: "",
                              schemaId: null,
                            },
                          }),
                        ),
                      )
                    }
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Menu.Label>{preset.contentType}</Menu.Label>
                      <span className="text-xs text-muted-fg">
                        {preset.description}
                      </span>
                    </div>
                  </Menu.Item>
                ))}
                <Menu.Separator />
                <Menu.Item
                  onAction={() =>
                    setSpec((current) =>
                      updateApiOperation(
                        current,
                        resource.id,
                        operation.id,
                        (currentOperation) => ({
                          ...currentOperation,
                          requestBody: {
                            contentType: "",
                            required: true,
                            description: "",
                            example: "",
                            schemaId: null,
                          },
                        }),
                      ),
                    )
                  }
                >
                  <Menu.Label>Custom</Menu.Label>
                </Menu.Item>
              </Menu.Content>
            </Menu>
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
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>

        {operation.requestBody ? (
          <Card className="gap-0 py-0">
            <CardHeader className="px-4 py-4 pb-3">
              <div className="flex items-center gap-2">
                <Badge intent="secondary">Payload</Badge>
                <Badge
                  intent={
                    operation.requestBody.required ? "warning" : "outline"
                  }
                >
                  {operation.requestBody.required ? "Required" : "Optional"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4 pt-0">
              <div className="grid gap-3 lg:grid-cols-[220px_auto]">
                <TextField
                  label="Content type"
                  value={operation.requestBody.contentType}
                  onChange={(value) =>
                    updateRequestBody((currentRequestBody) => ({
                      ...currentRequestBody,
                      contentType: value,
                    }))
                  }
                  isDisabled={!canEdit}
                />
                <Checkbox
                  className="self-end pb-2"
                  isSelected={operation.requestBody.required}
                  onChange={(isSelected) =>
                    updateRequestBody((currentRequestBody) => ({
                      ...currentRequestBody,
                      required: isSelected,
                    }))
                  }
                  isDisabled={!canEdit}
                  label="Required body"
                />
              </div>
              <Select
                label="Schema"
                selectedKey={operation.requestBody.schemaId ?? "none"}
                isDisabled={!canEdit}
                onSelectionChange={(key) =>
                  updateRequestBody((currentRequestBody) => ({
                    ...currentRequestBody,
                    schemaId: String(key) === "none" ? null : String(key),
                  }))
                }
              >
                <SelectTrigger />
                <SelectList>
                  <SelectOption id="none">No schema</SelectOption>
                  {schemaOptions.map((schema) => (
                    <SelectOption key={schema.id} id={schema.id}>
                      {schema.name}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
              {selectedRequestSchema
                ? (() => {
                    const summary = summarizeSchemaContent(
                      selectedRequestSchema.content,
                    );
                    return (
                      <Card className="gap-0 py-0">
                        <CardHeader className="px-4 py-4 pb-3">
                          <div className="flex items-center gap-2">
                            <Badge intent="secondary">Schema</Badge>
                            <span className="text-sm font-medium text-foreground">
                              {selectedRequestSchema.name}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 px-4 pb-4 pt-0">
                          {selectedRequestSchema.description ? (
                            <p className="text-sm text-muted-fg">
                              {selectedRequestSchema.description}
                            </p>
                          ) : null}
                          <div className="flex flex-wrap gap-2">
                            {summary.type ? (
                              <Badge intent="outline">Type: {summary.type}</Badge>
                            ) : null}
                            {summary.properties !== null ? (
                              <Badge intent="outline">
                                {summary.properties} props
                              </Badge>
                            ) : null}
                            {summary.required > 0 ? (
                              <Badge intent="outline">
                                {summary.required} required
                              </Badge>
                            ) : null}
                            {summary.enumCount > 0 ? (
                              <Badge intent="outline">
                                {summary.enumCount} enum values
                              </Badge>
                            ) : null}
                            {summary.itemsType ? (
                              <Badge intent="outline">
                                Items: {summary.itemsType}
                              </Badge>
                            ) : null}
                          </div>
                          <pre className="overflow-x-auto rounded-md border border-border/60 bg-secondary/20 p-3 text-xs text-muted-fg">
                            <code>{selectedRequestSchema.content}</code>
                          </pre>
                        </CardContent>
                      </Card>
                    );
                  })()
                : null}
              <TextField
                label="Description"
                value={operation.requestBody.description}
                onChange={(value) =>
                  updateRequestBody((currentRequestBody) => ({
                    ...currentRequestBody,
                    description: value,
                  }))
                }
                isDisabled={!canEdit}
              />
              <Textarea
                label="Example"
                value={operation.requestBody.example}
                onChange={(value) =>
                  updateRequestBody((currentRequestBody) => ({
                    ...currentRequestBody,
                    example: value,
                  }))
                }
                isDisabled={!canEdit}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="gap-0 py-0">
            <CardContent className="px-4 py-4 text-sm text-muted-fg">
              This operation does not currently define a request body.
            </CardContent>
          </Card>
        )}
      </section>
    ) : null;

  const responseSection = (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-medium text-foreground">Responses</h3>
          <p className="text-sm text-muted-fg">
            Status codes and payload examples returned by this operation.
          </p>
        </div>
        <Menu>
          <Menu.Trigger aria-label="Add response">
            <Button
              type="button"
              intent="secondary"
              size="sm"
              isDisabled={!canEdit}
            >
              <Plus className="h-4 w-4" />
              Add response
            </Button>
          </Menu.Trigger>
          <Menu.Content placement="bottom end">
            {RESPONSE_PRESETS.map((preset) => {
              const isUsed = operation.responses.some(
                (response) => response.statusCode === preset.statusCode,
              );
              return (
                <Menu.Item
                  key={preset.statusCode}
                  isDisabled={isUsed}
                  onAction={() =>
                    setSpec((current) =>
                      updateApiOperation(
                        current,
                        resource.id,
                        operation.id,
                        (currentOperation) => ({
                          ...currentOperation,
                          responses: [
                            ...currentOperation.responses,
                            createApiResponse({
                              statusCode: preset.statusCode,
                              description: preset.description,
                            }),
                          ],
                        }),
                      ),
                    )
                  }
                >
                  <div className="flex items-center justify-between gap-4">
                    <Menu.Label>{preset.statusCode}</Menu.Label>
                    <span className="text-xs text-muted-fg">
                      {preset.description}
                    </span>
                  </div>
                </Menu.Item>
              );
            })}
            <Menu.Separator />
            <Menu.Item
              onAction={() =>
                setSpec((current) =>
                  updateApiOperation(
                    current,
                    resource.id,
                    operation.id,
                    (currentOperation) => ({
                      ...currentOperation,
                      responses: [
                        ...currentOperation.responses,
                        createApiResponse({
                          statusCode: "",
                          description: "",
                        }),
                      ],
                    }),
                  ),
                )
              }
            >
              <Menu.Label>Custom</Menu.Label>
            </Menu.Item>
          </Menu.Content>
        </Menu>
      </div>
      {operation.responses.length === 0 ? (
        <Card className="gap-0 py-0">
          <CardContent className="px-4 py-4 text-sm text-muted-fg">
            No responses defined yet. Add at least one response contract.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {operation.responses.map((response) => (
            <Card key={response.id} className="gap-0 py-0">
              <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 py-4 pb-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge intent="secondary">
                      {response.statusCode || "Response"}
                    </Badge>
                    <span className="text-sm text-muted-fg">
                      {response.description || "No response description yet."}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  intent="plain"
                  size="sq-sm"
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
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4 pt-0">
                {response.schemaId
                  ? (() => {
                      const linkedSchema = schemaOptions.find(
                        (schema) => schema.id === response.schemaId,
                      );
                      if (!linkedSchema) return null;
                      const summary = summarizeSchemaContent(
                        linkedSchema.content,
                      );
                      return (
                        <Card className="gap-0 py-0">
                          <CardHeader className="px-4 py-4 pb-3">
                            <div className="flex items-center gap-2">
                              <Badge intent="secondary">Schema</Badge>
                              <span className="text-sm font-medium text-foreground">
                                {linkedSchema.name}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2 px-4 pb-4 pt-0">
                            {linkedSchema.description ? (
                              <p className="text-sm text-muted-fg">
                                {linkedSchema.description}
                              </p>
                            ) : null}
                            <div className="flex flex-wrap gap-2">
                              {summary.type ? (
                                <Badge intent="outline">Type: {summary.type}</Badge>
                              ) : null}
                              {summary.properties !== null ? (
                                <Badge intent="outline">
                                  {summary.properties} props
                                </Badge>
                              ) : null}
                              {summary.required > 0 ? (
                                <Badge intent="outline">
                                  {summary.required} required
                                </Badge>
                              ) : null}
                              {summary.enumCount > 0 ? (
                                <Badge intent="outline">
                                  {summary.enumCount} enum values
                                </Badge>
                              ) : null}
                              {summary.itemsType ? (
                                <Badge intent="outline">
                                  Items: {summary.itemsType}
                                </Badge>
                              ) : null}
                            </div>
                            <pre className="overflow-x-auto rounded-md border border-border/60 bg-secondary/20 p-3 text-xs text-muted-fg">
                              <code>{linkedSchema.content}</code>
                            </pre>
                          </CardContent>
                        </Card>
                      );
                    })()
                  : null}
                <div className="grid gap-3 lg:grid-cols-[140px_1fr]">
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
                  <Select
                    label="Schema"
                    selectedKey={response.schemaId ?? "none"}
                    isDisabled={!canEdit}
                    onSelectionChange={(key) =>
                      setSpec((current) =>
                        updateApiResponse(
                          current,
                          resource.id,
                          operation.id,
                          response.id,
                          (currentResponse) => ({
                            ...currentResponse,
                            schemaId:
                              String(key) === "none" ? null : String(key),
                          }),
                        ),
                      )
                    }
                  >
                    <SelectTrigger />
                    <SelectList>
                      <SelectOption id="none">No schema</SelectOption>
                      {schemaOptions.map((schema) => (
                        <SelectOption key={schema.id} id={schema.id}>
                          {schema.name}
                        </SelectOption>
                      ))}
                    </SelectList>
                  </Select>
                </div>
                <Textarea
                  label="Example"
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
                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-medium text-foreground">Headers</h4>
                      <p className="text-sm text-muted-fg">
                        Response headers returned with this status.
                      </p>
                    </div>
                    <Button
                      type="button"
                      intent="secondary"
                      size="sm"
                      onPress={() =>
                        setSpec((current) =>
                          updateApiResponse(
                            current,
                            resource.id,
                            operation.id,
                            response.id,
                            (currentResponse) => ({
                              ...currentResponse,
                              headers: [
                                ...currentResponse.headers,
                                createApiResponseHeader(),
                              ],
                            }),
                          ),
                        )
                      }
                      isDisabled={!canEdit}
                    >
                      <Plus className="h-4 w-4" />
                      Add header
                    </Button>
                  </div>
                  {response.headers.length ? (
                    <div className="space-y-3">
                      {response.headers.map((header) => (
                        <div
                          key={header.id}
                          className="grid gap-3 rounded-lg border border-border/60 p-3 lg:grid-cols-[1fr_160px_1fr_auto]"
                        >
                          <TextField
                            label="Name"
                            value={header.name}
                            onChange={(value) =>
                              setSpec((current) =>
                                updateApiResponse(
                                  current,
                                  resource.id,
                                  operation.id,
                                  response.id,
                                  (currentResponse) => ({
                                    ...currentResponse,
                                    headers: currentResponse.headers.map(
                                      (currentHeader) =>
                                        currentHeader.id === header.id
                                          ? { ...currentHeader, name: value }
                                          : currentHeader,
                                    ),
                                  }),
                                ),
                              )
                            }
                            isDisabled={!canEdit}
                          />
                          <Select
                            label="Type"
                            selectedKey={header.type}
                            isDisabled={!canEdit}
                            onSelectionChange={(key) =>
                              setSpec((current) =>
                                updateApiResponse(
                                  current,
                                  resource.id,
                                  operation.id,
                                  response.id,
                                  (currentResponse) => ({
                                    ...currentResponse,
                                    headers: currentResponse.headers.map(
                                      (currentHeader) =>
                                        currentHeader.id === header.id
                                          ? {
                                              ...currentHeader,
                                              type: String(key) as ApiParameter["type"],
                                            }
                                          : currentHeader,
                                    ),
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
                          <TextField
                            label="Description"
                            value={header.description}
                            onChange={(value) =>
                              setSpec((current) =>
                                updateApiResponse(
                                  current,
                                  resource.id,
                                  operation.id,
                                  response.id,
                                  (currentResponse) => ({
                                    ...currentResponse,
                                    headers: currentResponse.headers.map(
                                      (currentHeader) =>
                                        currentHeader.id === header.id
                                          ? {
                                              ...currentHeader,
                                              description: value,
                                            }
                                          : currentHeader,
                                    ),
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
                                updateApiResponse(
                                  current,
                                  resource.id,
                                  operation.id,
                                  response.id,
                                  (currentResponse) => ({
                                    ...currentResponse,
                                    headers: currentResponse.headers.filter(
                                      (currentHeader) =>
                                        currentHeader.id !== header.id,
                                    ),
                                  }),
                                ),
                              )
                            }
                            isDisabled={!canEdit}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card className="gap-0 py-0">
                      <CardContent className="px-4 py-4 text-sm text-muted-fg">
                        No headers defined for this response.
                      </CardContent>
                    </Card>
                  )}
                </section>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );

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
      {sectionOrder.map((section) => {
        if (section === "parameters")
          return (
            <React.Fragment key={section}>{parameterSection}</React.Fragment>
          );
        if (section === "requestBody" && requestBodySection) {
          return (
            <React.Fragment key={section}>{requestBodySection}</React.Fragment>
          );
        }
        if (section === "responses")
          return (
            <React.Fragment key={section}>{responseSection}</React.Fragment>
          );
        return null;
      })}
    </div>
  );
}
