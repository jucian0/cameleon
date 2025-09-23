import React from "react";
import { EIPSListNames, STEP_TYPE, type StepType } from "core";
import { DefaultNode } from "./default-node";
import { AddNode } from "./add-node";
import { AddBetweenNode } from "./between-node";
import { DefaultEdge } from "./default-edges";
export * from "./default-edges";

export const nodeTypes: Record<
  StepType & "component",
  React.ExoticComponent<any>
> = {
  [STEP_TYPE.ADD_STEP]: AddNode,
  [STEP_TYPE.ADD_WHEN]: AddNode,
  [STEP_TYPE.ADD_DO_CATCH]: AddNode,
  [STEP_TYPE.ADD_BETWEEN]: AddBetweenNode,
  ["component"]: DefaultNode,
};

export const edgeTypes = {
  default: DefaultEdge,
};
