import axios from "axios";
import type { EPIDefinition } from "../topology/topology-types";

export async function fetchComponentsMetadata() {
  return axios.get<EPIDefinition[]>("metadata/components.json")
}

export async function fetchEIPsMetadata() {
  return axios.get<EPIDefinition[]>("metadata/eips.json")
}