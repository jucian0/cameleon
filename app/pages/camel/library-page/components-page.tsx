import { tryCatch } from "@/utils/try-catch";
import { type Key, type Selection } from "react-stately";
import {
  GridLayout,
  ListBox,
  ListBoxItem,
  Virtualizer,
} from "react-aria-components";
import { Card } from "app/components/ui/card";
import { FallbackImage } from "app/components/fallback-image";
import type { LoaderFunctionArgs } from "react-router";
import type { ComponentDefinition } from "../topology-lib/topology-types";
import axios from "axios";
import type { Route } from "./+types/components-page";

export const handle = {
  breadcrumb: () => "Components",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const componentsUrl = url.origin + "/metadata/components.json";
  const { error, data } = await tryCatch(
    axios.get<ComponentDefinition[]>(componentsUrl),
  );

  return {
    components: error ? [] : Object.values(data?.data),
  };
}

export default function CamelComponentsTab({
  loaderData,
}: Route.ComponentProps) {
  const { components } = loaderData;

  function handleSelectionChange(selectedKeys: Selection) {
    const [selectedItem] = Array.from(selectedKeys as Set<Key>)
      .map((key) => components?.find((item) => item.component.name === key))
      .filter(Boolean);
    if (!selectedItem) return;
    // onSelectionChange(selectedKeys);
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
        {components?.map((item) => (
          <ListBoxItem
            textValue={item.component.name}
            key={item.component.name}
            id={item.component.name}
          >
            <Card className="h-40 overflow-auto p-0">
              <Card.Header className="flex gap-2 p-2">
                <FallbackImage
                  src={`/camel-icons/app/components/${item.component.name}.svg`}
                  alt={item.component.name}
                  className="h-8 w-8 rounded"
                  fallback="/camel-icons/app/components/generic.svg"
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
