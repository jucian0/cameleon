import { forwardRef } from "react";
import { Panel, type PanelProps } from "@xyflow/react";
import { useTopologyStore } from "../topology-store";
import type { Key } from "react-stately";
import { Select } from "components/ui/select";
import { Button } from "components/ui/button";
import { IconCheck } from "@intentui/icons";


export const TopologyRouteSelector = forwardRef<
  HTMLDivElement,
  Omit<PanelProps, "children">
>(({ className, ...props }, ref) => {
  const { camelConfig, currentCamelRouteId, setCurrentCamelRouteId } = useTopologyStore();


  const camelRoutes = camelConfig?.data?.map(element => {
    return {
      id: element.route?.id,
      label: element.route?.id,
    }
  });

  function handleRouteChange(selectedRouteId: Key) {
    const nextCurrentRoute = camelConfig?.data?.find((route) => route.route?.id === selectedRouteId);
    if (nextCurrentRoute) {
      setCurrentCamelRouteId(nextCurrentRoute.route?.id as string);
    }
  }

  return (
    <Panel
      ref={ref}
      className={`flex gap-2 bg-primary-foreground text-foreground ${className}`}
      {...props}
    >
      <Button><IconCheck />Save</Button>
      <Select onSelectionChange={handleRouteChange} placeholder="Select a route" selectedKey={currentCamelRouteId}>
        <Select.Trigger className="w-[140px] bg-primary-foreground" />
        <Select.List items={camelRoutes}>
          {
            (item) => (
              <Select.Option
                id={item.id as string}
              >
                {item.label}
              </Select.Option>
            )
          }
        </Select.List>
      </Select>
    </Panel>
  );
});
