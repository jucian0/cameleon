import React from "react";
import { Position, type NodeProps } from "@xyflow/react";

import type { Node } from "../topology-types";
import { BaseHandle } from "./custom-handle";
import { DeleteNodeModal } from "./delete-node-modal";
import { Separator } from "components/ui/separator";
import { useLayer } from "../topology-layer/topology-layer";
import { IconDotsVertical, IconPencilBox, IconTrash } from "@intentui/icons";
import { Menu } from "components/ui/menu";


export const DefaultNode = React.memo(({ data, ...props }: NodeProps<Node>) => {
	const iconPath = `http://localhost:5173/camel-icons/eips/${data.iconName}.svg`;
	const componentIconPath = `http://localhost:5173/camel-icons/components/${data.iconName}.svg`;

	console.log("data", data.iconName);

	const { setNode } = useLayer();

	function handleClick() {
		setNode({ ...data, ...props });
	};

	function handleKeyDown(event: React.KeyboardEvent) {
		if (event.key === "Enter") {
			handleClick();
		}
	}


	return (
		<div onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0} role="button" className="cursor-pointer relative flex border rounded-lg bg-secondary shadow-sm hover:shadow-md transition-all duration-200 ease-in-out w-16 h-10">
			<div className="flex flex-row gap-1 relative justify-between w-full pl-4 items-center">
				<div className="flex flex-row gap-2 justify-center items-stretch">
					{data.iconName && (
						<div className="flex items-center justify-center">
							<img alt={data.iconName} src={iconPath || componentIconPath} className="w-6 h-auto" />
						</div>
					)}
					{/* <span className="center">{data.stepType}</span> */}
				</div>
				<div className="flex flex-row items-center justify-center">
					<Separator orientation="vertical" className="h-8 bg-border" />
					<NodeMenu node={data} />
				</div>
			</div>
			{data.absolutePath !== 'route.from' && <BaseHandle type="target" position={Position.Top} />}
			<BaseHandle type="source" position={Position.Bottom} isConnectable={false} />
		</div>
	);
});

function NodeMenu({ node }: any) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
	const handleMenuOpen = () => {
		setIsOpen(true);
	};

	return (
		<>
			<Menu isOpen={isOpen} onOpenChange={setIsOpen}>
				<Menu.Trigger onPress={handleMenuOpen}>
					<IconDotsVertical />
				</Menu.Trigger>
				<Menu.Content placement="bottom">
					<Menu.Item>
						<IconPencilBox /> Edit
					</Menu.Item>
					<Menu.Item isDanger onAction={() => setIsDeleteOpen(true)}>
						<IconTrash /> Delete
					</Menu.Item>
				</Menu.Content>
			</Menu>
			<DeleteNodeModal
				isOpen={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
				node={node}
			/>
		</>
	);
}
