import axios from "axios";

export async function fetchEIPsMetadata() {
  return axios.get<any[]>("/metadata/eips.json");
}

export async function fetchComponentsMetadata() {
  return axios.get<any[]>("/metadata/components.json");
}
