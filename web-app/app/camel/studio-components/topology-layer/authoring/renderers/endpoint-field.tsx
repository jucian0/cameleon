import React from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "app/components/ui/checkbox";
import { TextField } from "app/components/ui/text-field";
import { Textarea } from "app/components/ui/textarea";
import type { FieldRendererProps } from "../types";
import { parseKeyValueLinesWithIssues } from "../field-registry";
import {
  buildEndpointTarget,
  getEndpointPathDefinitions,
  parseEndpointUri,
  serializeEndpointUri,
  splitEndpointTarget,
} from "../endpoint-model";

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
  errorMessage,
  value,
  componentMetadata,
  formData,
  onChange,
  onErrorChange,
  onFormDataChange,
}: FieldRendererProps) {
  const uri = typeof value === "string" ? value : "";
  const parsed = React.useMemo(() => parseEndpointUri(uri), [uri]);
  const [rawMode, setRawMode] = React.useState(() => !parsed);
  const shouldPersistParameters = "parameters" in formData;
  const pathDefinitions = React.useMemo(
    () => getEndpointPathDefinitions(componentMetadata, parsed?.component),
    [componentMetadata, parsed?.component],
  );
  const pathSegments = React.useMemo(
    () => splitEndpointTarget(parsed?.target ?? ""),
    [parsed?.target],
  );

  React.useEffect(() => {
    if (!parsed) {
      setRawMode(true);
    }
  }, [parsed]);

  const parameters = React.useMemo(
    () => normalizeParameters(formData, uri),
    [formData, uri],
  );

  function updateEndpoint(next: {
    component?: string;
    target?: string;
    parameters?: Record<string, unknown>;
  }) {
    onErrorChange(undefined);

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
    onFormDataChange(
      shouldPersistParameters
        ? {
            ...formData,
            uri: nextUri,
            parameters: nextModel.parameters,
          }
        : {
            ...formData,
            uri: nextUri,
          },
    );
  }

  const preview = parsed
    ? serializeEndpointUri({
        component: parsed.component,
        target: parsed.target,
        parameters,
      })
    : uri;

  return (
    <div
      className={`space-y-3 rounded-lg border p-3 ${
        errorMessage ? "border-danger/40 bg-danger/5" : "border-border"
      }`}
    >
      {componentMetadata?.component?.title && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
          <Badge intent="secondary">{componentMetadata.component.title}</Badge>
          {componentMetadata.component.syntax && (
            <code className="text-xs text-muted-fg">
              {componentMetadata.component.syntax}
            </code>
          )}
        </div>
      )}
      <Checkbox
        isSelected={rawMode}
        onChange={(nextRawMode) => {
          if (!nextRawMode && !parseEndpointUri(uri)) {
            return;
          }
          onErrorChange(undefined);
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
          errorMessage={errorMessage}
          placeholder="direct:start"
          value={uri}
          onChange={(nextValue) => {
            onErrorChange(undefined);
            onChange(nextValue);
          }}
        />
      ) : (
        <>
          <TextField
            label="Component"
            errorMessage={errorMessage}
            value={parsed?.component ?? ""}
            onChange={(nextValue) => updateEndpoint({ component: nextValue })}
          />
          {pathDefinitions.length > 0 ? (
            pathDefinitions.map((pathDefinition, index) => (
              <TextField
                key={pathDefinition.key}
                label={pathDefinition.label}
                errorMessage={index === 0 ? errorMessage : undefined}
                description={
                  index === 0
                    ? description || pathDefinition.description
                    : pathDefinition.description
                }
                value={pathSegments[index] ?? ""}
                onChange={(nextValue) => {
                  const nextSegments = [...pathSegments];
                  nextSegments[index] = nextValue;
                  updateEndpoint({
                    target: buildEndpointTarget(nextSegments),
                  });
                }}
              />
            ))
          ) : (
            <TextField
              label="Target"
              errorMessage={errorMessage}
              description={description}
              value={parsed?.target ?? ""}
              onChange={(nextValue) => updateEndpoint({ target: nextValue })}
            />
          )}
          <Textarea
            label="Query Parameters"
            description="One key=value entry per line. Serialized in deterministic key order."
            placeholder={"timeout=1000\nbridgeErrorHandler=true"}
            value={Object.entries(parameters)
              .sort(([left], [right]) => left.localeCompare(right))
              .map(([key, item]) => `${key}=${String(item)}`)
              .join("\n")}
            onChange={(nextValue) => {
              const parsedParameters = parseKeyValueLinesWithIssues(nextValue);

              if (parsedParameters.issues.length > 0) {
                onErrorChange(parsedParameters.issues[0]);
                return;
              }

              onErrorChange(undefined);
              updateEndpoint({
                parameters: Object.fromEntries(parsedParameters.entries),
              });
            }}
          />
          <TextField label="Generated URI Preview" value={preview} isReadOnly />
        </>
      )}
    </div>
  );
}
