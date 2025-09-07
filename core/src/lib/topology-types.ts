import type * as RFLow from "@xyflow/react";

export type Node = RFLow.Node & {
  readonly data: {
    stepType: StepType;
    absolutePath: string;
    iconName: string;
    label: string;
  };
};
export type Edge = RFLow.Edge;

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
  camel?: {
    uri: string;
  };
  kafka?: {
    topic: string;
    brokers: string;
    clientId?: string;
    groupId?: string;
    autoOffsetReset?: string;
    additionalProperties?: Record<string, unknown>;
  };
  http?: {
    uri: string;
    method?: string;
    authenticationPreemptive?: boolean;
    authenticationUsername?: string;
    authenticationPassword?: string;
    headers?: Record<string, unknown>;
    queryParameters?: Record<string, unknown>;
    body?: string;
  };
  rest?: {
    verb: string;
  };
  soap?: {
    wsdlUri: string;
    serviceName?: string;
    portName?: string;
    operationName?: string;
    headers?: Record<string, unknown>;
    body?: string;
  };
  wsdl?: {
    uri: string;
    serviceName?: string;
    portName?: string;
    operationName?: string;
    headers?: Record<string, unknown>;
    body?: string;
  };
  add_step?: {};
  add_between?: {};
  when?: {};
  otherwise?: {};
  doCatch?: {};
  doFinally?: {};
  [key: string]: any;
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

export enum STEP_TYPE {
  CHOICE = "choice",
  SPLIT = "split",
  JOIN = "join",
  AGGREGATE = "aggregate",
  FILTER = "filter",
  TRANSFORM = "transform",
  CUSTOM = "custom",
  CAMEL = "camel",
  KAFKA = "kafka",
  HTTP = "http",
  REST = "rest",
  SOAP = "soap",
  WSDL = "wsdl",
  ADD_STEP = "add-step",
  WHEN = "when",
  OTHERWISE = "otherwise",
  DO_CATCH = "doCatch",
  DO_TRY = "doTry",
  DO_FINALLY = "doFinally",
  MULTICAST = "multicast",
  LOAD_BALANCE = "loadBalance",
  ADD_BETWEEN = "add-between",
  ADD_WHEN = "add-when",
}

export type StepType = `${STEP_TYPE}`;

export const EIPSListNames = [
  "aggregate",
  "bean",
  "choice",
  "circuitBreaker",
  "claimCheck",
  "convertBodyTo",
  "convertHeaderTo",
  "convertVariableTo",
  "delay",
  "doTry",
  "doCatch",
  "doFinally",
  "dynamicRouter",
  "enrich",
  "filter",
  "idempotentConsumer",
  "loadBalancer",
  "log",
  "loop",
  "marshal",
  "multicast",
  "pausable",
  "policy",
  "pollEnrich",
  "process",
  "recipientList",
  "removeHeader",
  "removeHeaders",
  "removeProperties",
  "removeProperty",
  "removeVariable",
  "resequence",
  "resumable",
  "routingSlip",
  "saga",
  "sample",
  "script",
  "setBody",
  "setExchangePattern",
  "setHeader",
  "setHeaders",
  "setVariable",
  "setVariables",
  "sort",
  "split",
  "step",
  "stop",
  "threads",
  "throttle",
  "throwException",
  "to",
  "toD",
  "transacted",
  "transform",
  "unmarshal",
  "validate",
  "wireTap",
  "claimCheck",
  "convertVariableTo",
  "convertHeaderTo",
  "convertBodyTo",

  // EIPs complements
  "when",
  "otherwise",
  "do-while",
  "do-finally",
  "do-catch",
];
