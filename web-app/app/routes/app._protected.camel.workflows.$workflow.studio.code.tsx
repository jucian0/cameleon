import MonacoEditor from "@monaco-editor/react";
import { jsonToYaml, useTopologyStore, yamlToJson } from "core";
import { Sheet } from "app/components/ui/sheet";
import { useTheme } from "remix-themes";
import React from "react";
import debounce from "debounce";
import { withModal } from "app/components/utils/with-modal";
import {
  isRouteErrorResponse,
  useLocation,
  useOutletContext,
  useRouteError,
} from "react-router";
import { Badge } from "@/components/ui/badge";
import type { WorkflowAccessContext } from "@/camel/workflows-access";
import { Link } from "app/components/ui/link";
import { buttonStyles } from "app/components/ui/button";

export default withModal(({ isOpen, closeModal }: any) => {
  const { setCamelConfig, camelConfig } = useTopologyStore();
  const theme = useTheme();
  const location = useLocation();
  const { canEdit } = useOutletContext<
    WorkflowAccessContext & { workflowId: string }
  >();
  const isReadOnly = !canEdit;
  const canonicalYaml = React.useMemo(
    () => jsonToYaml(camelConfig),
    [camelConfig],
  );
  const [editorValue, setEditorValue] = React.useState(canonicalYaml);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [debouncedSetCamelConfig] = React.useState(() =>
    debounce((nextValue: string) => {
      try {
        setCamelConfig(yamlToJson(nextValue));
        setParseError(null);
      } catch (error) {
        setParseError(
          error instanceof Error ? error.message : "Failed to parse YAML.",
        );
      }
    }, 500),
  );

  React.useEffect(() => {
    if (!parseError) {
      setEditorValue(canonicalYaml);
    }
  }, [canonicalYaml, parseError]);

  const onChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      setEditorValue(newValue);
      debouncedSetCamelConfig(newValue);
    }
  };

  function handleClose() {
    closeModal(`${location.pathname.replace("/code", "")}${location.search}`);
  }

  return (
    <Sheet isOpen={isOpen} onOpenChange={handleClose}>
      <Sheet.Content>
        <Sheet.Body className="p-0!">
          <div
            className={`w-full h-full relative rounded-lg py-11 ${isReadOnly ? "pointer-events-none" : ""}`}
          >
            {parseError && (
              <div className="absolute inset-x-3 top-3 z-10 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2">
                <Badge intent="danger">Invalid YAML</Badge>
                <p className="text-sm text-danger-foreground">
                  Keeping the last valid canvas state. {parseError}
                </p>
              </div>
            )}
            <MonacoEditor
              className={`w-full h-full ${isReadOnly ? "pointer-events-none" : ""}`}
              language="yaml"
              theme={theme[0] === "dark" ? "vs-dark" : "vs-light"}
              value={editorValue}
              options={{
                selectOnLineNumbers: true,
                readOnly: isReadOnly,
              }}
              onChange={onChange}
            />
          </div>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
});

export function ErrorBoundary() {
  const error = useRouteError();
  const description = isRouteErrorResponse(error)
    ? typeof error.data === "string"
      ? error.data
      : "message" in (error.data ?? {})
        ? String((error.data as { message?: string }).message)
        : "The code editor could not be opened."
    : error instanceof Error
      ? error.message
      : "The code editor could not be opened.";

  return (
    <div className="m-6 rounded-xl border border-border bg-background p-6">
      <h1 className="text-lg font-semibold text-foreground">
        Code editor unavailable
      </h1>
      <p className="mt-2 text-sm text-muted-fg">{description}</p>
      <div className="mt-4">
        <Link
          href="/app/camel/workflows"
          className={buttonStyles({ intent: "secondary", size: "sm" })}
        >
          Back to Workflows
        </Link>
      </div>
    </div>
  );
}
