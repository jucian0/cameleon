import { useTopologyStore } from "core";
import type { Key } from "react-stately";
import { Select } from "app/components/ui/select";
import { Button, buttonStyles } from "app/components/ui/button";
import { TopologyEditor } from "../topology-editor/code-editor";
import { useNavigation, useSubmit } from "react-router";
import { Loader } from "app/components/ui/loader";

export const TopologyToolbarActions = () => {
  const {
    camelConfig,
    currentCamelRouteId,
    setCurrentCamelRouteId,
    getCamelConfigYaml,
  } = useTopologyStore();
  const submit = useSubmit();
  const navigation = useNavigation();

  function handleSave() {
    submit({ content: getCamelConfigYaml() }, { method: "post" });
  }

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
      setCurrentCamelRouteId(nextCurrentRoute.route?.id as string);
    }
  }

  return (
    <div className={`flex items-center gap-1`}>
      <Button
        size="sm"
        onPress={handleSave}
        isPending={navigation.state === "submitting"}
      >
        {navigation.state === "submitting" && <Loader />}
        Save
      </Button>
      <Select
        aria-label="Select a route"
        onSelectionChange={handleRouteChange}
        placeholder="Select a route"
        selectedKey={currentCamelRouteId}
      >
        <Select.Trigger
          className={buttonStyles({
            className: "w-[140px] bg-primary-foreground",
            intent: "secondary",
            size: "xs",
          })}
        />
        <Select.List items={camelRoutes}>
          {(item) => (
            <Select.Option id={item.id as string}>{item.label}</Select.Option>
          )}
        </Select.List>
      </Select>
      <TopologyEditor />
    </div>
  );
};
