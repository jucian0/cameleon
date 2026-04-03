import dotProp from "dot-prop-immutable";
import type { CamelConfig } from "../topology-types";

export function addStep(
  camelConfig: CamelConfig,
  absolutePath: string,
  newStep: object,
): CamelConfig {
  return dotProp.set(camelConfig, absolutePath, newStep);
}
