import { Checkbox } from "app/components/ui/checkbox";
import type { FieldRendererProps } from "../types";

export function BooleanField({
  label,
  description,
  errorMessage,
  isDisabled,
  value,
  onChange,
}: FieldRendererProps) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        errorMessage ? "border-danger/40 bg-danger/5" : "border-border"
      }`}
    >
      <Checkbox
        isSelected={Boolean(value)}
        isDisabled={isDisabled}
        onChange={onChange}
        label={label}
        description={description}
      />
      {errorMessage && (
        <p className="mt-2 text-sm text-danger-foreground">{errorMessage}</p>
      )}
    </div>
  );
}
