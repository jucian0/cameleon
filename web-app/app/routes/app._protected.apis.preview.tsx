import { RestFlowPreview } from "@/rest-studio/rest-flow-preview";

export const handle = {
  breadcrumb: () => "Preview",
};

export function meta() {
  return [
    { title: "Rest Studio Preview | Cameleon" },
    {
      description:
        "Visual concept preview for a structural REST Studio using React Flow.",
    },
  ];
}

export default function ApiPreviewRoute() {
  return (
    <div className="m-6">
      <RestFlowPreview />
    </div>
  );
}
