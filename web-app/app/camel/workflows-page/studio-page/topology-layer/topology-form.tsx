import { DynamicForm } from "./dynamic-form";
import { useAsyncList } from "react-stately";
import React from "react";
import dot from "dot-prop-immutable";
import { useLayer } from "./topology-layer";
import { EIPSListNames, useTopologyStore } from "core";

export function Form() {
  const { node } = useLayer();
  const { camelConfig } = useTopologyStore();
  const selectedRoute = camelConfig?.data?.find(
    (route: any) => route.route.id === "",
  );

  const kind = EIPSListNames.includes(node?.stepType!) ? "eip" : "component";

  const formData = React.useMemo(() => {
    return dot.get(selectedRoute, node?.absolutePath ?? "") ?? {};
  }, [selectedRoute, node?.absolutePath]);

  const nodeData = useAsyncList({
    async load() {
      let response: any = [];
      if (kind === "eip") {
        response = await fetch("metadata/eips.json");
      } else {
        response = await fetch("metadata/components.json");
      }
      const data = await response.json();
      return {
        items: data,
      };
    },
  });

  const formSchema = React.useMemo(() => {
    return (
      nodeData?.items?.find((item: any) => item.name === node?.stepType) ?? {}
    );
  }, [nodeData.items, node?.stepType]);

  function handleSubmit(formData: any) {
    if (node) {
      const updatedJson = dot.set(selectedRoute, node?.absolutePath, formData);
      //fix it here
      // updateCamelRoute(updatedJson, "");
    }
  }

  return (
    <DynamicForm
      schema={formSchema}
      initialFormData={formData ?? {}}
      onSubmit={handleSubmit}
    />
  );
}

// going to work with routes
// /edit route for editting node details
// /add route for adding new nodes
// /replace for replacing nodes
// /add-between for adding nodes between existing nodes
