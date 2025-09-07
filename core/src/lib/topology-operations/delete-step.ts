import dotProp from "dot-prop-immutable";
import type { CamelConfig } from "../topology-types";

export function deleteStep(camelConfig: CamelConfig, absolutePath: string) {
  return dotProp.delete(camelConfig, absolutePath);
}
