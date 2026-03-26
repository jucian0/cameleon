import React from "react";
import { Button } from "app/components/ui/button";
import { Sheet } from "app/components/ui/sheet";
import { TextField } from "app/components/ui/text-field";
import { Textarea } from "app/components/ui/textarea";
import { Checkbox } from "app/components/ui/checkbox";
import {
  Select,
  SelectList,
  SelectOption,
  SelectTrigger,
} from "app/components/ui/select";

type PropertySchema = {
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
};

type Props = {
  schema: Record<string, PropertySchema>;
  initialFormData: Record<string, any>;
  onSubmit?: (formData: Record<string, any>) => void;
  onCancel?: () => void;
};

function prettyJson(value: unknown) {
  if (value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

function parseObjectValue(value: string) {
  if (!value.trim()) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isPrimitiveValue(value: unknown) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function parsePrimitiveValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  const maybeNumber = Number(trimmed);
  return Number.isNaN(maybeNumber) ? value : maybeNumber;
}

function getExpressionValue(
  value: unknown,
  options: string[],
): { language: string; expression: unknown } {
  if (isPlainObject(value)) {
    const [language] = Object.keys(value);
    if (language) {
      return {
        language,
        expression: value[language],
      };
    }
  }

  return {
    language: options[0] ?? "simple",
    expression: typeof value === "string" ? value : "",
  };
}

function HiddenStructuralField(property: PropertySchema, key: string) {
  if (key === "steps" || key === "outputs") return true;
  if (
    property.kind === "element" &&
    Array.isArray(property.oneOf) &&
    property.oneOf.length > 0
  ) {
    return true;
  }
  return false;
}

function ExpressionField({
  fieldKey,
  label,
  description,
  property,
  value,
  onChange,
}: {
  fieldKey: string;
  label: string;
  description?: string;
  property: PropertySchema;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const expressionOptions = property.oneOf ?? [];
  const { language, expression } = React.useMemo(
    () => getExpressionValue(value, expressionOptions),
    [expressionOptions, value],
  );
  const expressionIsComplex =
    isPlainObject(expression) || Array.isArray(expression);

  return (
    <div
      key={fieldKey}
      className="space-y-3 rounded-lg border border-border p-3"
    >
      <Select
        selectedKey={language}
        onSelectionChange={(nextLanguage) =>
          onChange({
            [nextLanguage?.toString() || expressionOptions[0] || "simple"]:
              expression,
          })
        }
        label={`${label} Language`}
        description={description}
      >
        <SelectTrigger />
        <SelectList>
          {expressionOptions.map((option) => (
            <SelectOption key={option} id={option}>
              {option}
            </SelectOption>
          ))}
        </SelectList>
      </Select>

      {expressionIsComplex ? (
        <Textarea
          label={`${label} Value`}
          placeholder="{}"
          defaultValue={prettyJson(expression)}
          onChange={(nextValue) =>
            onChange({
              [language]: parseObjectValue(nextValue),
            })
          }
        />
      ) : (
        <TextField
          label={`${label} Value`}
          defaultValue={expression?.toString() || ""}
          onChange={(nextValue) =>
            onChange({
              [language]: nextValue,
            })
          }
        />
      )}
    </div>
  );
}

function ArrayField({
  fieldKey,
  label,
  description,
  value,
  onChange,
}: {
  fieldKey: string;
  label: string;
  description?: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const arrayValue = Array.isArray(value) ? value : [];
  const isPrimitiveArray = arrayValue.every((item) => isPrimitiveValue(item));

  if (!isPrimitiveArray) {
    return (
      <Textarea
        key={fieldKey}
        label={label}
        description={description}
        placeholder="[]"
        defaultValue={prettyJson(arrayValue)}
        onChange={(nextValue) => onChange(parseObjectValue(nextValue) ?? [])}
      />
    );
  }

  return (
    <Textarea
      key={fieldKey}
      label={label}
      description={description}
      placeholder="One item per line"
      defaultValue={arrayValue.map((item) => item?.toString() ?? "").join("\n")}
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

function ObjectField({
  fieldKey,
  label,
  description,
  value,
  onChange,
}: {
  fieldKey: string;
  label: string;
  description?: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const objectValue = isPlainObject(value) ? value : {};
  const entries = Object.entries(objectValue);
  const isFlatObject = entries.every(([, item]) => isPrimitiveValue(item));

  if (!isFlatObject) {
    return (
      <Textarea
        key={fieldKey}
        label={label}
        description={description}
        placeholder="{}"
        defaultValue={prettyJson(objectValue)}
        onChange={(nextValue) => onChange(parseObjectValue(nextValue))}
      />
    );
  }

  return (
    <Textarea
      key={fieldKey}
      label={label}
      description={description}
      placeholder={"key=value\nanother=value"}
      defaultValue={entries.map(([k, v]) => `${k}=${v}`).join("\n")}
      onChange={(nextValue) => {
        const parsedEntries = nextValue
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const separatorIndex = line.indexOf("=");
            if (separatorIndex === -1) return null;
            const entryKey = line.slice(0, separatorIndex).trim();
            const entryValue = line.slice(separatorIndex + 1).trim();
            if (!entryKey) return null;
            return [entryKey, parsePrimitiveValue(entryValue)] as const;
          })
          .filter(Boolean) as Array<readonly [string, unknown]>;

        onChange(Object.fromEntries(parsedEntries));
      }}
    />
  );
}

export function DynamicForm({
  schema,
  initialFormData,
  onSubmit,
  onCancel,
}: Props) {
  const [formData, setFormData] = React.useState(initialFormData);

  React.useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const properties = React.useMemo(
    () =>
      Object.entries(schema)
        .filter(([key, property]) => !HiddenStructuralField(property, key))
        .sort(([, a], [, b]) => {
          const aIndex = (a as any)?.index ?? Number.MAX_SAFE_INTEGER;
          const bIndex = (b as any)?.index ?? Number.MAX_SAFE_INTEGER;
          return aIndex - bIndex;
        }),
    [schema],
  );

  const propertyGroups = React.useMemo(() => {
    const grouped = new Map<string, typeof properties>();

    for (const property of properties) {
      const group = property[1].group || "common";
      const current = grouped.get(group) ?? [];
      current.push(property);
      grouped.set(group, current);
    }

    const orderedGroups = ["common", "advanced"];
    const remainingGroups = Array.from(grouped.keys()).filter(
      (group) => !orderedGroups.includes(group),
    );

    return [...orderedGroups, ...remainingGroups]
      .filter((group) => grouped.has(group))
      .map((group) => [group, grouped.get(group) ?? []] as const);
  }, [properties]);

  function updateField(key: string, value: unknown) {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(formData);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {propertyGroups.map(([groupName, groupProperties]) => (
        <section key={groupName} className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-foreground capitalize">
              {groupName}
            </h3>
          </div>

          {groupProperties.map(([key, property]) => {
            const label = property.displayName || key;
            const description = property.description;
            const currentValue =
              formData[key] ??
              property.defaultValue ??
              (property.type === "boolean" ? false : "");

            if (property.kind === "expression") {
              return (
                <ExpressionField
                  key={key}
                  fieldKey={key}
                  label={label}
                  description={description}
                  property={property}
                  value={currentValue}
                  onChange={(value) => updateField(key, value)}
                />
              );
            }

            if (property.type === "array") {
              return (
                <ArrayField
                  key={key}
                  fieldKey={key}
                  label={label}
                  description={description}
                  value={currentValue}
                  onChange={(value) => updateField(key, value)}
                />
              );
            }

            if (Array.isArray(property.oneOf) && property.oneOf.length > 0) {
              return (
                <Select
                  key={key}
                  selectedKey={currentValue?.toString() || null}
                  onSelectionChange={(value) =>
                    updateField(key, value?.toString())
                  }
                  label={label}
                  description={description}
                >
                  <SelectTrigger />
                  <SelectList>
                    {property.oneOf.map((option) => (
                      <SelectOption key={option} id={option}>
                        {option}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              );
            }

            if (property.type === "boolean") {
              return (
                <Checkbox
                  key={key}
                  isSelected={Boolean(currentValue)}
                  onChange={(value) => updateField(key, value)}
                  label={label}
                  description={description}
                />
              );
            }

            if (property.type === "object") {
              return (
                <ObjectField
                  key={key}
                  fieldKey={key}
                  label={label}
                  description={description}
                  value={currentValue}
                  onChange={(value) => updateField(key, value)}
                />
              );
            }

            return (
              <TextField
                key={key}
                label={label}
                description={description}
                type={
                  property.type === "number"
                    ? "number"
                    : property.secret
                      ? "password"
                      : "text"
                }
                defaultValue={currentValue?.toString() || ""}
                onChange={(value) =>
                  updateField(
                    key,
                    property.type === "number"
                      ? value === ""
                        ? undefined
                        : Number(value)
                      : value,
                  )
                }
              />
            );
          })}
        </section>
      ))}

      <Sheet.Footer className="flex justify-end gap-2 -m-2">
        <Button type="button" intent="plain" onPress={onCancel}>
          Cancel
        </Button>
        <Button type="submit" intent="primary">
          Save Changes
        </Button>
      </Sheet.Footer>
    </form>
  );
}
