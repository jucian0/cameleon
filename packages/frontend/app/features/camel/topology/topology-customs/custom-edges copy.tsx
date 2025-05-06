
import { type EdgeProps, BaseEdge, EdgeLabelRenderer } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { type Node } from "./../topology-types";
import { useTopologyStore } from "../topology-store";
import { Button } from "components/ui/button";
import { useLayer } from "../topology-layer/topology-layer";

const SHOULD_HIDE_IF_BEFORE = ["camel-step", "choice", "multicast", "doTry"];
const SHOULD_HIDE_IF_AFTER = ["camel-step", "choice", "multicast"];

function CustomEdge({ sourceX, sourceY, targetX, targetY, style = {}, target, source }: EdgeProps) {
	const targetNode = useTopologyStore((state) => state.canvas.nodes.find((node) => node.id === target));
	const sourceNode = useTopologyStore((state) => state.canvas.nodes.find((node) => node.id === source));



	const sourceStepType = sourceNode?.data.stepType ?? "";
	const targetStepType = targetNode?.data.stepType ?? "";
	const edgeStyle = {
		...style,
		stroke: "#DF7A59",
		strokeDasharray: targetNode?.data.label === 'add' ? '5, 3' : undefined
	};
	const endEdgeStyle = {
		...style,
		stroke: "#DF7A59",
		strokeDasharray: "5, 3",
	}


	const dx = (targetX - sourceX) / .5;
	const dy = (targetY - sourceY)

	const midY = (sourceY + targetY) / 2;
	const horizontalFirst = Math.abs(dx) > Math.abs(dy);

	let path;
	let borderRadius = 10;


	if (horizontalFirst) {
		// Horizontal then vertical with rounded corners
		const corner1X = targetX - (dx > 0 ? borderRadius : -borderRadius);
		const corner1Y = sourceY;
		const corner2X = targetX;
		const corner2Y = sourceY + (dy > 0 ? borderRadius : -borderRadius);

		path = `
      M${sourceX},${sourceY}
      L${corner1X},${sourceY}
      Q${targetX},${sourceY} ${targetX},${corner2Y}
      L${targetX},${targetY}
    `;
	} else {
		// Vertical then horizontal with rounded corners
		const corner1X = sourceX;
		const corner1Y = targetY - (dy > 0 ? borderRadius : borderRadius);
		const corner2X = sourceX + (dx > 0 ? borderRadius : 0);
		const corner2Y = targetY;

		path = `
      M${sourceX},${sourceY}
      L${sourceX},${corner1Y}
      Q${sourceX},${targetY} ${corner2X},${targetY}
      L${targetX},${targetY}
    `;
	}

	const { setNode } = useLayer()


	function handleClick() {
		setNode({ ...sourceNode?.data, type: "add-step" } as Node['data']);
	}

	const shouldShowLabel = !SHOULD_HIDE_IF_BEFORE.includes(sourceStepType) && !SHOULD_HIDE_IF_AFTER.includes(targetStepType)

	return (<><BaseEdge path={path} style={targetNode?.data.type.includes('add') ? endEdgeStyle : edgeStyle} /> <EdgeLabelRenderer>
		{shouldShowLabel && <div
			className="nodrag nopan pointer-events-auto absolute"
			style={{
				transform: `translate(-50%, -50%) translate(${sourceX}px,${midY - 10}px)`,
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