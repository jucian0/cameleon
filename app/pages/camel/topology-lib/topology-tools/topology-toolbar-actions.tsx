import { useTopologyStore } from "../topology-store";
import type { Key } from "react-stately";
import { Select } from "components/ui/select";
import { Button, buttonStyles } from "components/ui/button";
import { IconCheck } from "@intentui/icons";
import { TopologyEditor } from "../topology-editor/code-editor";


export const TopologyToolbarActions = () => {
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
    <div className={`flex items-center gap-1`}>
      <Button size="extra-small"><IconCheck />Save</Button>
      <Select aria-label="Select a route" onSelectionChange={handleRouteChange} placeholder="Select a route" selectedKey={currentCamelRouteId}>
        <Select.Trigger className={buttonStyles({
          className: "w-[140px] bg-primary-foreground",
          intent: "secondary",
          size: "extra-small",
        })} />
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
      <TopologyEditor />
    </div>
  );
};
