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
  type?: "boolean" | "string" | "number" | "object";
  defaultValue?: boolean | number | string;
  oneOf?: string[];
  required?: boolean;
  secret?: boolean;
  group?: string;
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
        .filter(([key]) => key !== "steps")
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
                <Textarea
                  key={key}
                  label={label}
                  description={description}
                  placeholder="{}"
                  defaultValue={prettyJson(currentValue)}
                  onChange={(value) =>
                    updateField(key, parseObjectValue(value))
                  }
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
