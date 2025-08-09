import { tryCatch } from "@/utils/try-catch";
import { useAsyncList, type Key, type Selection } from "react-stately";
import { fetchEIPsMetadata } from "./data-requests/fetch-metadata";
import {
  GridLayout,
  ListBox,
  ListBoxItem,
  Virtualizer,
} from "react-aria-components";
import { Card } from "components/ui/card";

export const handle = {
  breadcrumb: () => "EIPs",
};

export default function CamelEIPsTab({
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
