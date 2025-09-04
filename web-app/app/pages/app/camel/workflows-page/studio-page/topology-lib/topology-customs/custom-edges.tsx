import { type EdgeProps, BaseEdge, getBezierPath } from "@xyflow/react";
import { type Node } from "core";
import { useTopologyStore } from "core";

function CustomEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  target,
  source,
}: EdgeProps) {
  const targetNode = useTopologyStore((state) =>
    state.canvas.nodes.find((node) => node.id === target),
  );
  const sourceNode = useTopologyStore((state) =>
    state.canvas.nodes.find((node) => node.id === source),
  );

  // not sure which one is better, smooth or bezier
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const sourceStepType = sourceNode?.data.stepType ?? "";
  const targetStepType = targetNode?.data.stepType ?? "";
  const edgeStyle = {
    ...style,
    stroke: "hsl(181, 70%, 48%)",
    strokeDasharray:
      sourceStepType.includes("add-step") || targetStepType.includes("add-step")
        ? "5, 3"
        : undefined,
  };

  return (
    <>
      <BaseEdge path={edgePath} style={edgeStyle} />
    </>
  );
}

export const edgeTypes = {
  default: CustomEdge,
};
