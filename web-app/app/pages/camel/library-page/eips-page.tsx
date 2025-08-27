import { tryCatch } from "@/utils/try-catch";
import { type Key, type Selection } from "react-stately";
import {
  GridLayout,
  ListBox,
  ListBoxItem,
  Virtualizer,
} from "react-aria-components";
import { Card } from "app/components/ui/card";
import axios from "axios";
import type { EPIDefinition } from "core";
import type { Route } from "./+types/eips-page";
import type { LoaderFunctionArgs } from "react-router";

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

  return {
    eips: error ? [] : Object.values(data?.data),
  };
}

export default function CamelEIPsTab({ loaderData }: Route.ComponentProps) {
  const { eips } = loaderData;

  function handleSelectionChange(selectedKeys: Selection) {
    const [selectedItem] = Array.from(selectedKeys as Set<Key>)
      .map((key) => eips.find((item) => item.model.name === key))
      .filter(Boolean);
    if (!selectedItem) return;
    // onSelectionChange(selectedKeys);
  }

  return (
    <Virtualizer layout={GridLayout}>
      <ListBox
        selectionMode="single"
        onSelectionChange={handleSelectionChange}
        items={eips}
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
