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
import { AlertTriangle, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover } from "@/components/ui/popover";
import { validateCamelConfig } from "../topology-layer/authoring/validation";
import React from "react";

export const TopologyToolbarActions = () => {
  const { getCamelConfigYaml, camelConfig } = useTopologyStore();
  const submit = useSubmit();
  const navigation = useNavigation();
  const location = useLocation();
  const { visibility } = useOutletContext<{
    visibility: "public" | "private";
  }>();
  const findings = React.useMemo(
    () => validateCamelConfig(camelConfig),
    [camelConfig],
  );
  const errors = findings.filter((item) => item.severity === "error");
  const warnings = findings.filter((item) => item.severity === "warning");
  const hasBlockingErrors = errors.length > 0;

  function handleSave() {
    if (hasBlockingErrors) return;
    submit({ content: getCamelConfigYaml() }, { method: "post" });
  }

  return (
    <div className="flex items-center gap-1">
      {visibility === "private" && (
        <Badge className="px-3 py-2" intent="info">
          Private
        </Badge>
      )}
      {visibility === "public" && (
        <Badge className="px-3 py-2" intent="warning">
          Public
        </Badge>
      )}
      {findings.length > 0 && (
        <Popover>
          <Button
            intent={hasBlockingErrors ? "warning" : "secondary"}
            size="sm"
          >
            <AlertTriangle className="h-4 w-4" />
            {hasBlockingErrors
              ? `${errors.length} error`
              : `${warnings.length} warning`}
          </Button>
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
      <Button
        size="sm"
        onPress={handleSave}
        isDisabled={hasBlockingErrors}
        isPending={navigation.state === "submitting"}
      >
        {navigation.state === "submitting" && <Loader />}
        Save
      </Button>
      <Link
        href={`${location.pathname}/code${location.search}`}
        className={buttonStyles({ size: "lg", intent: "secondary" })}
      >
        <Code2 size={16} />
      </Link>
    </div>
  );
};
