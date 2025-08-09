import { generateStepId } from "./topology-operations";


/**
 * Camel EIPs can have different default configurations based on their type.
 * Those function are an attempt to provide a default configuration for each EIP type, this should be returned in the EPIs metadata by the backend service in the future.
 * 
 * Why this is important?
 * 1. **Quality of code**: By providing a default configuration, we can ensure that the complexity of the code is reduced because the basics are already set up.
 * 2. **Multi-version compatibility**: When backend returns the default configuration, we can better handle the multi-version compatibility of the EIPs. For example, if a new version of the Camel is released, we can easily create a new default configuration for the new version.
 */



export function getDefaultConfig(stepType: string): any {
  const defaultConfigs: Record<string, any> = {
    // Basic steps
    log: {
      message: "Processing message",
      id: generateStepId(stepType),
      loggingLevel: "INFO",
      logName: "camelLogger",
      marker: null
    },
    to: {
      uri: "direct:next",
      id: generateStepId(stepType),
      pattern: "InOnly",
      parameters: {}
    },

    // Control flow EIPs
    choice: {
      id: generateStepId(stepType),
      when: [{
        id: generateStepId('when'),
        steps: []
      }],
      otherwise: {
        id: generateStepId('otherwise'),
        steps: []
      }
    },
    doTry: {
      id: generateStepId(stepType),
      steps: [],
      doCatch: [],
      doFinally: {
        id: generateStepId('doFinally'),
        steps: []
      }
    },

    // Message routing EIPs
    multicast: {
      id: generateStepId(stepType),
      steps: [],
      parallelProcessing: false,
      strategyRef: null,
      stopOnException: false
    },
    recipientList: {
      id: generateStepId(stepType),
      expression: { simple: "${header.recipients}" },
      delimiter: ",",
      parallelProcessing: false,
      stopOnException: false
    },

    // Message transformation EIPs
    split: {
      id: generateStepId(stepType),
      expression: { simple: "${body}" },
      parallelProcessing: false,
      streaming: false,
      timeout: 0,
      strategyRef: null
    },
    aggregate: {
      id: generateStepId(stepType),
      strategyRef: "aggregationStrategy",
      completionSize: 10,
      completionTimeout: 1000,
      completionInterval: 500,
      correlationExpression: { simple: "${header.groupId}" }
    },

    // Error handling EIPs
    circuitBreaker: {
      id: generateStepId(stepType),
      resilience4jConfiguration: {
        failureRateThreshold: 50,
        minimumNumberOfCalls: 5,
        slidingWindowSize: 10,
        timeoutDuration: 1000
      },
      steps: [],
      onFallback: {
        id: generateStepId('fallback'),
        steps: []
      }
    },

    // Specialized EIPs
    pollEnrich: {
      id: generateStepId(stepType),
      uri: "direct:enrich",
      timeout: 500,
      aggregationStrategy: null,
      cacheSize: 1000
    },
    dynamicRouter: {
      id: generateStepId(stepType),
      expression: { simple: "${header.nextEndpoint}" },
      cacheSize: 10,
      ignoreInvalidEndpoints: false
    },
    route: {
      id: generateStepId(stepType),
      steps: [],
    }
  };

  return defaultConfigs[stepType] || {
    id: generateStepId(stepType),
    ...(stepType ? { [stepType]: {} } : {})
  };
}