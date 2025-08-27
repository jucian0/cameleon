import { DynamicForm } from "./dynamic-form";
import { useAsyncList } from "react-stately";
import React from "react";
import dot from "dot-prop-immutable";
import { useLayer } from "./topology-layer";
import { useTopologyStore } from "core";

export function Form() {
  const { node } = useLayer();
  const { getCurrentCamelRoute, setCurrentCamelRoute } = useTopologyStore();
  const selectedRoute = getCurrentCamelRoute();

  const formData = React.useMemo(() => {
    return dot.get(selectedRoute, node?.absolutePath ?? "") ?? {};
  }, [selectedRoute, node?.absolutePath]);

  const episJson = useAsyncList({
    async load() {
      const response = await fetch("metadata/eips.json");
      const data = await response.json();
      return {
        items: data,
      };
    },
  });

  const formSchema = React.useMemo(() => {
    return (
      episJson?.items?.find((item: any) => item.name === node?.stepType) ?? {}
    );
  }, [episJson.items, node?.stepType]);

  function handleSubmit(formData: any) {
    if (node) {
      const updatedJson = dot.set(selectedRoute, node?.absolutePath, formData);
      setCurrentCamelRoute(updatedJson);
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
