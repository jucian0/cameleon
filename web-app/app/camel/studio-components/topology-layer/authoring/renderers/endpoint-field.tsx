import React from "react";
import { Checkbox } from "app/components/ui/checkbox";
import { TextField } from "app/components/ui/text-field";
import { Textarea } from "app/components/ui/textarea";
import type { FieldRendererProps } from "../types";
import { parseKeyValueLines } from "../field-registry";
import { parseEndpointUri, serializeEndpointUri } from "../endpoint-model";

function normalizeParameters(formData: Record<string, unknown>, uri: string) {
  const parsed = parseEndpointUri(uri);
  const existingParameters = formData.parameters;

  if (
    existingParameters &&
    typeof existingParameters === "object" &&
    !Array.isArray(existingParameters)
  ) {
    return existingParameters as Record<string, unknown>;
  }

  return parsed?.parameters ?? {};
}

export function EndpointField({
  label,
  description,
  value,
  formData,
  onChange,
  onFormDataChange,
}: FieldRendererProps) {
  const uri = typeof value === "string" ? value : "";
  const parsed = React.useMemo(() => parseEndpointUri(uri), [uri]);
  const [rawMode, setRawMode] = React.useState(() => !parsed);

  React.useEffect(() => {
    setRawMode(!parsed);
  }, [parsed?.component, parsed?.target, uri]);

  const parameters = React.useMemo(
    () => normalizeParameters(formData, uri),
    [formData, uri],
  );

  function updateEndpoint(next: {
    component?: string;
    target?: string;
    parameters?: Record<string, unknown>;
  }) {
    const currentModel = parsed ?? {
      component: "",
      target: "",
      parameters,
    };

    const nextModel = {
      component: next.component ?? currentModel.component,
      target: next.target ?? currentModel.target,
      parameters: next.parameters ?? currentModel.parameters,
    };

    const nextUri = serializeEndpointUri(nextModel);
    onChange(nextUri);
    onFormDataChange({
      ...formData,
      uri: nextUri,
      parameters: nextModel.parameters,
    });
  }

  const preview = parsed
    ? serializeEndpointUri({
        component: parsed.component,
        target: parsed.target,
        parameters,
      })
    : uri;

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <Checkbox
        isSelected={rawMode}
        onChange={(nextRawMode) => {
          if (!nextRawMode && !parseEndpointUri(uri)) {
            return;
          }
          setRawMode(nextRawMode);
        }}
        label="Raw URI mode"
        description="Use raw mode when the endpoint shape cannot be safely modeled."
      />

      {rawMode ? (
        <Textarea
          label={label}
          description={
            description
              ? `${description} Raw edits keep the current parameter state until the URI is modeled again.`
              : "Raw edits keep the current parameter state until the URI is modeled again."
          }
          placeholder="direct:start"
          value={uri}
          onChange={(nextValue) => onChange(nextValue)}
        />
      ) : (
        <>
          <TextField
            label="Component"
            value={parsed?.component ?? ""}
            onChange={(nextValue) => updateEndpoint({ component: nextValue })}
          />
          <TextField
            label="Target"
            description={description}
            value={parsed?.target ?? ""}
            onChange={(nextValue) => updateEndpoint({ target: nextValue })}
          />
          <Textarea
            label="Query Parameters"
            description="One key=value entry per line. Serialized in deterministic key order."
            placeholder={"timeout=1000\nbridgeErrorHandler=true"}
            value={Object.entries(parameters)
              .sort(([left], [right]) => left.localeCompare(right))
              .map(([key, item]) => `${key}=${String(item)}`)
              .join("\n")}
            onChange={(nextValue) =>
              updateEndpoint({
                parameters: parseKeyValueLines(nextValue),
              })
            }
          />
          <TextField
            label="Generated URI Preview"
            value={preview}
            isReadOnly
          />
        </>
      )}
    </div>
  );
}
