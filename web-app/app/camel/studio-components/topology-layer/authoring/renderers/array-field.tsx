import { Textarea } from "app/components/ui/textarea";
import type { FieldRendererProps } from "../types";
import {
  isPrimitiveValue,
  parseObjectValue,
  parsePrimitiveValue,
  prettyJson,
} from "../utils";

export function ArrayField({
  label,
  description,
  errorMessage,
  value,
  onChange,
}: FieldRendererProps) {
  const arrayValue = Array.isArray(value) ? value : [];
  const isPrimitiveArray = arrayValue.every((item) => isPrimitiveValue(item));

  if (!isPrimitiveArray) {
    return (
      <Textarea
        label={label}
        description={
          description
            ? `${description} Advanced JSON fallback for complex arrays.`
            : "Advanced JSON fallback for complex arrays."
        }
        errorMessage={errorMessage}
        placeholder="[]"
        value={prettyJson(arrayValue)}
        onChange={(nextValue) => onChange(parseObjectValue(nextValue) ?? [])}
      />
    );
  }

  return (
    <Textarea
      label={label}
      description={description}
      errorMessage={errorMessage}
      placeholder="One item per line"
      value={arrayValue.map((item) => item?.toString() ?? "").join("\n")}
      onChange={(nextValue) =>
        onChange(
          nextValue
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
            .map(parsePrimitiveValue),
        )
      }
    />
  );
}
