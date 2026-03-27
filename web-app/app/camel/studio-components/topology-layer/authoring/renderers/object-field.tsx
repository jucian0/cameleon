import { Textarea } from "app/components/ui/textarea";
import type { FieldRendererProps } from "../types";
import { parseKeyValueLines } from "../field-registry";
import { isPlainObject } from "../utils";
import { JsonTextareaField } from "./json-textarea-field";

export function MapField({
  label,
  description,
  errorMessage,
  value,
  onChange,
  onErrorChange,
}: FieldRendererProps) {
  const objectValue = isPlainObject(value) ? value : {};
  const entries = Object.entries(objectValue);

  return (
    <Textarea
      label={label}
      description={description}
      errorMessage={errorMessage}
      placeholder={"key=value\nanother=value"}
      value={entries.map(([key, item]) => `${key}=${String(item)}`).join("\n")}
      onChange={(nextValue) => {
        onErrorChange(undefined);
        onChange(parseKeyValueLines(nextValue));
      }}
    />
  );
}

export function ObjectFallbackField({
  label,
  description,
  errorMessage,
  value,
  onChange,
  onErrorChange,
}: FieldRendererProps) {
  const objectValue = isPlainObject(value) ? value : (value ?? {});

  return (
    <JsonTextareaField
      label={label}
      description={
        description
          ? `${description} Advanced JSON fallback for unsupported Camel structures.`
          : "Advanced JSON fallback for unsupported Camel structures."
      }
      errorMessage={errorMessage}
      placeholder="{}"
      value={objectValue}
      emptyValue={{}}
      onChange={onChange}
      onErrorChange={onErrorChange}
    />
  );
}
