import { ApiFlowPreview } from "@/api-studio/api-flow-preview";

export const handle = {
  breadcrumb: () => "Preview",
};

export function meta() {
  return [
    { title: "API Studio Preview | Cameleon" },
    {
      description:
        "Visual concept preview for a structural REST Studio using React Flow.",
    },
  ];
}

export default function ApiPreviewRoute() {
  return <div className="m-6"><ApiFlowPreview /></div>;
}
