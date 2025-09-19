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
import { getDefaultConfig } from "core";
import { Tab, TabList, TabPanel, Tabs } from "app/components/ui/tabs";
import { tryCatch } from "@/utils/try-catch";
import { SearchField } from "app/components/ui/search-field";
import { useTopologyStore } from "core";
import {
  fetchComponentsMetadata,
  fetchEIPsMetadata,
} from "../../../../data-requests/fetch-metadata";
import { Card } from "app/components/ui/card";
import React from "react";

export function TopologyLibrary() {
  const { node, setNode } = useLayer();
  const { camelConfig, setCamelConfig } = useTopologyStore();
  const { contains } = useFilter({ sensitivity: "base" });
  const [filter, setFilter] = React.useState("");

  console.log("TopologyLibrary node:", node?.absolutePath);

  React.useEffect(() => {
    if (!["add-between", "add-step"].includes(node?.operation ?? "")) {
      const value = node?.stepType?.split("-")[1] ?? "";
      setFilter(value);
    }
  }, []);

  function handleSelectionChange(selectedItem: Set<Key>) {
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

      if (
        ["add-between", "add-when", "add-doCatch"].includes(node.operation!)
      ) {
        setCamelConfig(
          addBetween(camelConfig, node.absolutePath, newStepConfig),
        );
        return setNode();
      }

      // const selectedRoute = camelConfig.data.find(
      //   (route) => route.route?.id === node.routeId,
      // );

      // if (!selectedRoute) {
      //   const route = addNewRoute(newStepConfig);
      //   const nextCamelConfig = dotProp.set(
      //     camelConfig,
      //     route.absolutePath,
      //     route,
      //   );
      //   setCamelConfig(nextCamelConfig);
      //   // updateCamelRoute(route);
      //   // setCamelRouteId(route.route.id);
      //   setNode();
      //   return;
      // }

      // if (node.operation === "add-step") {
      //   const updatedRoute = addStepAfter(
      //     selectedRoute,
      //     node.absolutePath,
      //     newStepConfig,
      //   );
      //   const nextCamelConfig = dotProp.set(
      //     camelConfig,
      //     `data.${camelConfig.data.indexOf(selectedRoute)}`,
      //     updatedRoute,
      //   );
      //   setCamelConfig(nextCamelConfig);
      //   // updateCamelRoute(updatedRoute);
      // }

      // if (node.operation === "add-step-between") {
      //   const updatedRoute = addStepBetween(
      //     selectedRoute,
      //     node.absolutePath,
      //     newStepConfig,
      //   );
      //   const nextCamelConfig = dotProp.set(
      //     camelConfig,
      //     `data.${camelConfig.data.indexOf(selectedRoute)}`,
      //     updatedRoute,
      //   );
      //   setCamelConfig(nextCamelConfig);
      //   // updateCamelRoute(updatedRoute);
      // }
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

function CamelComponentsTab({
  onSelectionChange,
}: {
  onSelectionChange: (node: any) => void;
}) {
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
            <Card className="h-40 overflow-auto p-0">
              <Card.Header className="flex gap-2 p-2">
                <img
                  src={`/camel-icons/components/${item.component.name}.svg`}
                  alt={item.component.name}
                  className="h-8 w-8 rounded"
                />
                <div className="flex flex-col">{item.component.title}</div>
              </Card.Header>
              <Card.Content className="p-2">
                {item.component.description}
              </Card.Content>
            </Card>
          </ListBoxItem>
        ))}
      </ListBox>
    </Virtualizer>
  );
}

function CamelEIPsTab({
  onSelectionChange,
}: Readonly<{ onSelectionChange: (node: any) => void }>) {
  const eips = useAsyncList({
    async load() {
      const { data, error } = await tryCatch(fetchEIPsMetadata());
      if (error) {
        return { items: [] };
      }
      return { items: Object.values(data.data) };
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
    <Virtualizer layout={GridLayout}>
      <ListBox
        selectionMode="single"
        onSelectionChange={handleSelectionChange}
        items={eips.items}
        renderEmptyState={() => <span className="m-4">No EIPs to display</span>}
        className={"-m-4"}
      >
        {(item) => (
          <ListBoxItem
            textValue={item.model.name}
            key={item.model.name}
            id={item.model.name}
          >
            <Card className="h-40 overflow-auto p-0">
              <Card.Header className="flex gap-2 p-2">
                <img
                  src={`/camel-icons/eips/${item.model.name}.svg`}
                  alt={item.model.name}
                  className="h-8 w-8"
                />
                <div className="flex flex-col">{item.model.title}</div>
              </Card.Header>
              <Card.Content className="p-2">
                {item.model.description}
              </Card.Content>
            </Card>
          </ListBoxItem>
        )}
      </ListBox>
    </Virtualizer>
  );
}
