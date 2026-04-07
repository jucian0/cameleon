import React from "react";
import MonacoEditor from "@monaco-editor/react";
import debounce from "debounce";
import {
  apiSpecToJson,
  apiSpecToYaml,
  parseApiSpecJson,
  parseApiSpecYaml,
  useApiStore,
  type ApiSpec,
} from "@/rest-studio/rest-spec";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "app/components/ui/button";
import { Link } from "app/components/ui/link";
import { Sheet } from "app/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { withModal } from "app/components/utils/with-modal";
import { useTheme } from "remix-themes";
import {
  isRouteErrorResponse,
  useLocation,
  useOutletContext,
  useRouteError,
} from "react-router";

export const handle = {
  breadcrumb: () => "Code",
};

export default withModal(({ isOpen, closeModal }: any) => {
  const { apiSpec, setApiSpec } = useApiStore();
  const theme = useTheme();
  const location = useLocation();
  const { canEdit } = useOutletContext<{
    spec: ApiSpec;
    canEdit: boolean;
  }>();
  const isReadOnly = !canEdit;
  const [format, setFormat] = React.useState<"json" | "yaml">("json");
  const [parseError, setParseError] = React.useState<string | null>(null);
  const canonicalValue = React.useMemo(
    () => (format === "json" ? apiSpecToJson(apiSpec) : apiSpecToYaml(apiSpec)),
    [apiSpec, format],
  );
  const [editorValue, setEditorValue] = React.useState(canonicalValue);
  const [debouncedSetApiSpec] = React.useState(() =>
    debounce((nextValue: string, nextFormat: "json" | "yaml") => {
      try {
        setApiSpec(
          nextFormat === "json"
            ? parseApiSpecJson(nextValue)
            : parseApiSpecYaml(nextValue),
        );
        setParseError(null);
      } catch (error) {
        setParseError(
          error instanceof Error
            ? error.message
            : "Failed to parse API source.",
        );
      }
    }, 500),
  );

  React.useEffect(() => {
    if (!parseError) {
      setEditorValue(canonicalValue);
    }
  }, [canonicalValue, parseError]);

  React.useEffect(() => {
    if (!parseError) {
      setEditorValue(
        format === "json" ? apiSpecToJson(apiSpec) : apiSpecToYaml(apiSpec),
      );
    }
  }, [apiSpec, format, parseError]);

  function handleClose() {
    closeModal(`${location.pathname.replace(/\/code$/, "")}${location.search}`);
  }

  function handleFormatChange(nextFormat: "json" | "yaml") {
    setFormat(nextFormat);
    if (!parseError) {
      setEditorValue(
        nextFormat === "json" ? apiSpecToJson(apiSpec) : apiSpecToYaml(apiSpec),
      );
    }
  }

  function handleChange(nextValue: string | undefined) {
    if (nextValue === undefined) return;
    setEditorValue(nextValue);
    debouncedSetApiSpec(nextValue, format);
  }

  return (
    <Sheet isOpen={isOpen} onOpenChange={handleClose}>
      <Sheet.Content>
        <Sheet.Body className="p-0!">
          <div
            className={`relative h-full w-full rounded-lg py-11 ${isReadOnly ? "pointer-events-none" : ""}`}
          >
            <div className="absolute inset-x-3 top-3 z-10 flex items-center gap-2">
              <Badge intent="secondary">ApiSpec</Badge>
              <ToggleGroup
                size="xs"
                selectionMode="single"
                selectedKeys={[format]}
                onSelectionChange={(keys) => {
                  const next = Array.from(keys)[0];
                  if (next === "json" || next === "yaml") {
                    handleFormatChange(next);
                  }
                }}
                aria-label="Source format"
                className="ml-2 scale-75 origin-left"
              >
                <ToggleGroupItem id="json">JSON</ToggleGroupItem>
                <ToggleGroupItem id="yaml">YAML</ToggleGroupItem>
              </ToggleGroup>
            </div>
            {parseError ? (
              <div className="absolute inset-x-3 top-14 z-10 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2">
                <Badge intent="danger">Invalid {format.toUpperCase()}</Badge>
                <p className="text-sm text-danger-foreground">
                  Keeping the last valid Rest Studio state. {parseError}
                </p>
              </div>
            ) : null}
            <MonacoEditor
              className={`h-full w-full ${isReadOnly ? "pointer-events-none" : ""}`}
              language={format}
              theme={theme[0] === "dark" ? "vs-dark" : "vs-light"}
              value={editorValue}
              options={{
                selectOnLineNumbers: true,
                readOnly: isReadOnly,
                minimap: { enabled: false },
                padding: { top: parseError ? 56 : 16 },
              }}
              onChange={handleChange}
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
        : "The code view could not be opened."
    : error instanceof Error
      ? error.message
      : "The code view could not be opened.";

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <h1 className="text-lg font-semibold text-foreground">
        Code view unavailable
      </h1>
      <p className="mt-2 text-sm text-muted-fg">{description}</p>
      <div className="mt-4">
        <Link
          href="/app/apis"
          className={buttonStyles({ intent: "secondary", size: "sm" })}
        >
          Back to APIs
        </Link>
      </div>
    </div>
  );
}
