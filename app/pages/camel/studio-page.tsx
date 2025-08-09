import React from "react";
import { useTopologyStore } from "./topology/topology-store";
import { TopologyBuilder } from "./topology/topology-builder/topology-builder";

export const handle = {
  breadcrumb: () => "Camel Studio",
};

export default function CamelStudio() {
  const { fetchCamelConfig } = useTopologyStore();
  React.useEffect(() => {
    fetchCamelConfig();
  }, []);
  return <TopologyBuilder />;
}
