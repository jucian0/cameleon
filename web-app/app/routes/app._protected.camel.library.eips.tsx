import { tryCatch } from "@/utils/try-catch";
import { type Key, type Selection } from "react-stately";
import { ListBox, ListBoxItem } from "react-aria-components";
import { Badge } from "app/components/ui/badge";
import { Card } from "app/components/ui/card";
import { LibraryItemDetailsModal } from "@/camel/library-components/library-item-details-modal";
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
  const detailsItem = selectedEip
    ? {
        kind: "eip" as const,
        title: String(selectedEip.model.title),
        name: String(selectedEip.model.name),
        description: String(selectedEip.model.description),
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
        selectionMode="single"
        onSelectionChange={handleSelectionChange}
        items={eips}
        renderEmptyState={() => <span>No EIPs to display</span>}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {(item: any) => (
          <ListBoxItem
            textValue={String(item.model.name)}
            key={String(item.model.name)}
            id={String(item.model.name)}
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
      <LibraryItemDetailsModal
        item={detailsItem}
        isOpen={selectedEip != null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedEip(null);
        }}
      />
    </>
  );
}
