import { tryCatch } from "@/utils/try-catch";
import { type Key, type Selection } from "react-stately";
import { ListBox, ListBoxItem } from "react-aria-components";
import { Badge } from "app/components/ui/badge";
import { Card } from "app/components/ui/card";
import { FallbackImage } from "app/components/fallback-image";
import { LibraryItemDetailsModal } from "@/camel/library-components/library-item-details-modal";
import type { LoaderFunctionArgs } from "react-router";
import type { ComponentDefinition } from "core";
import axios from "axios";
import React from "react";

export function meta() {
  return [
    { title: "Components | Cameleon" },
    { description: "See all your components here." },
  ];
}

export const handle = {
  breadcrumb: () => "Components",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const componentsUrl = url.origin + "/metadata/components.json";
  const { error, data } = await tryCatch(
    axios.get<ComponentDefinition[]>(componentsUrl),
  );
  const components = (
    error ? [] : Object.values(data?.data ?? {})
  ) as ComponentDefinition[];

  return {
    components,
  };
}

export default function CamelComponentsTab({
  loaderData,
}: {
  loaderData: { components: ComponentDefinition[] };
}) {
  const { components } = loaderData;
  const [selectedComponent, setSelectedComponent] =
    React.useState<ComponentDefinition | null>(null);

  function handleSelectionChange(selectedKeys: Selection) {
    const [selectedItem] = Array.from(selectedKeys as Set<Key>)
      .map((key) => components?.find((item) => item.component.name === key))
      .filter(Boolean);
    if (!selectedItem) return;
    setSelectedComponent(selectedItem);
  }

  const properties = selectedComponent
    ? Object.entries(selectedComponent.properties ?? {})
    : [];
  const highlightedProperties = properties.slice(0, 8);
  const detailsItem = selectedComponent
    ? {
        kind: "component" as const,
        title: String(selectedComponent.component.title),
        name: String(selectedComponent.component.name),
        description: String(selectedComponent.component.description),
        syntax: selectedComponent.component.syntax
          ? String(selectedComponent.component.syntax)
          : undefined,
        propertyCount: properties.length,
        requiredCount: properties.filter(([, property]) => property.required)
          .length,
        groupCount: new Set(
          properties.map(([, property]) => property.group).filter(Boolean),
        ).size,
        highlightedProperties: highlightedProperties.map(
          ([propertyName, property]) => ({
            name: propertyName,
            title: property.title ? String(property.title) : undefined,
            description: property.description
              ? String(property.description)
              : undefined,
            required: Boolean(property.required),
          }),
        ),
      }
    : null;

  return (
    <>
      <ListBox
        layout="grid"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        selectionMode="single"
        onSelectionChange={handleSelectionChange}
        renderEmptyState={() => <span>No components to display</span>}
      >
        {components.map((item: any) => (
          <ListBoxItem
            textValue={String(item.component.name)}
            key={String(item.component.name)}
            id={String(item.component.name)}
          >
            {({ isSelected, isFocusVisible }) => (
              <Card
                className={`group relative h-44 gap-0 overflow-hidden border-border/60 bg-gradient-card py-0 transition-all duration-300 hover:border-primary/50 hover:shadow-card ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                    : ""
                } ${isFocusVisible ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background" : ""}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <Card.Header className="grid-cols-[auto_1fr] gap-3 px-3 py-3">
                  <FallbackImage
                    src={`/camel-icons/components/${String(item.component.name)}.svg`}
                    alt={String(item.component.name ?? "component icon")}
                    className="h-9 w-9 rounded-md border border-border/60 bg-secondary/40 p-1.5"
                    fallback="/camel-icons/components/generic.svg"
                  />
                  <div className="min-w-0">
                    <Card.Title className="truncate text-sm/5">
                      {String(item.component.title)}
                    </Card.Title>
                  </div>
                </Card.Header>
                <Card.Content className="flex flex-1 flex-col px-3 pb-3">
                  <p className="line-clamp-2 text-sm text-muted-fg">
                    {String(item.component.description)}
                  </p>
                  <div className="mt-auto pt-3">
                    <Badge intent="secondary">Component</Badge>
                  </div>
                </Card.Content>
              </Card>
            )}
          </ListBoxItem>
        ))}
      </ListBox>
      <LibraryItemDetailsModal
        item={detailsItem}
        isOpen={selectedComponent != null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedComponent(null);
        }}
      />
    </>
  );
}
