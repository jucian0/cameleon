import React from "react";
import { Position, type NodeProps } from "@xyflow/react";

import type { Node } from "../topology-types";
import { BaseHandle } from "./custom-handle";
import { DeleteNodeModal } from "./delete-node-modal";
import { useLayer } from "../topology-layer/topology-layer";
import { IconPencilBox, IconTrash } from "@intentui/icons";
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

	const [isOpen, setIsOpen] = React.useState(false);
	const handleMenuOpen = () => {
		setIsOpen(true);
	};

	const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

	return (
		<>
			<Menu isOpen={isOpen} onOpenChange={setIsOpen}>
				<Menu.Trigger data-slot="menu-trigger"
					onPress={handleMenuOpen}
					className="cursor-pointer relative flex border rounded-lg bg-secondary shadow-sm hover:shadow-md transition-all duration-200 ease-in-out w-10 h-10 justify-center">
					{data.iconName && (
						<img alt={data.iconName} src={iconPath} className="w-6 h-auto" />
					)}
					{data.absolutePath !== 'route.from' && <BaseHandle type="target" position={targetPosition} />}
					<BaseHandle type="source" position={sourcePosition} isConnectable={false} />
				</Menu.Trigger>
				<Menu.Content placement="bottom">
					<Menu.Item onAction={handleClick} textValue={data.label}>
						<IconPencilBox /> Edit
					</Menu.Item>
					<Menu.Item isDanger onAction={() => setIsDeleteOpen(true)} textValue={`Delete ${data.label}`}>
						<IconTrash /> Delete
					</Menu.Item>
				</Menu.Content>
			</Menu>
			<DeleteNodeModal
				isOpen={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
				node={data}
			/>
		</>
	);
});


