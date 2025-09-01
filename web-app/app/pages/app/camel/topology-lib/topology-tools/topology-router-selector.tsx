import { useReactFlow } from "@xyflow/react";
import { buttonStyles } from "app/components/ui/button";
import { useTopologyStore } from "core";
import { Select } from "@/components/ui/select";
import type { Key } from "react-stately";
import { useSearchParams } from "react-router";

export function TopologyRouteSelector() {
  const { fitView } = useReactFlow();
  const [query, setQuery] = useSearchParams();
  const { camelConfig } = useTopologyStore();

  const camelRoutes = camelConfig?.data?.map((element) => {
    return {
      id: element.route?.id,
      label: element.route?.id,
    };
  });

  function handleRouteChange(selectedRouteId: Key | null) {
    const nextCurrentRoute = camelConfig?.data?.find(
      (route) => route.route?.id === selectedRouteId,
    );
    if (nextCurrentRoute) {
      fitView({ duration: 300 });
      setQuery(new URLSearchParams({ route: selectedRouteId as string }));
    }
  }

  return (
    <Select
      aria-label="Select a route"
      onSelectionChange={handleRouteChange}
      placeholder="Select a route"
      selectedKey={query.get("route") || undefined}
    >
      <Select.Trigger
        className={buttonStyles({
          className: "w-[140px] bg-primary-foreground h-7",
          intent: "secondary",
        })}
      />
      <Select.List items={camelRoutes}>
        {(item) => (
          <Select.Option id={item.id as string}>{item.label}</Select.Option>
        )}
      </Select.List>
    </Select>
  );
}
