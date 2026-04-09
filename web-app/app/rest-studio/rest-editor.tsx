import {
  createApiOperation,
  createApiParameter,
  createApiResource,
  createApiResponse,
  type ApiHttpMethod,
  type ApiOperation,
  type ApiParameter,
  type ApiResource,
  type ApiResponse,
  type ApiSpec,
} from "./rest-spec";
import { Badge } from "@/components/ui/badge";
import { Button } from "app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { Checkbox } from "app/components/ui/checkbox";
import {
  Select,
  SelectList,
  SelectOption,
  SelectTrigger,
} from "app/components/ui/select";
import { Tab, TabList, TabPanel, Tabs } from "app/components/ui/tabs";
import { TextField } from "app/components/ui/text-field";
import { Textarea } from "app/components/ui/textarea";
import {
  FolderTree,
  ListTree,
  Plus,
  Server,
  Settings2,
  Trash2,
} from "lucide-react";
import React from "react";

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

function updateResource(
  spec: ApiSpec,
  resourceId: string,
  updater: (resource: ApiResource) => ApiResource,
) {
  return {
    ...spec,
    resources: spec.resources.map((resource) =>
      resource.id === resourceId ? updater(resource) : resource,
    ),
  };
}

function updateOperation(
  spec: ApiSpec,
  resourceId: string,
  operationId: string,
  updater: (operation: ApiOperation) => ApiOperation,
) {
  return updateResource(spec, resourceId, (resource) => ({
    ...resource,
    operations: resource.operations.map((operation) =>
      operation.id === operationId ? updater(operation) : operation,
    ),
  }));
}

function updateParameter(
  spec: ApiSpec,
  resourceId: string,
  operationId: string,
  parameterId: string,
  updater: (parameter: ApiParameter) => ApiParameter,
) {
  return updateOperation(spec, resourceId, operationId, (operation) => ({
    ...operation,
    parameters: operation.parameters.map((parameter) =>
      parameter.id === parameterId ? updater(parameter) : parameter,
    ),
  }));
}

function updateResponse(
  spec: ApiSpec,
  resourceId: string,
  operationId: string,
  responseId: string,
  updater: (response: ApiResponse) => ApiResponse,
) {
  return updateOperation(spec, resourceId, operationId, (operation) => ({
    ...operation,
    responses: operation.responses.map((response) =>
      response.id === responseId ? updater(response) : response,
    ),
  }));
}

