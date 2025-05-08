import React from "react";
import { Position, type NodeProps } from "@xyflow/react";
import type { Node } from "../topology-types";
import { BaseHandle } from "./custom-handle";
import { useLayer } from "../topology-layer/topology-layer";
import { IconPlus } from "@intentui/icons";

export const CustomAddNode = React.memo(({ data, ...props }: NodeProps<Node>) => {
	console.log("CustomAddNode", props);
	const { setNode } = useLayer();
	const handleClick = () => {
		setNode(data);
	};

	function handleKeyDown(event: React.KeyboardEvent) {
		if (event.key === "Enter") {
			handleClick();
		}
	}

	return (
		<div className="w-16 flex items-center justify-center">
			<div onClick={handleClick} onKeyDown={handleKeyDown} role="button" tabIndex={0} className="relative cursor-pointer flex justify-center border-dashed border-primary border rounded bg-transparent transition-all duration-200 ease-in-out w-6 h-6 p-1 px-2 gap-2">
				{data.iconName && (
					<div className="flex items-center justify-center">
						<IconPlus className="text-primary" />
					</div>
				)}
				<BaseHandle type="target" position={Position.Top} />
			</div>
		</div>
	);
});
