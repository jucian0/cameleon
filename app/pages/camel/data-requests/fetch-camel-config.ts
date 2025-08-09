
import axios from "axios";
import { decode } from 'js-base64';
import type { CamelConfig } from "../topology/topology-types";
import { yamlToJson } from "../topology/yaml-json";
/**
*  * Fetches the Camel configuration from the server.
* @returns {Promise<CamelConfig>} The Camel configuration.
*/
export async function fetchCamelConfig(): Promise<CamelConfig> {
  return axios.get("/metadata/camel-config.json")
    .then((response) => {
      const decodedData = decode(response.data.camelConfig);
      return yamlToJson(decodedData.toString());
    })
}