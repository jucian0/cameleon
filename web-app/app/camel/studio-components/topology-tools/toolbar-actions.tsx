import { useTopologyStore } from "core";
import { Button, buttonStyles } from "app/components/ui/button";
import {
  useLocation,
  useNavigation,
  useOutletContext,
  useSubmit,
} from "react-router";
import { Loader } from "app/components/ui/loader";
import { Link } from "app/components/ui/link";
import { AlertTriangle, Code2, Copy, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover } from "@/components/ui/popover";
import { Tooltip } from "app/components/ui/tooltip";
import { validateCamelConfig } from "../topology-layer/authoring/validation";
import React from "react";
import { useParams } from "react-router";
import type { WorkflowAccessContext } from "@/camel/workflows-access";

export const TopologyToolbarActions = () => {
  const { getCamelConfigYaml, camelConfig } = useTopologyStore();
  const submit = useSubmit();
  const navigation = useNavigation();
  const location = useLocation();
  const { workflow } = useParams();
  const { canDuplicate, canEdit, isStarter } = useOutletContext<
    WorkflowAccessContext & { workflowId: string }
  >();
  const findings = React.useMemo(
    () => validateCamelConfig(camelConfig),
    [camelConfig],
  );
  const [copyLabel, setCopyLabel] = React.useState("Copy YAML");
  const errors = findings.filter((item) => item.severity === "error");
  const warnings = findings.filter((item) => item.severity === "warning");
  const hasBlockingErrors = errors.length > 0;

  function handleSave() {
    if (hasBlockingErrors || !canEdit) return;
    submit({ content: getCamelConfigYaml() }, { method: "post" });
  }

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
    const content = getCamelConfigYaml();
    const blob = new Blob([content], { type: "application/yaml" });
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
                  ? "Blocking errors must be fixed before save."
                  : "Warnings do not block save."}
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
              aria-label="Duplicate workflow"
              className={buttonStyles({ size: "sq-sm", intent: "secondary" })}
            >
              <Copy size={16} />
            </Link>
            <Tooltip.Content>
              {isStarter ? "Use as starter" : "Duplicate workflow"}
            </Tooltip.Content>
          </Tooltip>
        )}
        <Button
          size="sm"
          onPress={handleSave}
          isDisabled={hasBlockingErrors || !canEdit}
          isPending={navigation.state === "submitting"}
        >
          {navigation.state === "submitting" && <Loader />}
          Save
        </Button>
      </div>
    </div>
  );
};
