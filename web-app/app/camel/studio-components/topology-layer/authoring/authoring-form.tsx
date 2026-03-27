import React from "react";
import { IconChevronLgDown } from "@intentui/icons";
import { Button } from "app/components/ui/button";
import { Badge } from "app/components/ui/badge";
import { Sheet } from "app/components/ui/sheet";
import { getFieldRenderer } from "./field-registry";
import { getFieldValue } from "./utils";
import { ExpressionField } from "./renderers/expression-field";
import { ArrayField } from "./renderers/array-field";
import { MapField, ObjectFallbackField } from "./renderers/object-field";
import { ScalarField } from "./renderers/scalar-field";
import { BooleanField } from "./renderers/boolean-field";
import { EnumField } from "./renderers/enum-field";
import { EndpointField } from "./renderers/endpoint-field";
import type { FieldRendererProps, PropertySchema } from "./types";

type Props = {
  schema: Record<string, PropertySchema>;
  initialFormData: Record<string, any>;
  onSubmit?: (formData: Record<string, any>) => void;
  onCancel?: () => void;
};

function isAdvancedGroup(groupName: string) {
  return groupName.toLowerCase().includes("advanced");
}

function formatGroupName(groupName: string) {
  return groupName.replace(/\s+/g, " ").trim();
}

function FieldRenderer(props: FieldRendererProps) {
  const renderer = getFieldRenderer(
    props.fieldKey,
    props.property,
    props.value,
  );

  if (renderer.isHidden) {
    return null;
  }

  switch (renderer.kind) {
    case "expression":
      return <ExpressionField {...props} />;
    case "array":
      return <ArrayField {...props} />;
    case "map":
      return <MapField {...props} />;
    case "object-fallback":
      return <ObjectFallbackField {...props} />;
    case "endpoint":
      return <EndpointField {...props} />;
    case "boolean":
      return <BooleanField {...props} />;
    case "enum":
      return <EnumField {...props} />;
    case "scalar":
    default:
      return <ScalarField {...props} />;
  }
}

export function AuthoringForm({
  schema,
  initialFormData,
  onSubmit,
  onCancel,
}: Props) {
  const [formData, setFormData] = React.useState(initialFormData);
  const [collapsedGroups, setCollapsedGroups] = React.useState<
    Record<string, boolean>
  >({});

  React.useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const properties = React.useMemo(
    () =>
      Object.entries(schema).sort(([, a], [, b]) => {
        const aIndex = a?.index ?? Number.MAX_SAFE_INTEGER;
        const bIndex = b?.index ?? Number.MAX_SAFE_INTEGER;
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

  React.useEffect(() => {
    setCollapsedGroups((current) => {
      const next = { ...current };

      for (const [groupName] of propertyGroups) {
        if (!(groupName in next)) {
          next[groupName] = isAdvancedGroup(groupName);
        }
      }

      return next;
    });
  }, [propertyGroups]);

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
      {properties.length > 0 ? (
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-fg">
          Camel-aware editing is enabled for common fields. Unsupported nested
          structures remain available through advanced JSON fallback.
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-fg">
          No editable metadata was found for this node yet.
        </div>
      )}

      {propertyGroups.map(([groupName, groupProperties]) => {
        const renderedFields = groupProperties
          .map(([key, property]) => {
            const currentValue = getFieldValue(formData[key], property);

            return (
              <FieldRenderer
                key={key}
                fieldKey={key}
                label={property.displayName || key}
                description={property.description}
                property={property}
                value={currentValue}
                formData={formData}
                onChange={(value) => updateField(key, value)}
                onFormDataChange={(nextFormData) => setFormData(nextFormData)}
              />
            );
          })
          .filter(Boolean);

        if (renderedFields.length === 0) {
          return null;
        }

        const isCollapsed = collapsedGroups[groupName] ?? false;
        const formattedGroupName = formatGroupName(groupName);

        return (
          <section key={groupName} className="space-y-4">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left hover:bg-muted/30"
              onClick={() =>
                setCollapsedGroups((current) => ({
                  ...current,
                  [groupName]: !isCollapsed,
                }))
              }
            >
              <span className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground capitalize">
                  {formattedGroupName}
                </span>
                <Badge
                  intent={isAdvancedGroup(groupName) ? "warning" : "secondary"}
                >
                  {renderedFields.length}
                </Badge>
              </span>
              <IconChevronLgDown
                className={`size-4 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
              />
            </button>

            {!isCollapsed && renderedFields}
          </section>
        );
      })}

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
