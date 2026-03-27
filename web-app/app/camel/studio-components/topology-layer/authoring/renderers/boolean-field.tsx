import { Checkbox } from "app/components/ui/checkbox";
import type { FieldRendererProps } from "../types";

export function BooleanField({
  label,
  description,
  value,
  onChange,
}: FieldRendererProps) {
  return (
    <Checkbox
      isSelected={Boolean(value)}
      onChange={(nextValue) => onChange(nextValue)}
      label={label}
      description={description}
    />
  );
}
