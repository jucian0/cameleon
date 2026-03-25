import { tryCatch } from "@/utils/try-catch";
import {
  GridLayout,
  ListBox,
  ListBoxItem,
  Virtualizer,
  type Key,
  type Selection,
} from "react-aria-components";
import { Card } from "app/components/ui/card";
import { type LoaderFunctionArgs } from "react-router";
import type { EPIDefinition } from "core";
import axios from "axios";

export function meta() {
  return [
    { title: "Presets | Cameleon" },
    { description: "See all your presets here." },
  ];
}

export const handle = {
  breadcrumb: () => "Presets",
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

  function handleSelectionChange(selectedKeys: Selection) {
    const [selectedItem] = Array.from(selectedKeys as Set<Key>)
      .map((key) => eips.find((item) => item.model.name === key))
      .filter(Boolean);
    if (!selectedItem) return;
  }

  return (
    <Virtualizer layout={GridLayout}>
      <ListBox
        selectionMode="single"
        onSelectionChange={handleSelectionChange}
        items={eips}
        renderEmptyState={() => <span className="m-4">No EIPs to display</span>}
        className="-m-4"
      >
        {(item: any) => (
          <ListBoxItem
            textValue={String(item.model.name)}
            key={String(item.model.name)}
            id={String(item.model.name)}
          >
            <Card className="h-40 overflow-auto p-0">
              <Card.Header className="flex gap-2 p-2">
                <img
                  src={`/camel-icons/eips/${String(item.model.name)}.svg`}
                  alt={String(item.model.name)}
                  className="h-8 w-8"
                />
                <div className="flex flex-col">{String(item.model.title)}</div>
              </Card.Header>
              <Card.Content className="p-2">
                {String(item.model.description)}
              </Card.Content>
            </Card>
          </ListBoxItem>
        )}
      </ListBox>
    </Virtualizer>
  );
}
