import { type EdgeProps, BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { type Node } from "./../topology-types";
import { Button } from "components/ui/button";
import { useTopologyStore } from "../topology-store";
import { useLayer } from "../topology-layer/topology-layer";

const SHOULD_HIDE_IF_BEFORE = ["camel-step", "choice", "multicast", "doTry"];
const SHOULD_HIDE_IF_TARGET = ["camel-step", "choice", "multicast", "merge"];

function CustomEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, target, source }: EdgeProps) {
	const targetNode = useTopologyStore((state) => state.canvas.nodes.find((node) => node.id === target));
	const sourceNode = useTopologyStore((state) => state.canvas.nodes.find((node) => node.id === source));

	// not sure which one is better, smooth or bezier
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition
	});

	const sourceStepType = sourceNode?.data.stepType ?? "";
	const targetStepType = targetNode?.data.stepType ?? "";
	const edgeStyle = {
		...style,
		stroke: "#DF7A59",
		strokeDasharray: sourceStepType.includes('add') || targetStepType.includes('add') ? '5, 3' : undefined
	};

	const { setNode } = useLayer()

	function handleClick() {
		setNode({ ...sourceNode?.data, type: "add-step" } as Node['data']);
	}

	// if Bezier is used, this value should be replaced by labelY
	const buttonYPosition = targetStepType === "add-step" ? sourceY + 16 : labelY;
	const shouldShowLabel = !SHOULD_HIDE_IF_BEFORE.includes(sourceStepType) && !SHOULD_HIDE_IF_TARGET.includes(targetStepType)

	return (<><BaseEdge path={edgePath} style={edgeStyle} /> <EdgeLabelRenderer>
		{shouldShowLabel && <div
			className="nodrag nopan pointer-events-auto absolute"
			style={{
				transform: `translate(-50%, -50%) translate(${sourceX}px,${buttonYPosition}px)`,
			}}
		>
			<Button onPress={handleClick} className={"h-4 w-4 p-0 rounded"}><PlusIcon size={16} /></Button>
		</div>}
	</EdgeLabelRenderer>
	</>)

}

export const edgeTypes = {
	default: CustomEdge,
};