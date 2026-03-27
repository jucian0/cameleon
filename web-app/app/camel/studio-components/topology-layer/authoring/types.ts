export type PropertySchema = {
  displayName?: string;
  description?: string;
  type?: "boolean" | "string" | "number" | "object" | "array";
  defaultValue?: boolean | number | string;
  oneOf?: string[];
  required?: boolean;
  secret?: boolean;
  group?: string;
  kind?: string;
  asPredicate?: boolean;
  index?: number;
};

export type FieldRendererKind =
  | "scalar"
  | "enum"
  | "boolean"
  | "expression"
  | "array"
  | "map"
  | "object-fallback";

export type FieldRenderer = {
  kind: FieldRendererKind;
  isHidden?: boolean;
};

export type FieldRendererProps = {
  fieldKey: string;
  label: string;
  description?: string;
  property: PropertySchema;
  value: unknown;
  onChange: (value: unknown) => void;
};
