import { jsonToYaml, type CamelConfig } from "core";

export type ValidationSeverity = "error" | "warning";

export type ValidationItem = {
  severity: ValidationSeverity;
  routeId?: string;
  nodeId?: string;
  fieldPath: string;
  message: string;
  remediationHint?: string;
};

function isBlank(value: unknown) {
  return typeof value === "string" ? value.trim().length === 0 : value == null;
}

function hasEmptyExpression(value: unknown) {
  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value);
    if (entries.length !== 1) return false;
    const [, nestedValue] = entries[0];
    return hasEmptyExpression(nestedValue);
  }

  return value == null;
}

function getStepEntry(step: Record<string, unknown>) {
  const [stepType] = Object.keys(step);
  if (!stepType) return null;

  const config = step[stepType];
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return null;
  }

  return {
    stepType,
    config: config as Record<string, unknown>,
  };
}

function validateStep(
  step: Record<string, unknown>,
  fieldPath: string,
  routeId: string | undefined,
  findings: ValidationItem[],
) {
  const entry = getStepEntry(step);
  if (!entry) return;

  const { stepType, config } = entry;
  const nodeId = typeof config.id === "string" ? config.id : undefined;

  if ("uri" in config && isBlank(config.uri)) {
    findings.push({
      severity: "error",
      routeId,
      nodeId,
      fieldPath: `${fieldPath}.${stepType}.uri`,
      message: `Endpoint "${stepType}" is missing a URI.`,
      remediationHint: "Set a component and target or switch to raw URI mode.",
    });
  }

  if ("expression" in config && hasEmptyExpression(config.expression)) {
    findings.push({
      severity: "error",
      routeId,
      nodeId,
      fieldPath: `${fieldPath}.${stepType}.expression`,
      message: `Expression for "${stepType}" is empty.`,
      remediationHint: "Choose a language and provide a non-empty value.",
    });
  }

  if (stepType === "choice") {
    const whenBranches = Array.isArray(config.when) ? config.when : [];
    const otherwiseBranch =
      config.otherwise && typeof config.otherwise === "object"
        ? config.otherwise
        : undefined;

    if (whenBranches.length === 0 && !otherwiseBranch) {
      findings.push({
        severity: "warning",
        routeId,
        nodeId,
        fieldPath: `${fieldPath}.${stepType}`,
        message: 'Choice has no "when" or "otherwise" branches.',
        remediationHint:
          "Add at least one branch so the choice can route messages.",
      });
    }
  }

  if (stepType === "doCatch") {
    const exceptions = Array.isArray(config.exception) ? config.exception : [];
    if (exceptions.length === 0) {
      findings.push({
        severity: "error",
        routeId,
        nodeId,
        fieldPath: `${fieldPath}.${stepType}.exception`,
        message: "doCatch must declare at least one exception class.",
        remediationHint: "Add one or more exception class names to catch.",
      });
    }
  }

  const branchSteps = Array.isArray(config.steps) ? config.steps : undefined;
  if (
    ["when", "otherwise", "doCatch", "doFinally", "fallback"].includes(
      stepType,
    ) &&
    (!branchSteps || branchSteps.length === 0)
  ) {
    findings.push({
      severity: "warning",
      routeId,
      nodeId,
      fieldPath: `${fieldPath}.${stepType}.steps`,
      message: `Branch "${stepType}" has no child steps.`,
      remediationHint:
        "Add steps inside the branch or remove the branch if it is unused.",
    });
  }

  if ("steps" in config && Array.isArray(config.steps)) {
    config.steps.forEach((nestedStep, index) => {
      if (
        nestedStep &&
        typeof nestedStep === "object" &&
        !Array.isArray(nestedStep)
      ) {
        validateStep(
          nestedStep as Record<string, unknown>,
          `${fieldPath}.${stepType}.steps.${index}`,
          routeId,
          findings,
        );
      }
    });
  }

  if ("when" in config && Array.isArray(config.when)) {
    config.when.forEach((nestedStep, index) => {
      if (
        nestedStep &&
        typeof nestedStep === "object" &&
        !Array.isArray(nestedStep)
      ) {
        validateStep(
          { when: nestedStep } as Record<string, unknown>,
          `${fieldPath}.${stepType}.when.${index}`,
          routeId,
          findings,
        );
      }
    });
  }

  if (
    "otherwise" in config &&
    config.otherwise &&
    typeof config.otherwise === "object"
  ) {
    validateStep(
      { otherwise: config.otherwise } as Record<string, unknown>,
      `${fieldPath}.${stepType}.otherwise`,
      routeId,
      findings,
    );
  }

  if ("doCatch" in config && Array.isArray(config.doCatch)) {
    config.doCatch.forEach((nestedStep, index) => {
      if (
        nestedStep &&
        typeof nestedStep === "object" &&
        !Array.isArray(nestedStep)
      ) {
        validateStep(
          { doCatch: nestedStep } as Record<string, unknown>,
          `${fieldPath}.${stepType}.doCatch.${index}`,
          routeId,
          findings,
        );
      }
    });
  }

  if (
    "doFinally" in config &&
    config.doFinally &&
    typeof config.doFinally === "object"
  ) {
    validateStep(
      { doFinally: config.doFinally } as Record<string, unknown>,
      `${fieldPath}.${stepType}.doFinally`,
      routeId,
      findings,
    );
  }

  if (
    "onFallback" in config &&
    config.onFallback &&
    typeof config.onFallback === "object"
  ) {
    validateStep(
      { onFallback: config.onFallback } as Record<string, unknown>,
      `${fieldPath}.${stepType}.onFallback`,
      routeId,
      findings,
    );
  }
}

export function validateCamelConfig(
  camelConfig: CamelConfig,
): ValidationItem[] {
  const findings: ValidationItem[] = [];

  camelConfig.data.forEach((routeEntry, routeIndex) => {
    const route = routeEntry.route;
    const routePath = `data.${routeIndex}.route`;

    if (!route) {
      findings.push({
        severity: "error",
        fieldPath: routePath,
        message: "Route entry is missing the route object.",
        remediationHint: "Restore the route wrapper before saving.",
      });
      return;
    }

    if (!route.from) {
      findings.push({
        severity: "error",
        routeId: route.id,
        fieldPath: `${routePath}.from`,
        message: "Route is missing the required from definition.",
        remediationHint: "Add a from endpoint to the route.",
      });
      return;
    }

    if (isBlank(route.from.uri)) {
      findings.push({
        severity: "error",
        routeId: route.id,
        nodeId: route.from.id,
        fieldPath: `${routePath}.from.uri`,
        message: "Route from endpoint is missing a URI.",
        remediationHint: "Set the source endpoint URI before saving.",
      });
    }

    if (!Array.isArray(route.from.steps) || route.from.steps.length === 0) {
      findings.push({
        severity: "warning",
        routeId: route.id,
        nodeId: route.from.id,
        fieldPath: `${routePath}.from.steps`,
        message: "Route has no steps after the from endpoint.",
        remediationHint: "Add at least one step if the route should do work.",
      });
      return;
    }

    route.from.steps.forEach((step, stepIndex) => {
      if (step && typeof step === "object" && !Array.isArray(step)) {
        validateStep(
          step as Record<string, unknown>,
          `${routePath}.from.steps.${stepIndex}`,
          route.id,
          findings,
        );
      }
    });
  });

  try {
    jsonToYaml(camelConfig);
  } catch (error) {
    findings.push({
      severity: "error",
      fieldPath: "workflow",
      message: `YAML serialization failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      remediationHint: "Resolve the invalid workflow structure before saving.",
    });
  }

  return findings;
}
