import type { CamelConfig, Step } from "core";
import { generateStepId } from "core";

export type WorkflowTemplateCategory =
  | "Basics"
  | "Flow Patterns"
  | "Error Handling";

export type WorkflowTemplateDefinition = {
  id: string;
  name: string;
  description: string;
  explanation: string;
  category: WorkflowTemplateCategory;
};

function createWorkflowConfig(fromUri: string, steps: Step[]): CamelConfig {
  return {
    data: [
      {
        route: {
          id: generateStepId("route"),
          nodePrefixId: generateStepId("node"),
          from: {
            id: generateStepId("from"),
            uri: fromUri,
            steps,
          },
        },
      },
    ],
    comments: {},
  };
}

const workflowTemplateCatalog: WorkflowTemplateDefinition[] = [
  {
    id: "timer-log",
    name: "Timer to Log",
    category: "Basics",
    description: "Starts on a timer and logs each tick.",
    explanation:
      "Useful for verifying that the route, scheduler, and logging all work end to end.",
  },
  {
    id: "direct-bean",
    name: "Direct to Bean",
    category: "Basics",
    description: "Receives on direct:start and calls a bean endpoint.",
    explanation:
      "A simple request flow for service-style processing and local route handoff.",
  },
  {
    id: "file-log",
    name: "File to Log",
    category: "Basics",
    description: "Consumes files from a directory and logs their payload.",
    explanation:
      "Good starter for file ingestion and local development with Camel file endpoints.",
  },
  {
    id: "choice-routing",
    name: "Choice Routing",
    category: "Flow Patterns",
    description:
      "Routes messages based on a header using when and otherwise branches.",
    explanation:
      "Demonstrates conditional routing and branch structure in the canvas.",
  },
  {
    id: "split-processing",
    name: "Split Processing",
    category: "Flow Patterns",
    description:
      "Splits the incoming body and processes each part independently.",
    explanation:
      "Useful for message fan-out and batch-style iteration patterns.",
  },
  {
    id: "do-try-do-catch",
    name: "doTry and doCatch",
    category: "Error Handling",
    description: "Wraps risky processing with catch and finally branches.",
    explanation:
      "Demonstrates structured error handling without dropping into raw YAML.",
  },
];

function createLogStep(message: string) {
  return {
    log: {
      id: generateStepId("log"),
      message,
      loggingLevel: "INFO",
    },
  } as Step;
}

export function getWorkflowTemplateCatalog() {
  return workflowTemplateCatalog;
}

export function buildWorkflowTemplateConfig(templateId: string): CamelConfig {
  switch (templateId) {
    case "timer-log":
      return createWorkflowConfig("timer:trigger?period=1000", [
        createLogStep("Timer tick received: ${body}"),
      ]);
    case "direct-bean":
      return createWorkflowConfig("direct:start", [
        {
          to: {
            id: generateStepId("to"),
            uri: "bean:processOrder",
          },
        } as Step,
      ]);
    case "file-log":
      return createWorkflowConfig("file:inbox?noop=true", [
        createLogStep("Read file payload: ${body}"),
      ]);
    case "choice-routing":
      return createWorkflowConfig("direct:choice", [
        {
          choice: {
            id: generateStepId("choice"),
            when: [
              {
                id: generateStepId("when"),
                expression: {
                  simple: "${header.priority} == 'high'",
                },
                steps: [createLogStep("High priority branch")],
              },
            ],
            otherwise: {
              id: generateStepId("otherwise"),
              steps: [createLogStep("Default branch")],
            },
          },
        } as Step,
      ]);
    case "split-processing":
      return createWorkflowConfig("direct:split", [
        {
          split: {
            id: generateStepId("split"),
            expression: {
              simple: "${body}",
            },
            steps: [createLogStep("Split part: ${body}")],
          },
        } as Step,
      ]);
    case "do-try-do-catch":
      return createWorkflowConfig("direct:errors", [
        {
          doTry: {
            id: generateStepId("doTry"),
            steps: [
              {
                to: {
                  id: generateStepId("to"),
                  uri: "http://example.org/api",
                },
              } as Step,
            ],
            doCatch: [
              {
                id: generateStepId("doCatch"),
                exception: ["java.lang.Exception"],
                steps: [createLogStep("Recovered from exception")],
              },
            ],
            doFinally: {
              id: generateStepId("doFinally"),
              steps: [createLogStep("Cleanup branch executed")],
            },
          },
        } as Step,
      ]);
    default:
      return createWorkflowConfig("direct:start", []);
  }
}
