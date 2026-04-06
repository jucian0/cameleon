import { decode, encode } from "js-base64";
import { parse, stringify } from "yaml";
import type {
  ApiOperation,
  ApiParameter,
  ApiResource,
  ApiResponse,
  ApiSpec,
} from "./types";
import {
  createApiOperation,
  createApiParameter,
  createApiResource,
  createApiResponse,
  createDefaultApiSpec,
} from "./templates";
import type {
  ApiHttpMethod,
  ApiParameterLocation,
  ApiScalarType,
} from "./types";

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

const HTTP_METHODS: ApiHttpMethod[] = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
];

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeScalarType(type: unknown): ApiScalarType {
  switch (type) {
    case "number":
    case "integer":
    case "boolean":
    case "string":
      return type;
    default:
      return "string";
  }
}

function extractExample(value: unknown): string {
  if (!isRecord(value)) return "";

  if ("example" in value && value.example != null) {
    return typeof value.example === "string"
      ? value.example
      : JSON.stringify(value.example, null, 2);
  }

  if ("examples" in value && isRecord(value.examples)) {
    const firstExample = Object.values(value.examples)[0];
    if (
      isRecord(firstExample) &&
      "value" in firstExample &&
      firstExample.value != null
    ) {
      return typeof firstExample.value === "string"
        ? firstExample.value
        : JSON.stringify(firstExample.value, null, 2);
    }
  }

  if (
    "schema" in value &&
    isRecord(value.schema) &&
    "example" in value.schema
  ) {
    return typeof value.schema.example === "string"
      ? value.schema.example
      : JSON.stringify(value.schema.example, null, 2);
  }

  return "";
}

function inferServersFromDocument(input: Record<string, any>) {
  if (Array.isArray(input.servers)) {
    return input.servers.map((server) => ({
      id: server.id ?? createId("server"),
      url: server.url ?? "",
      description: server.description ?? "",
    }));
  }

  if (typeof input.host === "string" && input.host.trim()) {
    const schemes =
      Array.isArray(input.schemes) && input.schemes.length
        ? input.schemes
        : ["https"];
    const basePath = typeof input.basePath === "string" ? input.basePath : "";

    return schemes.map((scheme) => ({
      id: createId("server"),
      url: `${scheme}://${input.host}${basePath}`,
      description: "",
    }));
  }

  return [];
}

function toApiParameter(parameter: Record<string, any>) {
  const location = parameter.in as ApiParameterLocation | "body" | "formData";

  if (!["path", "query", "header"].includes(String(location))) {
    return null;
  }

  return createApiParameter({
    name: parameter.name ?? "",
    in: location as ApiParameterLocation,
    required: location === "path" ? true : Boolean(parameter.required),
    description: parameter.description ?? "",
    type: normalizeScalarType(
      parameter.type ?? parameter.schema?.type ?? parameter.items?.type,
    ),
  });
}

function toApiRequestBodyFromSwagger(
  operation: Record<string, any>,
  parameters: Record<string, any>[],
) {
  const bodyParameter = parameters.find((parameter) => parameter.in === "body");
  const formParameters = parameters.filter(
    (parameter) => parameter.in === "formData",
  );

  if (bodyParameter) {
    const contentType =
      Array.isArray(operation.consumes) && operation.consumes.length
        ? operation.consumes[0]
        : "application/json";

    return {
      contentType,
      required: Boolean(bodyParameter.required),
      description: bodyParameter.description ?? "",
      example: extractExample(bodyParameter),
    };
  }

  if (formParameters.length) {
    const contentType =
      Array.isArray(operation.consumes) && operation.consumes.length
        ? operation.consumes[0]
        : "application/x-www-form-urlencoded";

    return {
      contentType,
      required: formParameters.some((parameter) => parameter.required),
      description:
        formParameters
          .map((parameter) => parameter.description)
          .filter(Boolean)
          .join("\n") || "Form payload",
      example: "",
    };
  }

  return null;
}

function toApiRequestBodyFromOpenApi(operation: Record<string, any>) {
  if (!isRecord(operation.requestBody)) return null;

  const content = isRecord(operation.requestBody.content)
    ? operation.requestBody.content
    : {};
  const firstContentType = Object.keys(content)[0] ?? "application/json";
  const firstContent = isRecord(content[firstContentType])
    ? content[firstContentType]
    : {};

  return {
    contentType: firstContentType,
    required: Boolean(operation.requestBody.required),
    description: operation.requestBody.description ?? "",
    example: extractExample(firstContent),
  };
}

