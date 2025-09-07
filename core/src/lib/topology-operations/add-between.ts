import dotProp from "dot-prop-immutable";
import type { CamelConfig } from "../topology-types";

export function addBetween(
  camelConfig: CamelConfig,
  absolutePath: string,
  newStep: object,
): CamelConfig {
  const pathParts = absolutePath.split(".");
  const index = parseInt(pathParts.pop() || "0", 10);
  const parentPath = pathParts.join(".");
  const parentArray = dotProp.get(camelConfig, parentPath);
  if (Array.isArray(parentArray)) {
    const updatedArray = [
      ...parentArray.slice(0, index),
      newStep,
      ...parentArray.slice(index),
    ];
    return dotProp.set(camelConfig, parentPath, updatedArray);
  }
  // maybe it is not an array because of it is not existing yet, so we create it
  if (parentArray === undefined) {
    return dotProp.set(camelConfig, parentPath, [newStep]);
  }

  return camelConfig;
}
