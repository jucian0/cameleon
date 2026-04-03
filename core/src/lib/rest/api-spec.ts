import { decode, encode } from "js-base64";

export type ApiHttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "head"
  | "options";

export type ApiParameterLocation = "path" | "query" | "header";

export type ApiScalarType = "string" | "number" | "integer" | "boolean";

export type ApiParameter = {
  id: string;
  name: string;
  in: ApiParameterLocation;
  required: boolean;
  description: string;
  type: ApiScalarType;
};

export type ApiRequestBody = {
  contentType: string;
  required: boolean;
  description: string;
  example: string;
};

export type ApiResponse = {
  id: string;
  statusCode: string;
  description: string;
  example: string;
};

export type ApiOperation = {
  id: string;
  method: ApiHttpMethod;
  operationId: string;
  summary: string;
  description: string;
  parameters: ApiParameter[];
  requestBody: ApiRequestBody | null;
  responses: ApiResponse[];
  workflowId: string | null;
};

export type ApiResource = {
  id: string;
  path: string;
  summary: string;
  description: string;
  operations: ApiOperation[];
};

export type ApiServer = {
  id: string;
  url: string;
  description: string;
};

export type ApiSpec = {
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: ApiServer[];
  resources: ApiResource[];
};

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createApiParameter(
  overrides: Partial<ApiParameter> = {},
): ApiParameter {
  return {
    id: createId("param"),
    name: "",
    in: "query",
    required: false,
    description: "",
    type: "string",
    ...overrides,
  };
}

export function createApiResponse(
  overrides: Partial<ApiResponse> = {},
): ApiResponse {
  return {
    id: createId("response"),
    statusCode: "200",
    description: "Successful response",
    example: "",
    ...overrides,
  };
}

export function createApiOperation(
  method: ApiHttpMethod = "get",
  overrides: Partial<ApiOperation> = {},
): ApiOperation {
  const defaultSummary =
    method === "get" ? "List resources" : `Handle ${method.toUpperCase()} request`;

  return {
    id: createId("operation"),
    method,
    operationId: "",
    summary: defaultSummary,
    description: "",
    parameters: [],
    requestBody:
      method === "post" || method === "put" || method === "patch"
        ? {
            contentType: "application/json",
            required: true,
            description: "",
            example: "",
          }
        : null,
    responses: [createApiResponse()],
    workflowId: null,
    ...overrides,
  };
}

export function createApiResource(
  overrides: Partial<ApiResource> = {},
): ApiResource {
  return {
    id: createId("resource"),
    path: "/resource",
    summary: "",
    description: "",
    operations: [createApiOperation("get")],
    ...overrides,
  };
}

export function createDefaultApiSpec(title = "Untitled API"): ApiSpec {
  return {
    info: {
      title,
      version: "1.0.0",
      description: "",
    },
    servers: [
      {
        id: createId("server"),
        url: "https://api.example.com",
        description: "Production",
      },
    ],
    resources: [createApiResource()],
  };
}

function normalizeParameter(parameter: Partial<ApiParameter>): ApiParameter {
  return createApiParameter(parameter);
}

function normalizeResponse(response: Partial<ApiResponse>): ApiResponse {
  return createApiResponse(response);
}

function normalizeOperation(operation: Partial<ApiOperation>): ApiOperation {
  const base = createApiOperation(operation.method ?? "get", operation);
  return {
    ...base,
    parameters: Array.isArray(operation.parameters)
      ? operation.parameters.map(normalizeParameter)
      : [],
    requestBody: operation.requestBody
      ? {
          contentType: operation.requestBody.contentType ?? "application/json",
          required: Boolean(operation.requestBody.required),
          description: operation.requestBody.description ?? "",
          example: operation.requestBody.example ?? "",
        }
      : null,
    responses: Array.isArray(operation.responses)
      ? operation.responses.map(normalizeResponse)
      : [createApiResponse()],
  };
}

function normalizeResource(resource: Partial<ApiResource>): ApiResource {
  const base = createApiResource(resource);
  return {
    ...base,
    path: resource.path?.startsWith("/")
      ? resource.path
      : `/${resource.path ?? "resource"}`,
    operations: Array.isArray(resource.operations)
      ? resource.operations.map(normalizeOperation)
      : [createApiOperation("get")],
  };
}

