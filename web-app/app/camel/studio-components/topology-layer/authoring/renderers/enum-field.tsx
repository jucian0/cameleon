import {
  Select,
  SelectList,
  SelectOption,
  SelectTrigger,
} from "app/components/ui/select";
import type { FieldRendererProps } from "../types";

export function EnumField({
  label,
  description,
  property,
  value,
  onChange,
}: FieldRendererProps) {
  const options = property.oneOf ?? [];

  return (
    <Select
      selectedKey={value?.toString() || null}
      onSelectionChange={(nextValue) => onChange(nextValue?.toString())}
      label={label}
      description={description}
    >
      <SelectTrigger />
      <SelectList>
        {options.map((option) => (
          <SelectOption key={option} id={option}>
            {option}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
}
