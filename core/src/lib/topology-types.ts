import type * as RFLow from "@xyflow/react";

export type Node = RFLow.Node & {
  readonly data: {
    type: string;
    stepType: string;
    absolutePath: string;
    iconName: string;
    operation: "add-step" | "read";
    label: string;
  };
};
export type Edge = RFLow.Edge;
export type NodeType = "add-step" | "camel-step" | "add-between";

export type EPIDefinition = {
  properties: Readonly<Record<string, PropertyDefinition>>;
  model: Record<string, unknown>;
};

export type ComponentDefinition = {
  properties: Readonly<Record<string, PropertyDefinition>>;
  component: Record<string, unknown>;
};

export type PropertyDefinition = {
  title: string;
  description: string;
  type: "boolean" | "string" | "number";
  defaultValue?: boolean | number | string;
  secret: boolean;
  required: boolean;
  group?: string;
  format?: "integer" | "duration";
};

export interface Step {
  steps?: Step[];
  choice?: {
    when?: Step[];
    otherwise?: Step;
  };
  split?: {
    steps?: Step[];
  };
  join?: {
    aggregationStrategyRef?: string;
  };
  aggregate?: {
    correlationExpression?: string;
    completionSize?: number;
    completionTimeout?: number;
    aggregationStrategyRef?: string;
    steps?: Step[];
  };
  filter?: {
    expression?: string;
    steps?: Step[];
  };
  transform?: {
    expression?: string;
  };
  custom?: {
    componentType: string;
    properties?: Record<string, unknown>;
  };
  doTry?: {
    steps?: Step[];
    doCatch?: Step[];
    doFinally?: {
      steps?: Step[];
    };
  };
  multicast?: {
    parallelProcessing?: boolean;
    strategyRef?: string;
    stopOnException?: boolean;
    steps?: Step[];
  };
  loadBalance?: {
    strategyRef?: string;
    steps?: Step[];
  };
  log?: {
    message?: string;
    loggingLevel?: string;
  };
}

export type Route = {
  route?: {
    id: string;
    nodePrefixId: string;
    from: {
      id: string;
      uri: string;
      steps?: Step[];
    };
  };
};

export type CamelConfig = {
  data: Route[];
  comments?: Record<string, string>;
};

export type StepType =
  | "choice"
  | "split"
  | "join"
  | "aggregate"
  | "filter"
  | "transform"
  | "custom"
  | "camel"
  | "kafka"
  | "http"
  | "rest"
  | "soap"
  | "wsdl"
  | "add-step"
  | "when"
  | "otherwise"
  | "doCatch"
  | "doTry"
  | "doFinally"
  | "multicast"
  | "loadBalance"
  | "add-between";
