import React from "react";
import { Position, type NodeProps } from "@xyflow/react";
import { EditIcon, MoreVertical, PlusIcon, TrashIcon } from "lucide-react";

import type { Node } from "./../topology-types";
import { BaseHandle } from "./custom-handles";
import { DeleteNodeModal } from "./delete-node-modal";
import { Menu } from "components/ui/menu";
import { Separator } from "components/ui/separator";
import { useLayer } from "../topology-layer/topology-layer";



export const DefaultNode = React.memo(({ data, ...props }: NodeProps<Node>) => {
	const iconPath = `https://tst-ipaas-public-assets.s3.us-east-1.amazonaws.com/images/eips/${data.iconName}.svg`;

	const { setNode } = useLayer();
	const handleClick = () => {
		setNode({ ...data, ...props });
	};

	return (
		<div onClick={handleClick} role="button" className="cursor-pointer relative flex border rounded-lg bg-secondary shadow-sm hover:shadow-md transition-all duration-200 ease-in-out w-16 h-12">
			<div className="flex flex-row gap-1 relative justify-between w-full pl-4 items-center">
				<div className="flex flex-row gap-2 justify-center items-stretch">
					{data.iconName && (
						<div className="flex items-center justify-center">
							<img src={iconPath} className="w-6 h-auto" />
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
					<MoreVertical />
				</Menu.Trigger>
				<Menu.Content placement="bottom">
					<Menu.Item>
						<EditIcon /> Edit
					</Menu.Item>
					<Menu.Item isDanger onAction={() => setIsDeleteOpen(true)}>
						<TrashIcon /> Delete
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

export const CustomAddNode = React.memo(({ data }: NodeProps<Node>) => {

	const { setNode } = useLayer();
	const handleClick = () => {
		setNode(data);
	};

	return (
		<div onClick={handleClick} role="button" className="relative cursor-pointer flex justify-center border-dashed border-primary border rounded-lg bg-transparent transition-all duration-200 ease-in-out w-8 h-8 p-1 px-2 gap-2">
			{data.iconName && (
				<div className="flex items-center justify-center">
					<PlusIcon size={16} className="text-primary" />
				</div>
			)}
			{/* <span className="center">{data.label}</span> */}
			<BaseHandle type="target" position={Position.Top} />
		</div>
	);
});
