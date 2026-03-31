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
import { Modal } from "app/components/ui/modal";
import axios from "axios";
import type { EPIDefinition } from "core";
import type { LoaderFunctionArgs } from "react-router";
import React from "react";

export function meta() {
  return [
    { title: "EIPs | Cameleon" },
    { description: "See all your EIPs here." },
  ];
}

export const handle = {
  breadcrumb: () => "EIPs",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const eipsUrl = url.origin + "/metadata/eips.json";
  const { data, error } = await tryCatch(axios.get<EPIDefinition[]>(eipsUrl));
  const eips = (
    error ? [] : Object.values(data?.data ?? {})
  ) as EPIDefinition[];

  return {
    eips,
  };
}

export default function CamelEIPsTab({
  loaderData,
}: {
  loaderData: { eips: EPIDefinition[] };
}) {
  const { eips } = loaderData;
  const [selectedEip, setSelectedEip] = React.useState<EPIDefinition | null>(
    null,
  );

  function handleSelectionChange(selectedKeys: Selection) {
    const [selectedItem] = Array.from(selectedKeys as Set<Key>)
      .map((key) => eips.find((item) => item.model.name === key))
      .filter(Boolean);
    if (!selectedItem) return;
    setSelectedEip(selectedItem);
  }

  const properties = selectedEip
    ? Object.entries(selectedEip.properties ?? {})
    : [];
  const highlightedProperties = properties.slice(0, 8);

  return (
    <>
      <Virtualizer layout={GridLayout}>
        <ListBox
          selectionMode="single"
          onSelectionChange={handleSelectionChange}
          items={eips}
          renderEmptyState={() => (
            <span className="m-4">No EIPs to display</span>
          )}
          className="-m-4"
        >
          {(item: any) => (
            <ListBoxItem
              textValue={String(item.model.name)}
              key={String(item.model.name)}
              id={String(item.model.name)}
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
                    <img
                      src={`/camel-icons/eips/${String(item.model.name)}.svg`}
                      alt={String(item.model.name)}
                      className="h-9 w-9 rounded-md border border-border/60 bg-secondary/40 p-1.5"
                    />
                    <div className="min-w-0">
                      <Card.Title className="truncate text-sm/5">
                        {String(item.model.title)}
                      </Card.Title>
                    </div>
                  </Card.Header>
                  <Card.Content className="flex flex-1 flex-col px-3 pb-3">
                    <p className="line-clamp-2 text-sm text-muted-fg">
                      {String(item.model.description)}
                    </p>
                    <div className="mt-auto pt-3">
                      <Badge intent="info">EIP</Badge>
                    </div>
                  </Card.Content>
                </Card>
              )}
            </ListBoxItem>
          )}
        </ListBox>
      </Virtualizer>
      <Modal.Content
        isOpen={selectedEip != null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedEip(null);
        }}
        size="2xl"
        isBlurred
      >
        <Modal.Header>
          <div className="flex items-center gap-2">
            <Badge intent="info">EIP</Badge>
            {selectedEip && (
              <Badge intent="outline">{String(selectedEip.model.name)}</Badge>
            )}
          </div>
          <Modal.Title>
            {selectedEip ? String(selectedEip.model.title) : ""}
          </Modal.Title>
          <Modal.Description>
            {selectedEip ? String(selectedEip.model.description) : ""}
          </Modal.Description>
        </Modal.Header>
        <Modal.Body className="space-y-4">
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
