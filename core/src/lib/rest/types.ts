import type * as ReactFlow from "@xyflow/react";

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
export type ApiSecuritySchemeType = "apiKey" | "http" | "oauth2" | "openIdConnect";

export type ApiParameter = {
  id: string;
  name: string;
  in: ApiParameterLocation;
  required: boolean;
  description: string;
  type: ApiScalarType;
  format: string;
  enum: string[];
  defaultValue: string;
  isArray: boolean;
  itemType: ApiScalarType;
};

export type ApiResponseHeader = {
  id: string;
  name: string;
  description: string;
  type: ApiScalarType;
};

export type ApiTag = {
  id: string;
  name: string;
  description: string;
};

export type ApiSecurityRequirement = {
  id: string;
  schemeName: string;
  scopes: string[];
};

export type ApiSecurityScheme = {
  id: string;
  name: string;
  type: ApiSecuritySchemeType;
  description: string;
  in?: "query" | "header" | "cookie";
  scheme?: string;
  bearerFormat?: string;
  flows?: string[];
  openIdConnectUrl?: string;
};

export type ApiRequestBody = {
  contentType: string;
  required: boolean;
  description: string;
  example: string;
  schemaId: string | null;
};

export type ApiResponse = {
  id: string;
  statusCode: string;
  description: string;
  example: string;
  schemaId: string | null;
  headers: ApiResponseHeader[];
};

export type ApiSchema = {
  id: string;
  name: string;
  description: string;
  content: string;
};

export type ApiOperation = {
  id: string;
  method: ApiHttpMethod;
  operationId: string;
  summary: string;
  description: string;
  tags: string[];
  deprecated: boolean;
  security: ApiSecurityRequirement[];
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
  tags: ApiTag[];
  securitySchemes: ApiSecurityScheme[];
  schemas: ApiSchema[];
  resources: ApiResource[];
};

export type ApiCanvasNodeKind =
  | "api"
  | "resource"
  | "operation"
  | "contract"
  | "schema"
  | "security"
  | "workflow";

export type ApiCanvasNodeData = {
  title: string;
  subtitle?: string;
  meta?: string;
  kind: ApiCanvasNodeKind;
  method?: ApiHttpMethod;
  flags?: string[];
  isSelected?: boolean;
};

export type ApiCanvasNode = ReactFlow.Node<ApiCanvasNodeData>;
export type ApiCanvasEdge = ReactFlow.Edge;

export type ApiCanvasDirection = "LR" | "TB";

export type ApiCanvasSelection =
  | { kind: "api" }
  | { kind: "schema"; schemaId: string }
  | { kind: "resource"; resourceId: string }
  | { kind: "operation"; resourceId: string; operationId: string }
  | { kind: "requestBody"; resourceId: string; operationId: string }
  | {
      kind: "response";
      resourceId: string;
      operationId: string;
      responseId?: string;
    };
