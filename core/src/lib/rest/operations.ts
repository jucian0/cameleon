import type {
  ApiOperation,
  ApiParameter,
  ApiResource,
  ApiResponse,
  ApiSpec,
} from "./types";

export function updateApiResource(
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

export function updateApiOperation(
  spec: ApiSpec,
  resourceId: string,
  operationId: string,
  updater: (operation: ApiOperation) => ApiOperation,
) {
  return updateApiResource(spec, resourceId, (resource) => ({
    ...resource,
    operations: resource.operations.map((operation) =>
      operation.id === operationId ? updater(operation) : operation,
    ),
  }));
}

export function updateApiParameter(
  spec: ApiSpec,
  resourceId: string,
  operationId: string,
  parameterId: string,
  updater: (parameter: ApiParameter) => ApiParameter,
) {
  return updateApiOperation(spec, resourceId, operationId, (operation) => ({
    ...operation,
    parameters: operation.parameters.map((parameter) =>
      parameter.id === parameterId ? updater(parameter) : parameter,
    ),
  }));
}

export function updateApiResponse(
  spec: ApiSpec,
  resourceId: string,
  operationId: string,
  responseId: string,
  updater: (response: ApiResponse) => ApiResponse,
) {
  return updateApiOperation(spec, resourceId, operationId, (operation) => ({
    ...operation,
    responses: operation.responses.map((response) =>
      response.id === responseId ? updater(response) : response,
    ),
  }));
}
