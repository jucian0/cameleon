import React from "react";
import { Position, type NodeProps } from "@xyflow/react";

import type { Node } from "../topology-types";
import { BaseHandle } from "./custom-handle";
import { DeleteNodeModal } from "./delete-node-modal";
import { Separator } from "components/ui/separator";
import { useLayer } from "../topology-layer/topology-layer";
import { IconDotsVertical, IconPencilBox, IconTrash } from "@intentui/icons";
import { Menu } from "components/ui/menu";
import { useTopologyStore } from "../topology-store";

const eipListNames = [
	'aggregate',
	'bean',
	'choice',
	'circuit-breaker',
	'claim-check',
	'convert-body-to',
	'convert-header-to',
	'convert-variable-to',
	'delay',
	'do-try',
	'dynamic-router',
	'enrich',
	'filter',
	'idempotent-consumer',
	'load-balancer',
	'log',
	'loop',
	'marshal',
	'multicast',
	'pausable',
	'policy',
	'poll-enrich',
	'process',
	'recipient-list',
	'remove-header',
	'remove-headers',
	'remove-properties',
	'remove-property',
	'remove-variable',
	'resequence',
	'resumable',
	'routing-slip',
	'saga',
	'sample',
	'script',
	'set-body',
	'set-exchange-pattern',
	'set-header',
	'set-headers',
	'set-variable',
	'set-variables',
	'sort',
	'split',
	'step',
	'stop',
	'threads',
	'throttle',
	'throw-exception',
	'to',
	'to-d',
	'transacted',
	'transform',
	'unmarshal',
	'validate',
	'wire-tap',
	'claim-check',
	'convertVariableTo',
	'convertHeaderTo',
	'convertBodyTo',


	// EIPs complements 

	'when',
	'otherwise',
	'do-while',
	'do-finally',
	'do-catch'
]


export const DefaultNode = React.memo(({ data, ...props }: NodeProps<Node>) => {
	const { canvas } = useTopologyStore()
	const { direction } = canvas
	const targetPosition = direction === "LR" ? Position.Left : Position.Top;
	const sourcePosition = direction === "LR" ? Position.Right : Position.Bottom;

	const iconPath = React.useMemo(() => {
		if (eipListNames.includes(data.iconName)) {
			return `/camel-icons/eips/${data.iconName}.svg`;
		} else {
			return `/camel-icons/components/${data.iconName}.svg`;
		}
	}, [data.iconName]);


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
							<img alt={data.iconName} src={iconPath} className="w-6 h-auto" />
						</div>
					)}
				</div>
				<div className="flex flex-row items-center justify-center">
					<Separator orientation="vertical" className="h-8 bg-border" />
					<NodeMenu node={data} />
				</div>
			</div>
			{data.absolutePath !== 'route.from' && <BaseHandle type="target" position={targetPosition} />}
			<BaseHandle type="source" position={sourcePosition} isConnectable={false} />
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
				<Menu.Trigger onPress={handleMenuOpen} aria-label="Node menu">
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
