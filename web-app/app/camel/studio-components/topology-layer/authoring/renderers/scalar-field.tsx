import { TextField } from "app/components/ui/text-field";
import type { FieldRendererProps } from "../types";

export function ScalarField({
  label,
  description,
  errorMessage,
  isDisabled,
  property,
  value,
  onChange,
}: FieldRendererProps) {
  return (
    <TextField
      label={label}
      description={description}
      errorMessage={errorMessage}
      isDisabled={isDisabled}
      type={
        property.type === "number"
          ? "number"
          : property.secret
            ? "password"
            : "text"
      }
      value={value?.toString() || ""}
      onChange={(nextValue) =>
        onChange(
          property.type === "number"
            ? nextValue === ""
              ? undefined
              : Number(nextValue)
            : nextValue,
        )
      }
    />
  );
}
