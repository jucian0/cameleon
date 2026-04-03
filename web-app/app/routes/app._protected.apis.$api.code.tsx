import { toOpenApiDocument, type ApiSpec } from "@/api-studio/api-spec";
import { buttonStyles } from "app/components/ui/button";
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
  const output = JSON.stringify(toOpenApiDocument(context.spec), null, 2);

  function handleClose() {
    closeModal(`${location.pathname.replace("/code", "")}${location.search}`);
  }

  return (
    <Sheet isOpen={isOpen} onOpenChange={handleClose}>
      <Sheet.Content>
        <Sheet.Header className="px-4 py-4 pb-3">
          <Sheet.Title>Generated OpenAPI</Sheet.Title>
          <Sheet.Description>
            Read-only JSON output generated from the current API Studio model.
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Body className="px-4 py-2 pb-4">
          <pre className="max-h-[75vh] overflow-auto rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-xs text-foreground">
            <code>{output}</code>
          </pre>
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
