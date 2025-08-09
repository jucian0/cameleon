import { tryCatch } from "@/utils/try-catch";
import { useAsyncList, type Key, type Selection } from "react-stately";
import { fetchComponentsMetadata } from "./data-requests/fetch-metadata";
import {
  GridLayout,
  ListBox,
  ListBoxItem,
  Virtualizer,
} from "react-aria-components";
import { Card } from "components/ui/card";
import { FallbackImage } from "components/fallback-image";

type CamelComponentTabProps = {
  readonly onSelectionChange: (node: any) => void;
};

export const handle = {
  breadcrumb: () => "Components",
};

export default function CamelComponentsTab({
  onSelectionChange,
}: CamelComponentTabProps) {
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
                <FallbackImage
                  src={`/camel-icons/components/${item.component.name}.svg`}
                  alt={item.component.name}
                  className="h-8 w-8 rounded"
                  fallback="/camel-icons/components/generic.svg"
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
