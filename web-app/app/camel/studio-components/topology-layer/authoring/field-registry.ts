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
  return Object.fromEntries(parseKeyValueLinesWithIssues(value).entries);
}

export function parseKeyValueLinesWithIssues(value: string) {
  const parsedEntries = value
    .split("\n")
    .map((line, index) => ({
      line: line.trim(),
      lineNumber: index + 1,
    }))
    .filter(({ line }) => Boolean(line));

  const issues: string[] = [];
  const parsed = parsedEntries.map(({ line, lineNumber }) => {
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      issues.push(`Line ${lineNumber} must use key=value format.`);
      return null;
    }

    const entryKey = line.slice(0, separatorIndex).trim();
    const entryValue = line.slice(separatorIndex + 1).trim();

    if (!entryKey) {
      issues.push(`Line ${lineNumber} is missing a key before '='.`);
      return null;
    }

    return {
      key: entryKey,
      value: parseObjectValue(entryValue) ?? entryValue,
      lineNumber,
    };
  });

  const validEntries = parsed.filter(Boolean) as Array<{
    key: string;
    value: unknown;
    lineNumber: number;
  }>;
  const duplicateKeys = validEntries.reduce<Record<string, number[]>>(
    (acc, { key, lineNumber }) => {
      const current = acc[key] ?? [];
      current.push(lineNumber);
      acc[key] = current;
      return acc;
    },
    {},
  );

  Object.entries(duplicateKeys).forEach(([key, lineNumbers]) => {
    if (lineNumbers.length > 1) {
      issues.push(
        `Key "${key}" is duplicated on lines ${lineNumbers.join(", ")}.`,
      );
    }
  });

  return {
    entries: validEntries.map(({ key, value }) => [key, value] as const),
    issues,
  };
}
