import type {
  ApiHttpMethod,
  ApiOperation,
  ApiParameter,
  ApiResource,
  ApiResponse,
  ApiSpec,
} from "./types";

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