export function normalizeApiSpec(input: Partial<ApiSpec>): ApiSpec {
  return {
    info: {
      title: input.info?.title ?? "Untitled API",
      version: input.info?.version ?? "1.0.0",
      description: input.info?.description ?? "",
    },
    servers: Array.isArray(input.servers)
      ? input.servers.map((server) => ({
          id: server.id ?? createId("server"),
          url: server.url ?? "",
          description: server.description ?? "",
        }))
      : [],
    resources: Array.isArray(input.resources)
      ? input.resources.map(normalizeResource)
      : [createApiResource()],
  };
}

export function parseApiSpec(encodedContent: string | null | undefined): ApiSpec {
  if (!encodedContent) {
    return createDefaultApiSpec();
  }

  const decodedContent = decode(encodedContent);
  const parsed = JSON.parse(decodedContent) as Partial<ApiSpec>;
  return normalizeApiSpec(parsed);
}

export function serializeApiSpec(spec: ApiSpec) {
  return encode(JSON.stringify(spec, null, 2));
}

export function validateApiSpec(spec: ApiSpec) {
  const errors: string[] = [];

  if (!spec.info.title.trim()) {
    errors.push("API title is required.");
  }

  if (!spec.resources.length) {
    errors.push("At least one resource is required.");
  }

  for (const resource of spec.resources) {
    if (!resource.path.trim()) {
      errors.push("Every resource needs a path.");
    } else if (!resource.path.startsWith("/")) {
      errors.push(`Resource path "${resource.path}" must start with "/".`);
    }

    const methodSet = new Set<string>();
    for (const operation of resource.operations) {
      if (methodSet.has(operation.method)) {
        errors.push(
          `Resource "${resource.path}" cannot repeat ${operation.method.toUpperCase()} operations.`,
        );
      }
      methodSet.add(operation.method);

      if (!operation.responses.length) {
        errors.push(
          `Operation ${operation.method.toUpperCase()} ${resource.path} must define at least one response.`,
        );
      }
    }
  }

  return errors;
}

function inferPathParameters(path: string) {
  const matches = path.matchAll(/\{([^}]+)\}/g);
  return [...matches].map((match) => match[1]);
}

export function toOpenApiDocument(spec: ApiSpec) {
  const document: Record<string, unknown> = {
    openapi: "3.1.0",
    info: {
      title: spec.info.title,
      version: spec.info.version,
      description: spec.info.description || undefined,
    },
    servers: spec.servers
      .filter((server) => server.url.trim())
      .map((server) => ({
        url: server.url,
        description: server.description || undefined,
      })),
    paths: {},
  };

  const paths = document.paths as Record<string, Record<string, unknown>>;

  for (const resource of spec.resources) {
    const pathItem: Record<string, unknown> = {};
    const inferredPathParameters = inferPathParameters(resource.path);

    for (const operation of resource.operations) {
      const parameters = [
        ...operation.parameters.map((parameter) => ({
          name: parameter.name,
          in: parameter.in,
          required: parameter.in === "path" ? true : parameter.required,
          description: parameter.description || undefined,
          schema: {
            type: parameter.type,
          },
        })),
      ];

      for (const pathParameter of inferredPathParameters) {
        if (!parameters.some((parameter) => parameter.name === pathParameter)) {
          parameters.push({
            name: pathParameter,
            in: "path",
            required: true,
            description: undefined,
            schema: {
              type: "string",
            },
          });
        }
      }

      pathItem[operation.method] = {
        operationId: operation.operationId || undefined,
        summary: operation.summary || undefined,
        description: operation.description || undefined,
        parameters: parameters.length ? parameters : undefined,
        requestBody: operation.requestBody
          ? {
              required: operation.requestBody.required,
              description: operation.requestBody.description || undefined,
              content: {
                [operation.requestBody.contentType || "application/json"]: {
                  example: operation.requestBody.example || undefined,
                },
              },
            }
          : undefined,
        responses: Object.fromEntries(
          operation.responses.map((response) => [
            response.statusCode,
            {
              description: response.description || "Response",
              content: response.example
                ? {
                    "application/json": {
                      example: response.example,
                    },
                  }
                : undefined,
            },
          ]),
        ),
      };
    }

    paths[resource.path] = pathItem;
  }

  return document;
}
