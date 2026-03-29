import React from "react";
import { Textarea } from "app/components/ui/textarea";
import { prettyJson } from "../utils";

type Props = {
  label: string;
  description?: string;
  errorMessage?: string;
  isDisabled?: boolean;
  placeholder?: string;
  value: unknown;
  emptyValue: unknown;
  onChange: (value: unknown) => void;
  onErrorChange: (errorMessage?: string) => void;
};

export function JsonTextareaField({
  label,
  description,
  errorMessage,
  isDisabled,
  placeholder,
  value,
  emptyValue,
  onChange,
  onErrorChange,
}: Props) {
  const [rawValue, setRawValue] = React.useState(() => prettyJson(value));

  React.useEffect(() => {
    setRawValue(prettyJson(value));
  }, [value]);

  return (
    <Textarea
      label={label}
      description={description}
      errorMessage={errorMessage}
      isDisabled={isDisabled}
      placeholder={placeholder}
      value={rawValue}
      onChange={(nextValue) => {
        setRawValue(nextValue);

        if (!nextValue.trim()) {
          onErrorChange(undefined);
          onChange(emptyValue);
          return;
        }

        try {
          onChange(JSON.parse(nextValue));
          onErrorChange(undefined);
        } catch {
          onErrorChange("Invalid JSON. Fix the syntax before saving.");
        }
      }}
    />
  );
}
