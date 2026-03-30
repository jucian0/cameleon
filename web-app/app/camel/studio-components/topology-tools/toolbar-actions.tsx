import { useTopologyStore } from "core";
import { Button, buttonStyles } from "app/components/ui/button";
import { useFetcher, useLocation, useOutletContext } from "react-router";
import { Link } from "app/components/ui/link";
import {
  AlertTriangle,
  Code2,
  Copy,
  CopyPlus,
  Download,
  History,
  LayoutTemplate,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover } from "@/components/ui/popover";
import { Tooltip } from "app/components/ui/tooltip";
import { validateCamelConfig } from "../topology-layer/authoring/validation";
import React from "react";
import { useParams } from "react-router";
import type { WorkflowAccessContext } from "@/camel/workflows-access";

export const TopologyToolbarActions = () => {
  const { getCamelConfigYaml, camelConfig } = useTopologyStore();
  const saveFetcher = useFetcher<{
    ok?: boolean;
    error?: string;
    versionError?: string | null;
  }>();
  const location = useLocation();
  const { workflow } = useParams();
  const { canDuplicate, canEdit, initialYaml, isStarter } = useOutletContext<
    WorkflowAccessContext & { workflowId: string; initialYaml: string }
  >();
  const findings = React.useMemo(
    () => validateCamelConfig(camelConfig),
    [camelConfig],
  );
  const currentYaml = React.useMemo(
    () => getCamelConfigYaml(),
    [camelConfig, getCamelConfigYaml],
  );
  const [copyLabel, setCopyLabel] = React.useState("Copy YAML");
  const [saveState, setSaveState] = React.useState<
    "unsaved" | "saving" | "synced" | "failed"
  >("synced");
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveWarning, setSaveWarning] = React.useState<string | null>(null);
  const errors = findings.filter((item) => item.severity === "error");
  const warnings = findings.filter((item) => item.severity === "warning");
  const hasBlockingErrors = errors.length > 0;
  const lastSavedYamlRef = React.useRef(initialYaml);
  const pendingYamlRef = React.useRef<string | null>(null);
  const isHydratedRef = React.useRef(false);

  React.useEffect(() => {
    lastSavedYamlRef.current = initialYaml;
    pendingYamlRef.current = null;
    setSaveError(null);
    setSaveWarning(null);
    setSaveState("synced");
    isHydratedRef.current = false;
  }, [initialYaml]);

  React.useEffect(() => {
    if (!isHydratedRef.current && currentYaml === initialYaml) {
      isHydratedRef.current = true;
    }
  }, [currentYaml, initialYaml]);

  React.useEffect(() => {
    if (saveFetcher.state !== "idle" || pendingYamlRef.current == null) {
      return;
    }

    if (saveFetcher.data?.ok === false) {
      setSaveState("failed");
      setSaveError(saveFetcher.data.error ?? "Failed to save workflow.");
      pendingYamlRef.current = null;
      return;
    }

    lastSavedYamlRef.current = pendingYamlRef.current;
    pendingYamlRef.current = null;
    setSaveError(null);
    setSaveWarning(saveFetcher.data?.versionError ?? null);
    setSaveState(
      currentYaml === lastSavedYamlRef.current ? "synced" : "unsaved",
    );
  }, [currentYaml, saveFetcher.data, saveFetcher.state]);

  React.useEffect(() => {
    if (!canEdit || !isHydratedRef.current || saveFetcher.state !== "idle") {
      return;
    }

    if (currentYaml === lastSavedYamlRef.current) {
      if (saveState !== "synced") {
        setSaveState("synced");
      }
      return;
    }

    if (!hasBlockingErrors) {
      setSaveState("unsaved");
    }

    const timeoutId = window.setTimeout(() => {
      if (hasBlockingErrors) return;

      pendingYamlRef.current = currentYaml;
      setSaveState("saving");
      setSaveError(null);
      setSaveWarning(null);
      saveFetcher.submit(
        { content: currentYaml, saveMode: "autosave" },
        { method: "post" },
      );
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [
    canEdit,
    currentYaml,
    hasBlockingErrors,
    saveFetcher,
    saveFetcher.state,
    saveState,
  ]);

  async function handleCopyYaml() {
    try {
      await navigator.clipboard.writeText(getCamelConfigYaml());
      setCopyLabel("YAML copied");
    } catch {
      setCopyLabel("Copy failed");
    }

    window.setTimeout(() => setCopyLabel("Copy YAML"), 1500);
  }

  function handleExportYaml() {
    const blob = new Blob([currentYaml], { type: "application/yaml" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${workflow ?? "workflow"}.camel.yaml`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-2">
      {isStarter && <Badge intent="warning">Starter</Badge>}
      {!isStarter && (
        <Tooltip>
          <Badge
            intent={
              saveState === "failed"
                ? "danger"
                : saveState === "saving"
                  ? "warning"
                  : saveState === "unsaved"
                    ? "secondary"
                    : "success"
            }
          >
            {saveState === "failed"
              ? "Sync failed"
              : saveState === "saving"
                ? "Syncing"
                : saveState === "unsaved"
                  ? "Unsaved"
                  : "Synced"}
          </Badge>
          <Tooltip.Content>
            {saveError
              ? saveError
              : saveWarning
                ? `Draft synced, but milestone failed: ${saveWarning}`
                : saveState === "unsaved"
                  ? "Changes will autosave shortly."
                  : saveState === "saving"
                    ? "Syncing workflow changes."
                    : "All changes synced."}
          </Tooltip.Content>
        </Tooltip>
      )}
      {findings.length > 0 && (
        <Popover>
          <Tooltip>
            <Button
              intent={hasBlockingErrors ? "warning" : "secondary"}
              size="sq-sm"
              aria-label="Validation summary"
            >
              <AlertTriangle className="h-4 w-4" />
            </Button>
            <Tooltip.Content>
              {hasBlockingErrors
                ? `${errors.length} blocking error${errors.length === 1 ? "" : "s"}`
                : `${warnings.length} warning${warnings.length === 1 ? "" : "s"}`}
            </Tooltip.Content>
          </Tooltip>
          <Popover.Content className="w-96 min-w-96 p-0">
            <Popover.Header className="border-b px-4 py-3">
              <Popover.Title>Validation</Popover.Title>
              <Popover.Description>
                {hasBlockingErrors
                  ? "Blocking errors must be fixed before syncing."
                  : "Warnings do not block syncing."}
              </Popover.Description>
            </Popover.Header>
            <Popover.Body className="max-h-96 space-y-3 overflow-auto px-4 py-3">
              {findings.map((item, index) => (
                <div
                  key={`${item.fieldPath}-${index}`}
                  className="space-y-1 rounded-lg border p-3"
                >
                  <Badge
                    intent={item.severity === "error" ? "danger" : "warning"}
                  >
                    {item.severity}
                  </Badge>
                  <p className="text-sm font-medium">{item.message}</p>
                  <p className="text-xs text-muted-fg">{item.fieldPath}</p>
                  {item.remediationHint && (
                    <p className="text-xs text-muted-fg">
                      {item.remediationHint}
                    </p>
                  )}
                </div>
              ))}
            </Popover.Body>
          </Popover.Content>
        </Popover>
      )}
      <div className="ml-auto flex items-center gap-1">
        <Tooltip>
          <Link
            href={`${location.pathname}/code${location.search}`}
            aria-label="Open code view"
            className={buttonStyles({ size: "sq-sm", intent: "secondary" })}
          >
            <Code2 size={16} />
          </Link>
          <Tooltip.Content>Code view</Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Link
            href={`${location.pathname}/history${location.search}`}
            aria-label="Open version history"
            className={buttonStyles({ size: "sq-sm", intent: "secondary" })}
          >
            <History size={16} />
          </Link>
          <Tooltip.Content>Version history</Tooltip.Content>
        </Tooltip>
        {canEdit && (
          <Tooltip>
            <Link
              href={`${location.pathname}/template${location.search}`}
              aria-label="Save as template"
              className={buttonStyles({ size: "sq-sm", intent: "secondary" })}
            >
              <LayoutTemplate size={16} />
            </Link>
            <Tooltip.Content>Save as template</Tooltip.Content>
          </Tooltip>
        )}
        <Tooltip>
          <Button
            intent="secondary"
            size="sq-sm"
            aria-label="Copy Camel YAML"
            onPress={handleCopyYaml}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Tooltip.Content>{copyLabel}</Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Button
            intent="secondary"
            size="sq-sm"
            aria-label="Export Camel YAML"
            onPress={handleExportYaml}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Tooltip.Content>Export Camel YAML</Tooltip.Content>
        </Tooltip>
        {workflow && canDuplicate && (
          <Tooltip>
            <Link
              href={`/app/camel/workflows/${workflow}/clone`}
              aria-label="Clone workflow"
              className={buttonStyles({ size: "sq-sm", intent: "secondary" })}
            >
              <CopyPlus size={16} />
            </Link>
            <Tooltip.Content>
              {isStarter ? "Use as starter" : "Clone workflow"}
            </Tooltip.Content>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
