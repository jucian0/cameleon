import { type Key, type Selection, useAsyncList } from "react-stately";
import {
  Autocomplete,
  ListBox,
  ListBoxItem,
  useFilter,
  Virtualizer,
  GridLayout,
} from "react-aria-components";
import { addBetween, addStep } from "core/operations";
import { useLayer } from "./topology-layer";
import { getDefaultConfig, useTopologyStore } from "core";
import { Tab, TabList, TabPanel, Tabs } from "app/components/ui/tabs";
import { tryCatch } from "@/utils/try-catch";
import { SearchField } from "app/components/ui/search-field";
import {
  fetchComponentsMetadata,
  fetchEIPsMetadata,
} from "../../data-requests/fetch-metadata";
import { Button } from "app/components/ui/button";
import { Card } from "app/components/ui/card";
import { Badge } from "app/components/ui/badge";
import { Modal } from "app/components/ui/modal";
import { CircleHelp } from "lucide-react";
import React from "react";

const HIDDEN_STRUCTURAL_EIPS = new Set([
  "when",
  "otherwise",
  "doCatch",
  "doFinally",
  "fallback",
]);

export function TopologyLibrary() {
  const { node, setNode } = useLayer();
  const { camelConfig, setCamelConfig } = useTopologyStore();
  const { contains } = useFilter({ sensitivity: "base" });
  const [filter, setFilter] = React.useState("");

  React.useEffect(() => {
    if (!["add-between", "add-step"].includes(node?.operation ?? "")) {
      const value = node?.stepType?.split("-")[1] ?? "";
      setFilter(value);
    }
  }, [node?.operation, node?.stepType]);

  function handleSelectionChange(selectedItem: Selection) {
    const [selectedItemKey] = Array.from(selectedItem);
    try {
      if (!selectedItem || !node?.absolutePath) return;
      const newStepConfig = {
        [selectedItemKey]: getDefaultConfig(selectedItemKey as string),
      };

      if (node.operation === "add-step") {
        setCamelConfig(addStep(camelConfig, node.absolutePath, newStepConfig));
        return setNode();
      }

      if (["add-between", "add-when", "add-doCatch"].includes(node.operation)) {
        setCamelConfig(
          addBetween(camelConfig, node.absolutePath, newStepConfig),
        );
        return setNode();
      }

      setNode();
    } catch (error) {
      console.error("Error adding step:", error);
    }
  }

  return (
    <Autocomplete
      inputValue={filter}
      onInputChange={setFilter}
      aria-label="Topology library"
      filter={contains}
    >
      <div className="flex items-center gap-2">
        <SearchField
          aria-label="Search by name"
          placeholder="Search"
          className="w-full"
        />
      </div>
      <Tabs aria-label="Camel EIPs and Components" defaultSelectedKey="eips">
        <TabList>
          <Tab id="eips">EIPs</Tab>
          <Tab id="components">Components</Tab>
        </TabList>
        <TabPanel id="eips">
          <CamelEIPsTab onSelectionChange={handleSelectionChange} />
        </TabPanel>
        <TabPanel id="components">
          <CamelComponentsTab onSelectionChange={handleSelectionChange} />
        </TabPanel>
      </Tabs>
    </Autocomplete>
  );
}

type LibraryItemDetails =
  | {
      kind: "component";
      title: string;
      name: string;
      description: string;
      syntax?: string;
      propertyCount: number;
      requiredCount: number;
      groups: string[];
    }
  | {
      kind: "eip";
      title: string;
      name: string;
      description: string;
      propertyCount: number;
      requiredCount: number;
      groups: string[];
    };

function getCommonDetails(
  properties: Readonly<Record<string, { required?: boolean; group?: string }>>,
) {
  const entries = Object.values(properties ?? {});
  const groups = Array.from(
    new Set(entries.map((property) => property.group).filter(Boolean)),
  ) as string[];

  return {
    propertyCount: entries.length,
    requiredCount: entries.filter((property) => property.required).length,
    groups,
  };
}

