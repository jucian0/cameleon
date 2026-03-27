import { parsePrimitiveValue } from "./utils";

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
