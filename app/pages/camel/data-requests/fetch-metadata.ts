import axios from "axios";
import type { EPIDefinition } from "../topology-lib/topology-types";

export async function fetchEIPsMetadata() {
  return axios.get<EPIDefinition[]>("/metadata/eips.json");
}
