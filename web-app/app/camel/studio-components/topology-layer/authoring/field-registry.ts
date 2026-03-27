import { isPlainObject, isPrimitiveValue, parseObjectValue } from "./utils";
import type { FieldRenderer, PropertySchema } from "./types";

const HIDDEN_STRUCTURAL_KEYS = new Set(["steps", "outputs"]);

function isHiddenStructuralField(property: PropertySchema, key: string) {
  if (HIDDEN_STRUCTURAL_KEYS.has(key)) return true;
  if (
    property.kind === "element" &&
    Array.isArray(property.oneOf) &&
    property.oneOf.length > 0
  ) {
    return true;
  }
  return false;
}

function isFlatObject(value: unknown) {
  if (!isPlainObject(value)) return false;
  return Object.values(value).every((item) => isPrimitiveValue(item));
}

export function getFieldRenderer(
  key: string,
  property: PropertySchema,
  value: unknown,
): FieldRenderer {
  if (isHiddenStructuralField(property, key)) {
    return { kind: "object-fallback", isHidden: true };
  }

  if (key === "uri" && property.type === "string") {
    return { kind: "endpoint" };
  }

  if (property.kind === "expression") {
    return { kind: "expression" };
  }

  if (property.type === "boolean") {
    return { kind: "boolean" };
  }

  if (Array.isArray(property.oneOf) && property.oneOf.length > 0) {
    return { kind: "enum" };
  }

  if (property.type === "array") {
    return { kind: "array" };
  }

  if (property.type === "object") {
    return { kind: isFlatObject(value) ? "map" : "object-fallback" };
  }

  return { kind: "scalar" };
}

export function parseKeyValueLines(value: string) {
  const parsedEntries = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) return null;
      const entryKey = line.slice(0, separatorIndex).trim();
      const entryValue = line.slice(separatorIndex + 1).trim();
      if (!entryKey) return null;
      return [entryKey, parseObjectValue(entryValue) ?? entryValue] as const;
    })
    .filter(Boolean) as Array<readonly [string, unknown]>;

  return Object.fromEntries(parsedEntries);
}