function LibraryItemDetailsModal({
  item,
  isOpen,
  onOpenChange,
}: {
  item: LibraryItemDetails | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  if (!item) return null;

  return (
    <Modal.Content
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="xl"
      isBlurred
    >
      <Modal.Header>
        <div className="flex items-center gap-2">
          <Badge intent={item.kind === "component" ? "secondary" : "info"}>
            {item.kind === "component" ? "Component" : "EIP"}
          </Badge>
          <Badge intent="outline">{item.name}</Badge>
        </div>
        <Modal.Title>{item.title}</Modal.Title>
        <Modal.Description>{item.description}</Modal.Description>
      </Modal.Header>
      <Modal.Body className="space-y-4">
        {"syntax" in item && item.syntax ? (
          <div className="space-y-1 rounded-lg border border-border bg-muted/20 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
              Syntax
            </p>
            <code className="text-sm text-foreground">{item.syntax}</code>
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
              Properties
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {item.propertyCount}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
              Required
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {item.requiredCount}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
              Groups
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {item.groups.length}
            </p>
          </div>
        </div>
        {item.groups.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Groups</p>
            <div className="flex flex-wrap gap-2">
              {item.groups.map((group) => (
                <Badge key={group} intent="outline">
                  {group}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Modal.Close>Close</Modal.Close>
      </Modal.Footer>
    </Modal.Content>
  );
}

function CamelComponentsTab({
  onSelectionChange,
}: Readonly<{ onSelectionChange: (selectedKeys: Selection) => void }>) {
  const [detailsItem, setDetailsItem] =
    React.useState<LibraryItemDetails | null>(null);
  const components = useAsyncList({
    async load() {
      const { data, error } = await tryCatch(fetchComponentsMetadata());
      if (error) {
        return { items: [] };
      }
      return { items: Object.values(data.data) };
    },
  });

  function handleSelectionChange(selectedKeys: Selection) {
    const [selectedItem] = Array.from(selectedKeys as Set<Key>)
      .map((key) =>
        components.items.find((item) => item.component.name === key),
      )
      .filter(Boolean);
    if (!selectedItem) return;
    onSelectionChange(selectedKeys);
  }

  return (
    <>
      <Virtualizer layout={GridLayout}>
        <ListBox
          className={"-m-4"}
          selectionMode="single"
          onSelectionChange={handleSelectionChange}
          renderEmptyState={() => (
            <span className="m-4">No components to display</span>
          )}
        >
          {components.items.map((item) => (
            <ListBoxItem
              textValue={item.component.name}
              key={item.component.name}
              id={item.component.name}
            >
              {({ isSelected, isFocusVisible }) => (
                <Card
                  className={`relative h-44 gap-0 overflow-hidden border-border/60 bg-bg/80 py-0 transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                      : "hover:border-primary/40 hover:bg-muted/20"
                  } ${isFocusVisible ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background" : ""}`}
                >
                  <div className="absolute right-3 top-3 z-10">
                    <Button
                      intent="plain"
                      size="sq-xs"
                      onPress={(event) => {
                        event.continuePropagation?.();
                        setDetailsItem({
                          kind: "component",
                          title: item.component.title,
                          name: item.component.name,
                          description: item.component.description,
                          syntax:
                            typeof item.component.syntax === "string"
                              ? item.component.syntax
                              : undefined,
                          ...getCommonDetails(item.properties),
                        });
                      }}
                      aria-label={`View details for ${item.component.title}`}
                    >
                      <CircleHelp data-slot="icon" />
                    </Button>
                  </div>
                  <Card.Header className="grid-cols-[auto_1fr] gap-3 px-3 py-3 pr-12">
                    <img
                      src={`/camel-icons/components/${item.component.name}.svg`}
                      alt={item.component.name}
                      className="h-9 w-9 rounded-md border border-border/60 bg-secondary/40 p-1.5"
                    />
                    <div className="min-w-0">
                      <Card.Title className="truncate text-sm/5">
                        {item.component.title}
                      </Card.Title>
                    </div>
                  </Card.Header>
                  <Card.Content className="flex flex-1 flex-col px-3 pb-3">
                    <p className="line-clamp-2 text-sm text-muted-fg">
                      {item.component.description}
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
      <LibraryItemDetailsModal
        item={detailsItem}
        isOpen={detailsItem != null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDetailsItem(null);
        }}
      />
    </>
  );
}

function CamelEIPsTab({
  onSelectionChange,
}: Readonly<{ onSelectionChange: (selectedKeys: Selection) => void }>) {
  const [detailsItem, setDetailsItem] =
    React.useState<LibraryItemDetails | null>(null);
  const eips = useAsyncList({
    async load() {
      const { data, error } = await tryCatch(fetchEIPsMetadata());
      if (error) {
        return { items: [] };
      }
      return {
        items: Object.values(data.data).filter(
          (item) => !HIDDEN_STRUCTURAL_EIPS.has(item.model.name),
        ),
      };
    },
  });

  function handleSelectionChange(selectedKeys: Selection) {
    const [selectedItem] = Array.from(selectedKeys as Set<Key>)
      .map((key) => eips.items.find((item) => item.model.name === key))
      .filter(Boolean);
    if (!selectedItem) return;
    onSelectionChange(selectedKeys);
  }
  return (
    <>
      <Virtualizer layout={GridLayout}>
        <ListBox
          selectionMode="single"
          onSelectionChange={handleSelectionChange}
          items={eips.items}
          renderEmptyState={() => (
            <span className="m-4">No EIPs to display</span>
          )}
          className={"-m-4"}
        >
          {(item) => (
            <ListBoxItem
              textValue={item.model.name}
              key={item.model.name}
              id={item.model.name}
            >
              {({ isSelected, isFocusVisible }) => (
                <Card
                  className={`relative h-44 gap-0 overflow-hidden border-border/60 bg-bg/80 py-0 transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                      : "hover:border-primary/40 hover:bg-muted/20"
                  } ${isFocusVisible ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background" : ""}`}
                >
                  <div className="absolute right-3 top-3 z-10">
                    <Button
                      intent="plain"
                      size="sq-xs"
                      onPress={(event) => {
                        event.continuePropagation?.();
                        setDetailsItem({
                          kind: "eip",
                          title: item.model.title,
                          name: item.model.name,
                          description: item.model.description,
                          ...getCommonDetails(item.properties),
                        });
                      }}
                      aria-label={`View details for ${item.model.title}`}
                    >
                      <CircleHelp data-slot="icon" />
                    </Button>
                  </div>
                  <Card.Header className="grid-cols-[auto_1fr] gap-3 px-3 py-3 pr-12">
                    <img
                      src={`/camel-icons/eips/${item.model.name}.svg`}
                      alt={item.model.name}
                      className="h-9 w-9 rounded-md border border-border/60 bg-secondary/40 p-1.5"
                    />
                    <div className="min-w-0">
                      <Card.Title className="truncate text-sm/5">
                        {item.model.title}
                      </Card.Title>
                    </div>
                  </Card.Header>
                  <Card.Content className="flex flex-1 flex-col px-3 pb-3">
                    <p className="line-clamp-2 text-sm text-muted-fg">
                      {item.model.description}
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
      <LibraryItemDetailsModal
        item={detailsItem}
        isOpen={detailsItem != null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDetailsItem(null);
        }}
      />
    </>
  );
}
