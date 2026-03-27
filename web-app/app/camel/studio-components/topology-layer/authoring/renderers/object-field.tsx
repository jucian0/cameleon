import { Textarea } from "app/components/ui/textarea";
import type { FieldRendererProps } from "../types";
import { parseKeyValueLines } from "../field-registry";
import { isPlainObject, prettyJson, parseObjectValue } from "../utils";

export function MapField({
  label,
  description,
  value,
  onChange,
}: FieldRendererProps) {
  const objectValue = isPlainObject(value) ? value : {};
  const entries = Object.entries(objectValue);

  return (
    <Textarea
      label={label}
      description={description}
      placeholder={"key=value\nanother=value"}
      value={entries.map(([key, item]) => `${key}=${String(item)}`).join("\n")}
      onChange={(nextValue) => onChange(parseKeyValueLines(nextValue))}
    />
  );
}

export function ObjectFallbackField({
  label,
  description,
  value,
  onChange,
}: FieldRendererProps) {
  const objectValue = isPlainObject(value) ? value : value ?? {};

  return (
    <Textarea
      label={label}
      description={
        description
          ? `${description} Advanced JSON fallback for unsupported Camel structures.`
          : "Advanced JSON fallback for unsupported Camel structures."
      }
      placeholder="{}"
      value={prettyJson(objectValue)}
      onChange={(nextValue) => onChange(parseObjectValue(nextValue))}
    />
  );
}
