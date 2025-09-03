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
    const nextValue = selectedRouteId === "all" ? "" : selectedRouteId;
    fitView({ duration: 300 });
    setQuery((query) => {
      query.set("route", nextValue as string);
      return query;
    });
  }

  return (
    <Select
      aria-label="Select a route"
      onSelectionChange={handleRouteChange}
      placeholder="Select a route"
      selectedKey={query.get("route") || "all"}
    >
      <Select.Trigger
        className={buttonStyles({
          className: "w-[140px] bg-primary-foreground h-7",
          intent: "secondary",
        })}
      />
      <Select.List items={camelRoutes.concat({ id: "all", label: "All" })}>
        {(item) => (
          <Select.Option id={item.id as string}>{item.label}</Select.Option>
        )}
      </Select.List>
    </Select>
  );
}