function toApiResponses(responses: unknown) {
  if (!isRecord(responses)) {
    return [createApiResponse()];
  }

  const mapped = Object.entries(responses).map(([statusCode, response]) => {
    const record = isRecord(response) ? response : {};
    return createApiResponse({
      statusCode,
      description: record.description ?? "Response",
      example: extractExample(record),
    });
  });

  return mapped.length ? mapped : [createApiResponse()];
}

function importOperation(
  method: ApiHttpMethod,
  path: string,
  operation: Record<string, any>,
  inheritedParameters: Record<string, any>[],
  isSwagger2: boolean,
) {
  const rawParameters = [
    ...inheritedParameters,
    ...(Array.isArray(operation.parameters)
      ? operation.parameters.filter(isRecord)
      : []),
  ];

  const parameters = rawParameters
    .map(toApiParameter)
    .filter((parameter): parameter is NonNullable<typeof parameter> =>
      Boolean(parameter),
    );

  return createApiOperation(method, {
    operationId: operation.operationId ?? "",
    summary: operation.summary ?? `${method.toUpperCase()} ${path}`,
    description: operation.description ?? "",
    parameters,
    requestBody: isSwagger2
      ? toApiRequestBodyFromSwagger(operation, rawParameters)
      : toApiRequestBodyFromOpenApi(operation),
    responses: toApiResponses(operation.responses),
  });
}

function importFromApiDocument(input: Record<string, any>) {
  const isSwagger2 = typeof input.swagger === "string";
  const info = isRecord(input.info) ? input.info : {};
  const paths = isRecord(input.paths) ? input.paths : {};

  const resources = Object.entries(paths).map(([path, pathItem]) => {
    const pathRecord = isRecord(pathItem) ? pathItem : {};
    const inheritedParameters = Array.isArray(pathRecord.parameters)
      ? pathRecord.parameters.filter(isRecord)
      : [];

    const operations = HTTP_METHODS.flatMap((method) => {
      const candidate = pathRecord[method];
      if (!isRecord(candidate)) {
        return [];
      }

      return [
        importOperation(
          method,
          path,
          candidate,
          inheritedParameters,
          isSwagger2,
        ),
      ];
    });

    return createApiResource({
      path,
      summary: pathRecord.summary ?? "",
      description: pathRecord.description ?? "",
      operations: operations.length ? operations : [createApiOperation("get")],
    });
  });

  return normalizeApiSpec({
    info: {
      title: info.title ?? "Imported API",
      version: info.version ?? "1.0.0",
      description: info.description ?? "",
    },
    servers: inferServersFromDocument(input),
    resources,
  });
}

function coerceToApiSpec(input: unknown) {
  if (!isRecord(input)) {
    return createDefaultApiSpec();
  }

  if (Array.isArray(input.resources)) {
    return normalizeApiSpec(input as Partial<ApiSpec>);
  }

  if (isRecord(input.paths)) {
    return importFromApiDocument(input);
  }

  return normalizeApiSpec(input as Partial<ApiSpec>);
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

export function parseApiSpec(
  encodedContent: string | null | undefined,
): ApiSpec {
  if (!encodedContent) {
    return createDefaultApiSpec();
  }

  const decodedContent = decode(encodedContent);
  return coerceToApiSpec(JSON.parse(decodedContent));
}

export function serializeApiSpec(spec: ApiSpec) {
  return encode(JSON.stringify(spec, null, 2));
}

export function apiSpecToJson(spec: ApiSpec) {
  return JSON.stringify(spec, null, 2);
}

export function apiSpecToYaml(spec: ApiSpec) {
  return stringify(spec);
}

export function parseApiSpecJson(source: string) {
  return coerceToApiSpec(JSON.parse(source));
}

export function parseApiSpecYaml(source: string) {
  return coerceToApiSpec(parse(source));
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

export function openApiDocumentToYaml(spec: ApiSpec) {
  return stringify(toOpenApiDocument(spec));
}

export {
  createApiOperation,
  createApiParameter,
  createApiResource,
  createApiResponse,
  createDefaultApiSpec,
};
