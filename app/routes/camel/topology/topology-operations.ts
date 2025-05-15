/**
 * This file provides a set of utility functions for manipulating Camel route objects.
 * These functions allow you to add, update, remove, or inspect steps in the JSON representation
 * of Camel routes, which is used to manage the topology of a Camel integration.
 *
 * ### Key Features:
 * - **Add Steps**: Add new steps to a route, either at the end or between existing steps.
 * - **Remove Steps**: Remove steps from a route, cleaning up empty parent objects if necessary.
 * - **Update Steps**: Replace existing steps with new ones.
 * - **Branching Support**: Handle branching scenarios like `choice`, `multicast`, and `doTry`.
 * - **ID Generation**: Automatically generate unique IDs for routes and steps.
 *
 */
import dotProp from 'dot-prop-immutable';
import { v4 as uuid } from 'uuid';
import type { Route } from './topology-types';


export function addNewRoute(firstStep: object): any {
  const newRoute: Route = {
    route: {
      id: generateStepId('route'),
      nodePrefixId: generateStepId('node'),
      from: {
        id: generateStepId('from'),
        uri: "direct:start",
        steps: [firstStep]
      }
    }
  };

  return newRoute;
}

export function addStepAfter(route: any, absolutePath: string, newStep: object): any {
  const isDefaultLastStep = absolutePath === 'route.from.steps';

  if (isDefaultLastStep) {
    const currentSteps = dotProp.get(route, absolutePath, []);
    const newSteps = [...currentSteps, newStep];
    return dotProp.set(route, absolutePath, newSteps);
  } else {
    const isWhenStep = absolutePath.endsWith('.choice');
    if (isWhenStep) {
      const whensPath = `${absolutePath}.when`;
      const whenList = dotProp.get(route, whensPath, []);
      const newWhen = {
        id: generateStepId('when'),
        steps: []
      };
      const newWhens = [...whenList, newWhen];
      return dotProp.set(route, whensPath, newWhens);
    }



    const stepsPath = absolutePath.replace(/\.\d+$/, '');
    const currentSteps = dotProp.get(route, stepsPath);
    const newSteps = [...currentSteps, newStep];
    return dotProp.set(route, stepsPath, newSteps);
  }
}

export function addStepBetween(route: any, absolutePath: string, newStep: object): any {
  const stepsPath = `${absolutePath}.steps`;
  const currentSteps = dotProp.get(route, stepsPath, []);
  const newSteps = [newStep, ...currentSteps];
  return dotProp.set(route, stepsPath, newSteps);
}

export function removeStep(route: any, absolutePath: string): any {
  let updatedJson = dotProp.delete(route, absolutePath);

  const parentPath = absolutePath.split(".").slice(0, -1).join(".");
  const parentObject = dotProp.get(updatedJson, parentPath);
  if (parentObject && Object.keys(parentObject).length === 0) {
    updatedJson = dotProp.delete(updatedJson, parentPath);
  }
  return updatedJson;
}

export function updateStep(route: any, absolutePath: string, newStep: object): any {
  return dotProp.set(route, absolutePath, newStep);
}

export function isChoiceStep(step: any): step is { choice: any } {
  return step && step.choice;
}

export function isMulticastStep(step: any): step is { multicast: any } {
  return step && step.multicast;
}

export function isDoTryStep(step: any): step is { doTry: any } {
  return step && step.doTry;
}

export function generateStepId(prefix: string): string {
  return `${prefix}-${uuid()}`;
}