import { parsePrimitiveValue } from "./utils";
import type { ComponentMetadata } from "./types";

export type EndpointModel = {
  component: string;
  target: string;
  parameters: Record<string, unknown>;
};

export type EndpointPathDefinition = {
  key: string;
  label: string;
  description?: string;
  required?: boolean;
};

export function getEndpointPathDefinitions(
  componentMetadata: ComponentMetadata | null | undefined,
  parsedComponent: string | undefined,
) {
  const componentName = componentMetadata?.component?.name;
  const properties = componentMetadata?.properties ?? {};

  if (!componentName || !parsedComponent || componentName !== parsedComponent) {
    return [] as EndpointPathDefinition[];
  }

  return Object.entries(properties)
    .filter(([, property]) => property.kind === "path")
    .sort(([, left], [, right]) => {
      const leftIndex = left.index ?? Number.MAX_SAFE_INTEGER;
      const rightIndex = right.index ?? Number.MAX_SAFE_INTEGER;
      return leftIndex - rightIndex;
    })
    .map(([key, property]) => ({
      key,
      label: property.displayName || key,
      description: property.description,
      required: property.required,
    }));
}

export function parseEndpointUri(uri: string): EndpointModel | null {
  const trimmed = uri.trim();
  const separatorIndex = trimmed.indexOf(":");

  if (!trimmed || separatorIndex <= 0) {
    return null;
  }

  const component = trimmed.slice(0, separatorIndex).trim();
  const remainder = trimmed.slice(separatorIndex + 1);
  const [target, rawQuery = ""] = remainder.split("?");
  const params = new URLSearchParams(rawQuery);

  return {
    component,
    target,
    parameters: Object.fromEntries(
      Array.from(params.entries()).map(([key, value]) => [
        key,
        parsePrimitiveValue(value),
      ]),
    ),
  };
}

export function serializeEndpointUri(model: EndpointModel) {
  const query = Object.entries(model.parameters)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");

  return `${model.component}:${model.target}${query ? `?${query}` : ""}`;
}

export function splitEndpointTarget(target: string) {
  return target.split(":");
}

export function buildEndpointTarget(values: string[]) {
  return values.map((value) => value.trim()).join(":");
}
