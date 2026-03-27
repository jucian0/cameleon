export type PropertySchema = {
  displayName?: string;
  description?: string;
  type?:
    | "boolean"
    | "string"
    | "number"
    | "object"
    | "array"
    | "integer"
    | "duration";
  defaultValue?: boolean | number | string;
  oneOf?: string[];
  enum?: string[];
  required?: boolean;
  secret?: boolean;
  group?: string;
  kind?: string;
  asPredicate?: boolean;
  index?: number;
};

export type ComponentMetadata = {
  component?: {
    name?: string;
    title?: string;
    description?: string;
    syntax?: string;
  };
  properties?: Record<string, PropertySchema>;
};

export type FieldRendererKind =
  | "scalar"
  | "enum"
  | "boolean"
  | "expression"
  | "array"
  | "map"
  | "object-fallback"
  | "endpoint";

export type FieldRenderer = {
  kind: FieldRendererKind;
  isHidden?: boolean;
};

export type FieldRendererProps = {
  fieldKey: string;
  label: string;
  description?: string;
  errorMessage?: string;
  property: PropertySchema;
  value: unknown;
  schema: Record<string, PropertySchema>;
  componentMetadata?: ComponentMetadata | null;
  formData: Record<string, unknown>;
  onChange: (value: unknown) => void;
  onFormDataChange: (nextFormData: Record<string, unknown>) => void;
  onErrorChange: (errorMessage?: string) => void;
};
