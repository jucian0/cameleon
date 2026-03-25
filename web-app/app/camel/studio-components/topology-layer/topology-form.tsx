import { DynamicForm } from "./dynamic-form";
import React from "react";
import dot from "dot-prop-immutable";
import { useLayer } from "./topology-layer";
import { EIPSListNames, useTopologyStore } from "core";
import {
  fetchComponentsMetadata,
  fetchEIPsMetadata,
} from "../../data-requests/fetch-metadata";
import { tryCatch } from "@/utils/try-catch";

const INLINE_NODE_TYPES = new Set([
  "when",
  "otherwise",
  "doCatch",
  "doFinally",
  "fallback",
]);

function getNodeConfigPath(node?: { absolutePath: string; stepType: string }) {
  if (!node) return "";
  if (node.absolutePath.endsWith(".from")) return node.absolutePath;
  if (INLINE_NODE_TYPES.has(node.stepType)) return node.absolutePath;
  return `${node.absolutePath}.${node.stepType}`;
}

export function Form() {
  const { node, setNode } = useLayer();
  const { camelConfig, setCamelConfig } = useTopologyStore();
  const [metadata, setMetadata] = React.useState<Record<string, any>[]>([]);

  const kind = EIPSListNames.includes(node?.stepType ?? "") ? "eip" : "component";
  const configPath = React.useMemo(() => getNodeConfigPath(node), [node]);

  React.useEffect(() => {
    let isMounted = true;

    async function loadMetadata() {
      const request =
        kind === "eip" ? fetchEIPsMetadata() : fetchComponentsMetadata();
      const { data, error } = await tryCatch(request);
      if (!isMounted || error) return;
      setMetadata(Object.values(data.data ?? {}));
    }

    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, [kind]);

  const formData = React.useMemo(() => {
    return dot.get(camelConfig, configPath, {}) ?? {};
  }, [camelConfig, configPath]);

  const formSchema = React.useMemo(() => {
    const entry = metadata.find((item: any) => {
      if (kind === "eip") return item.model?.name === node?.stepType;
      return item.component?.name === node?.stepType;
    });
    return entry?.properties ?? {};
  }, [kind, metadata, node?.stepType]);

  function handleSubmit(updatedFormData: Record<string, any>) {
    if (!node || !configPath) return;
    setCamelConfig(dot.set(camelConfig, configPath, updatedFormData));
    setNode();
  }

  if (!node || !configPath) return null;

  return (
    <DynamicForm
      schema={formSchema}
      initialFormData={formData}
      onSubmit={handleSubmit}
      onCancel={() => setNode()}
    />
  );
}
