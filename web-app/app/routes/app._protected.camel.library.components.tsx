import { tryCatch } from "@/utils/try-catch";
import { type Key, type Selection } from "react-stately";
import {
  GridLayout,
  ListBox,
  ListBoxItem,
  Virtualizer,
} from "react-aria-components";
import { Badge } from "app/components/ui/badge";
import { Card } from "app/components/ui/card";
import { FallbackImage } from "app/components/fallback-image";
import { Modal } from "app/components/ui/modal";
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

  return (
    <>
      <Virtualizer layout={GridLayout}>
        <ListBox
          className="-m-4"
          selectionMode="single"
          onSelectionChange={handleSelectionChange}
          renderEmptyState={() => (
            <span className="m-4">No components to display</span>
          )}
        >
          {components.map((item: any) => (
            <ListBoxItem
              textValue={String(item.component.name)}
              key={String(item.component.name)}
              id={String(item.component.name)}
            >
              {({ isSelected, isFocusVisible }) => (
                <Card
                  className={`h-44 gap-0 overflow-hidden border-border/60 bg-bg/80 py-0 transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                      : "hover:border-primary/40 hover:bg-muted/20"
                  } ${isFocusVisible ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background" : ""}`}
                >
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
      </Virtualizer>
      <Modal.Content
        isOpen={selectedComponent != null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedComponent(null);
        }}
        size="2xl"
        isBlurred
      >
        <Modal.Header>
          <div className="flex items-center gap-2">
            <Badge intent="secondary">Component</Badge>
            {selectedComponent && (
              <Badge intent="outline">
                {String(selectedComponent.component.name)}
              </Badge>
            )}
          </div>
          <Modal.Title>
            {selectedComponent ? String(selectedComponent.component.title) : ""}
          </Modal.Title>
          <Modal.Description>
            {selectedComponent
              ? String(selectedComponent.component.description)
              : ""}
          </Modal.Description>
        </Modal.Header>
        <Modal.Body className="space-y-4">
          {selectedComponent?.component.syntax ? (
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
                Syntax
              </p>
              <code className="mt-1 block text-sm text-foreground">
                {String(selectedComponent.component.syntax)}
              </code>
            </div>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
                Properties
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {properties.length}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
                Required
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {properties.filter(([, property]) => property.required).length}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
                Groups
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {
                  new Set(
                    properties
                      .map(([, property]) => property.group)
                      .filter(Boolean),
                  ).size
                }
              </p>
            </div>
          </div>
          {highlightedProperties.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Key properties
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {highlightedProperties.map(([propertyName, property]) => (
                  <div
                    key={propertyName}
                    className="rounded-lg border border-border bg-muted/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {String(property.title || propertyName)}
                      </span>
                      {property.required && (
                        <Badge intent="warning">Required</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-fg">
                      {String(
                        property.description || "No description available.",
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close>Close</Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </>
  );
}
