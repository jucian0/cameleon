import { AuthoringForm } from "./authoring/authoring-form";
import React from "react";
import dot from "dot-prop-immutable";
import { useLayer } from "./topology-layer";
import { EIPSListNames, useTopologyStore } from "core";
import {
  fetchComponentsMetadata,
  fetchEIPsMetadata,
} from "../../data-requests/fetch-metadata";
import { tryCatch } from "@/utils/try-catch";
import type { PropertySchema } from "./authoring/types";

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

  const kind = EIPSListNames.includes(node?.stepType ?? "")
    ? "eip"
    : "component";
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
    const componentName = (node?.stepType ?? "").split(":")[0];
    const entry = metadata.find((item: any) => {
      if (kind === "eip") return item.model?.name === node?.stepType;
      return item.component?.name === componentName;
    });
    const entryProperties = (entry?.properties ?? {}) as Record<
      string,
      PropertySchema
    >;

    if (
      kind === "component" &&
      formData &&
      typeof formData === "object" &&
      "uri" in formData
    ) {
      const objectFormData = formData as Record<string, unknown>;
      const inferredSchema = Object.keys(objectFormData)
        .filter((key) => key !== "steps")
        .reduce(
          (acc, key) => {
            const existingProperty = entryProperties[key];
            if (existingProperty) {
              acc[key] = existingProperty;
              return acc;
            }

            const value = objectFormData[key];
            acc[key] = {
              displayName: key.replace(/([A-Z])/g, " $1").trim(),
              group: key === "uri" ? "common" : "advanced",
              type:
                typeof value === "boolean"
                  ? "boolean"
                  : typeof value === "number"
                    ? "number"
                    : Array.isArray(value)
                      ? "array"
                      : value && typeof value === "object"
                        ? "object"
                        : "string",
            };
            return acc;
          },
          {} as Record<string, PropertySchema>,
        );

      if (!inferredSchema.uri) {
        inferredSchema.uri = {
          displayName: "Uri",
          group: "common",
          type: "string",
          required: true,
          description: "The endpoint URI for this Camel endpoint.",
        };
      }

      return inferredSchema;
    }

    return entryProperties;
  }, [formData, kind, metadata, node?.stepType]);

  function handleSubmit(updatedFormData: Record<string, any>) {
    if (!node || !configPath) return;
    setCamelConfig(dot.set(camelConfig, configPath, updatedFormData));
    setNode();
  }

  if (!node || !configPath) return null;

  return (
    <AuthoringForm
      schema={formSchema}
      initialFormData={formData}
      onSubmit={handleSubmit}
      onCancel={() => setNode()}
    />
  );
}
