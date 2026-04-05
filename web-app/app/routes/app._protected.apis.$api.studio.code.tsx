import React from "react";
import MonacoEditor from "@monaco-editor/react";
import {
  openApiDocumentToYaml,
  toOpenApiDocument,
  type ApiSpec,
} from "@/rest-studio/rest-spec";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "app/components/ui/button";
import { useTheme } from "remix-themes";
import { Link } from "app/components/ui/link";
import { Sheet } from "app/components/ui/sheet";
import { withModal } from "app/components/utils/with-modal";
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
  const context = useOutletContext<{
    spec: ApiSpec;
  }>();
  const location = useLocation();
  const theme = useTheme();
  const [format, setFormat] = React.useState<"json" | "yaml">("json");
  const openApiDocument = React.useMemo(
    () => toOpenApiDocument(context.spec),
    [context.spec],
  );
  const output = React.useMemo(
    () =>
      format === "json"
        ? JSON.stringify(openApiDocument, null, 2)
        : openApiDocumentToYaml(context.spec),
    [context.spec, format, openApiDocument],
  );

  function handleClose() {
    closeModal(`${location.pathname.replace(/\/code$/, "")}${location.search}`);
  }

  return (
    <Sheet isOpen={isOpen} onOpenChange={handleClose}>
      <Sheet.Content>
        <Sheet.Body className="p-0!">
          <div className="relative h-full w-full rounded-lg py-11">
            <div className="absolute inset-x-3 top-3 z-10 flex items-center gap-2">
              <Badge intent="secondary">OpenAPI</Badge>
              <Badge intent="outline">{format.toUpperCase()}</Badge>
              <div className="ml-2 flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  intent={format === "json" ? "primary" : "secondary"}
                  onPress={() => setFormat("json")}
                >
                  JSON
                </Button>
                <Button
                  type="button"
                  size="sm"
                  intent={format === "yaml" ? "primary" : "secondary"}
                  onPress={() => setFormat("yaml")}
                >
                  YAML
                </Button>
              </div>
            </div>
            <MonacoEditor
              className="h-full w-full"
              language={format}
              theme={theme[0] === "dark" ? "vs-dark" : "vs-light"}
              value={output}
              options={{
                selectOnLineNumbers: true,
                readOnly: true,
                minimap: { enabled: false },
                padding: { top: 16 },
              }}
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