export function ApiEditor({
  initialSpec,
  initialName,
  initialDescription,
  canEdit,
}: {
  initialSpec: ApiSpec;
  initialName: string;
  initialDescription: string;
  canEdit: boolean;
}) {
  const [name, setName] = React.useState(initialName);
  const [description, setDescription] = React.useState(initialDescription);
  const [spec, setSpec] = React.useState<ApiSpec>(initialSpec);
  const [selectedSection, setSelectedSection] = React.useState<
    "overview" | "resources" | "operations"
  >("overview");
  const [selectedResourceId, setSelectedResourceId] = React.useState(
    initialSpec.resources[0]?.id ?? "",
  );
  const [selectedOperationId, setSelectedOperationId] = React.useState(
    initialSpec.resources[0]?.operations[0]?.id ?? "",
  );

  const selectedResource =
    spec.resources.find((resource) => resource.id === selectedResourceId) ??
    spec.resources[0];
  const selectedOperation =
    selectedResource?.operations.find(
      (operation) => operation.id === selectedOperationId,
    ) ?? selectedResource?.operations[0];
  const allOperations = React.useMemo(
    () =>
      spec.resources.flatMap((resource) =>
        resource.operations.map((operation) => ({
          resource,
          operation,
        })),
      ),
    [spec.resources],
  );

  React.useEffect(() => {
    setSpec((currentSpec) => ({
      ...currentSpec,
      info: {
        ...currentSpec.info,
        title: name,
        description,
      },
    }));
  }, [name, description]);

  React.useEffect(() => {
    if (!selectedResource && spec.resources[0]) {
      setSelectedResourceId(spec.resources[0].id);
    }
  }, [selectedResource, spec.resources]);

  React.useEffect(() => {
    if (!selectedOperation && selectedResource?.operations[0]) {
      setSelectedOperationId(selectedResource.operations[0].id);
    }
  }, [selectedOperation, selectedResource]);

  function addResource() {
    const resource = createApiResource({
      path: `/resource-${spec.resources.length + 1}`,
    });
    setSpec((currentSpec) => ({
      ...currentSpec,
      resources: [...currentSpec.resources, resource],
    }));
    setSelectedSection("resources");
    setSelectedResourceId(resource.id);
    setSelectedOperationId(resource.operations[0]?.id ?? "");
  }

  function removeResource(resourceId: string) {
    setSpec((currentSpec) => {
      const resources = currentSpec.resources.filter(
        (resource) => resource.id !== resourceId,
      );
      const nextResources = resources.length
        ? resources
        : [createApiResource()];
      setSelectedResourceId(nextResources[0]?.id ?? "");
      setSelectedOperationId(nextResources[0]?.operations[0]?.id ?? "");
      return {
        ...currentSpec,
        resources: nextResources,
      };
    });
  }

  function addOperation(method: ApiHttpMethod) {
    if (!selectedResource) return;
    const operation = createApiOperation(method);
    setSpec((currentSpec) =>
      updateResource(currentSpec, selectedResource.id, (resource) => ({
        ...resource,
        operations: [...resource.operations, operation],
      })),
    );
    setSelectedSection("operations");
    setSelectedOperationId(operation.id);
  }

  function removeOperation(operationId: string) {
    if (!selectedResource) return;
    setSpec((currentSpec) =>
      updateResource(currentSpec, selectedResource.id, (resource) => {
        const operations = resource.operations.filter(
          (operation) => operation.id !== operationId,
        );
        const nextOperations = operations.length
          ? operations
          : [createApiOperation("get")];
        setSelectedOperationId(nextOperations[0]?.id ?? "");
        return {
          ...resource,
          operations: nextOperations,
        };
      }),
    );
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="content" value={JSON.stringify(spec)} />

      <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_420px]">
        <Tabs
          aria-label="API sections"
          orientation="vertical"
          selectedKey={selectedSection}
          onSelectionChange={(key) =>
            setSelectedSection(
              (String(key) as "overview" | "resources" | "operations") ||
                "overview",
            )
          }
          className="xl:contents"
        >
          <Card className="sticky top-4 gap-0 self-start py-0 xl:col-start-1">
            <CardHeader className="px-4 py-4">
              <div>
                <CardTitle className="text-base">API sections</CardTitle>
                <p className="mt-1 text-sm text-muted-fg">
                  Navigate the main parts of the REST definition.
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <TabList className="w-full gap-y-2 border-l-0">
                <Tab
                  id="overview"
                  className="rounded-lg border border-border/60 py-2 pr-3 pl-3 selected:border-primary/60 selected:bg-primary/10"
                >
                  <Settings2 />
                  Basic info
                </Tab>
                <Tab
                  id="resources"
                  className="rounded-lg border border-border/60 py-2 pr-3 pl-3 selected:border-primary/60 selected:bg-primary/10"
                >
                  <FolderTree />
                  Resources
                </Tab>
                <Tab
                  id="operations"
                  className="rounded-lg border border-border/60 py-2 pr-3 pl-3 selected:border-primary/60 selected:bg-primary/10"
                >
                  <ListTree />
                  Operations
                </Tab>
              </TabList>
            </CardContent>
          </Card>

          <div className="space-y-4 xl:col-start-2">
            <TabPanel id="overview" className="space-y-4">
              <Card className="gap-0 py-0">
                <CardHeader className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">API overview</CardTitle>
                      <p className="mt-1 text-sm text-muted-fg">
                        Name, version, server, and the high-level description of
                        the API.
                      </p>
                    </div>
                    <Badge intent="secondary">Design</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 px-4 pb-4 pt-0 lg:grid-cols-2">
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
                      setSpec((currentSpec) => ({
                        ...currentSpec,
                        info: { ...currentSpec.info, version: value },
                      }))
                    }
                    isDisabled={!canEdit}
                  />
                  <TextField
                    label="Base server URL"
                    value={spec.servers[0]?.url ?? ""}
                    prefix={<Server className="h-4 w-4 text-muted-fg" />}
                    onChange={(value) =>
                      setSpec((currentSpec) => ({
                        ...currentSpec,
                        servers: currentSpec.servers.length
                          ? currentSpec.servers.map((server, index) =>
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
                    className="lg:col-span-2"
                    value={description}
                    onChange={setDescription}
                    isDisabled={!canEdit}
                  />
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel id="resources" className="space-y-4">
              <Card className="gap-0 py-0">
                <CardHeader className="px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">Resources</CardTitle>
                      <p className="mt-1 text-sm text-muted-fg">
                        Organize API paths and select which resource to edit.
                      </p>
                    </div>
                    <Button
                      type="button"
                      intent="secondary"
                      size="sm"
                      onPress={addResource}
                      isDisabled={!canEdit}
                    >
                      <Plus />
                      Add resource
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 px-4 pb-4 pt-0 md:grid-cols-2">
                  {spec.resources.map((resource) => {
                    const isSelected = resource.id === selectedResource?.id;
                    return (
                      <button
                        type="button"
                        key={resource.id}
                        onClick={() => {
                          setSelectedResourceId(resource.id);
                          setSelectedOperationId(
                            resource.operations[0]?.id ?? "",
                          );
                        }}
                        className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                          isSelected
                            ? "border-primary/60 bg-primary/10 shadow-card"
                            : "border-border/60 bg-background hover:border-primary/40 hover:bg-muted/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {resource.path}
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-fg">
                              {resource.summary || "No resource summary yet."}
                            </p>
                          </div>
                          <Badge intent="secondary">
                            {resource.operations.length}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {selectedResource ? (
                <Card className="gap-0 py-0">
                  <CardHeader className="px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">
                          Selected resource
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-fg">
                          Shape the path and describe what this resource
                          represents.
                        </p>
                      </div>
                      <Button
                        type="button"
                        intent="danger"
                        size="sq-sm"
                        onPress={() => removeResource(selectedResource.id)}
                        isDisabled={!canEdit}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 px-4 pb-4 pt-0 lg:grid-cols-2">
                    <TextField
                      label="Path"
                      description="Use REST-style paths like /orders or /orders/{id}."
                      value={selectedResource.path}
                      onChange={(value) =>
                        setSpec((currentSpec) =>
                          updateResource(
                            currentSpec,
                            selectedResource.id,
                            (resource) => ({
                              ...resource,
                              path: value,
                            }),
                          ),
                        )
                      }
                      isDisabled={!canEdit}
                    />
                    <TextField
                      label="Summary"
                      value={selectedResource.summary}
                      onChange={(value) =>
                        setSpec((currentSpec) =>
                          updateResource(
                            currentSpec,
                            selectedResource.id,
                            (resource) => ({
                              ...resource,
                              summary: value,
                            }),
                          ),
                        )
                      }
                      isDisabled={!canEdit}
                    />
                    <Textarea
                      label="Description"
                      className="lg:col-span-2"
                      value={selectedResource.description}
                      onChange={(value) =>
                        setSpec((currentSpec) =>
                          updateResource(
                            currentSpec,
                            selectedResource.id,
                            (resource) => ({
                              ...resource,
                              description: value,
                            }),
                          ),
                        )
                      }
                      isDisabled={!canEdit}
                    />
                  </CardContent>
                </Card>
              ) : null}
            </TabPanel>

            <TabPanel id="operations" className="space-y-4">
              <Card className="gap-0 py-0">
                <CardHeader className="px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">Operations</CardTitle>
                      <p className="mt-1 text-sm text-muted-fg">
                        Select any operation across the API and edit it in the
                        inspector.
                      </p>
                    </div>
                    {selectedResource ? (
                      <div className="flex flex-wrap gap-2">
                        {HTTP_METHODS.map((method) => (
                          <Button
                            key={method}
                            type="button"
                            intent="secondary"
                            size="sm"
                            onPress={() => addOperation(method)}
                            isDisabled={!canEdit}
                          >
                            <Plus />
                            {method.toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 px-4 pb-4 pt-0 md:grid-cols-2">
                  {allOperations.map(({ resource, operation }) => {
                    const isSelected = operation.id === selectedOperation?.id;
                    return (
                      <button
                        type="button"
                        key={operation.id}
                        onClick={() => {
                          setSelectedResourceId(resource.id);
                          setSelectedOperationId(operation.id);
                        }}
                        className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                          isSelected
                            ? "border-primary/60 bg-primary/10 shadow-card"
                            : "border-border/60 bg-background hover:border-primary/40 hover:bg-muted/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge intent="secondary">
                                {operation.method.toUpperCase()}
                              </Badge>
                              <span className="truncate font-medium text-foreground">
                                {operation.summary || "Untitled operation"}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-muted-fg">
                              {resource.path}
                            </p>
                            <p className="mt-2 line-clamp-2 text-sm text-muted-fg">
                              {operation.description ||
                                "No operation description yet."}
                            </p>
                          </div>
                          <Button
                            type="button"
                            intent="plain"
                            size="sq-sm"
                            onPress={() => {
                              setSelectedResourceId(resource.id);
                              removeOperation(operation.id);
                            }}
                            isDisabled={!canEdit}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-fg">
                          <span>{operation.parameters.length} params</span>
                          <span>&middot;</span>
                          <span>{operation.responses.length} responses</span>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </TabPanel>
          </div>
        </Tabs>

        <div className="space-y-4">
          {selectedResource && selectedOperation ? (
            <OperationEditor
              canEdit={canEdit}
              resource={selectedResource}
              operation={selectedOperation}
              spec={spec}
              setSpec={setSpec}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}

function OperationEditor({
  canEdit,
  resource,
  operation,
  spec,
  setSpec,
}: {
  canEdit: boolean;
  resource: ApiResource;
  operation: ApiOperation;
  spec: ApiSpec;
  setSpec: React.Dispatch<React.SetStateAction<ApiSpec>>;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="px-4 py-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge intent="secondary">{operation.method.toUpperCase()}</Badge>
            <span className="text-sm text-muted-fg">{resource.path}</span>
          </div>
          <CardTitle className="mt-3 text-base">Operation inspector</CardTitle>
          <p className="mt-1 text-sm text-muted-fg">
            Edit request contract, metadata, and response details for the
            selected operation.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4 pt-0">
        <div className="grid gap-4 lg:grid-cols-2">
          <Select
            label="Method"
            selectedKey={operation.method}
            isDisabled={!canEdit}
            onSelectionChange={(key) =>
              setSpec((currentSpec) =>
                updateOperation(
                  currentSpec,
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
              setSpec((currentSpec) =>
                updateOperation(
                  currentSpec,
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
              setSpec((currentSpec) =>
                updateOperation(
                  currentSpec,
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
              setSpec((currentSpec) =>
                updateOperation(
                  currentSpec,
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
            setSpec((currentSpec) =>
              updateOperation(
                currentSpec,
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
                setSpec((currentSpec) =>
                  updateOperation(
                    currentSpec,
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
                      setSpec((currentSpec) =>
                        updateParameter(
                          currentSpec,
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
                      setSpec((currentSpec) =>
                        updateParameter(
                          currentSpec,
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
                      setSpec((currentSpec) =>
                        updateParameter(
                          currentSpec,
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
                      setSpec((currentSpec) =>
                        updateOperation(
                          currentSpec,
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
                      setSpec((currentSpec) =>
                        updateParameter(
                          currentSpec,
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
                      setSpec((currentSpec) =>
                        updateParameter(
                          currentSpec,
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
            {!operation.parameters.length ? (
              <p className="text-sm text-muted-fg">
                No parameters yet for this operation.
              </p>
            ) : null}
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
                    setSpec((currentSpec) =>
                      updateOperation(
                        currentSpec,
                        resource.id,
                        operation.id,
                        (currentOperation) => ({
                          ...currentOperation,
                          requestBody: {
                            contentType: "application/json",
                            required: true,
                            description: "",
                            example: "",
                            schemaId: null,
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
                    setSpec((currentSpec) =>
                      updateOperation(
                        currentSpec,
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
                      setSpec((currentSpec) =>
                        updateOperation(
                          currentSpec,
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
                      setSpec((currentSpec) =>
                        updateOperation(
                          currentSpec,
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
                    setSpec((currentSpec) =>
                      updateOperation(
                        currentSpec,
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
                    setSpec((currentSpec) =>
                      updateOperation(
                        currentSpec,
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
                setSpec((currentSpec) =>
                  updateOperation(
                    currentSpec,
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
                      setSpec((currentSpec) =>
                        updateResponse(
                          currentSpec,
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
                      setSpec((currentSpec) =>
                        updateResponse(
                          currentSpec,
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
                      setSpec((currentSpec) =>
                        updateOperation(
                          currentSpec,
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
                    setSpec((currentSpec) =>
                      updateResponse(
                        currentSpec,
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
      </CardContent>
    </Card>
  );
}
