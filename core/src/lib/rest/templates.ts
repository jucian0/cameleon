import type {
  ApiHttpMethod,
  ApiOperation,
  ApiParameter,
  ApiResource,
  ApiResponse,
  ApiResponseHeader,
  ApiSchema,
  ApiSecurityRequirement,
  ApiSecurityScheme,
  ApiSpec,
  ApiTag,
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

export function createApiResponseHeader(
  overrides: Partial<ApiResponseHeader> = {},
): ApiResponseHeader {
  return {
    id: createId("response-header"),
    name: "",
    description: "",
    type: "string",
    ...overrides,
  };
}

export function createApiTag(overrides: Partial<ApiTag> = {}): ApiTag {
  return {
    id: createId("tag"),
    name: "tag",
    description: "",
    ...overrides,
  };
}

export function createApiSecurityRequirement(
  overrides: Partial<ApiSecurityRequirement> = {},
): ApiSecurityRequirement {
  return {
    id: createId("security-requirement"),
    schemeName: "",
    scopes: [],
    ...overrides,
  };
}

export function createApiSecurityScheme(
  overrides: Partial<ApiSecurityScheme> = {},
): ApiSecurityScheme {
  return {
    id: createId("security-scheme"),
    name: "auth",
    type: "http",
    description: "",
    scheme: "bearer",
    bearerFormat: "JWT",
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
    schemaId: null,
    headers: [],
    ...overrides,
  };
}

export function createApiSchema(overrides: Partial<ApiSchema> = {}): ApiSchema {
  return {
    id: createId("schema"),
    name: "Schema",
    description: "",
    content: '{\n  "type": "object"\n}',
    ...overrides,
  };
}

export function createApiOperation(
  method: ApiHttpMethod = "get",
  overrides: Partial<ApiOperation> = {},
): ApiOperation {
  const defaultSummary =
    method === "get"
      ? "List resources"
      : `Handle ${method.toUpperCase()} request`;

  return {
    id: createId("operation"),
    method,
    operationId: "",
    summary: defaultSummary,
    description: "",
    tags: [],
    deprecated: false,
    security: [],
    parameters: [],
    requestBody:
      method === "post" || method === "put" || method === "patch"
        ? {
            contentType: "application/json",
            required: true,
            description: "",
            example: "",
            schemaId: null,
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
    tags: [],
    securitySchemes: [],
    schemas: [],
    resources: [createApiResource()],
  };
}
