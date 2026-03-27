import type { PropertySchema } from "./types";

export function prettyJson(value: unknown) {
  if (value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

export function parseObjectValue(value: string) {
  if (!value.trim()) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function isPrimitiveValue(value: unknown) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

export function parsePrimitiveValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  const maybeNumber = Number(trimmed);
  return Number.isNaN(maybeNumber) ? value : maybeNumber;
}

export function getFieldValue(
  value: unknown,
  property: PropertySchema,
): unknown {
  if (value !== undefined) return value;
  if (property.defaultValue !== undefined) return property.defaultValue;
  if (property.type === "boolean") return false;
  if (property.type === "array") return [];
  if (property.type === "object") return {};
  return "";
}
