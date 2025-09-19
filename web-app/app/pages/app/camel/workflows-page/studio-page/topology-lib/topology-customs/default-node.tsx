import React from "react";
import { Position, type NodeProps } from "@xyflow/react";

import { EIPSListNames, type Node, type StepType } from "core";
import { DefaultHandle } from "./default-handle";
import { DeleteNodeModal } from "./delete-node-modal";
import { useLayer } from "../topology-layer/topology-layer";
import { IconPencilBox, IconRepeat, IconTrash } from "@intentui/icons";
import { Menu } from "app/components/ui/menu";
import { Tooltip } from "app/components/ui/tooltip";
import { FallbackImage } from "app/components/fallback-image";
import { useSearchParams } from "react-router";

export const DefaultNode = React.memo(({ data, ...props }: NodeProps<Node>) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query] = useSearchParams();
  const direction = query.get("direction") || "LR";
  const targetPosition = direction === "LR" ? Position.Left : Position.Top;
  const sourcePosition = direction === "LR" ? Position.Right : Position.Bottom;

  const iconPath = React.useMemo(() => {
    if (EIPSListNames.includes(data.stepType)) {
      return `/camel-icons/eips/${data.stepType}.svg`;
    } else {
      return `/camel-icons/components/${data.stepType}.svg`;
    }
  }, [data.iconName]);

  const { setNode } = useLayer();

  function handleClick(operation: StepType) {
    return () => setNode({ ...data, ...props, operation });
  }

  function handleMenuOpen() {
    setIsOpen(true);
  }

  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const isFirstNode = data.absolutePath.split(".").length === 4;

  return (
    <div className="flex flex-col items-center gap-1">
      {isFirstNode && (
        <div className="text-xs text-third select-none absolute -top-6 w-max border rounded px-2 bg-secondary">
          {props.id}
        </div>
      )}
      <Menu isOpen={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <Menu.Trigger
            data-slot="menu-trigger"
            onPress={handleMenuOpen}
            className={`cursor-pointer relative flex border rounded-lg bg-secondary shadow-sm hover:shadow-md transition-all duration-200 ease-in-out w-10 h-10 justify-center`}
          >
            {data.iconName && (
              <FallbackImage
                src={iconPath}
                fallback="/camel-icons/components/generic.svg"
                alt={data.iconName}
                className="w-6 h-auto"
              />
            )}
            {!isFirstNode && (
              <DefaultHandle type="target" position={targetPosition} />
            )}
            <DefaultHandle
              type="source"
              position={sourcePosition}
              isConnectable={false}
            />
          </Menu.Trigger>
          <Tooltip.Content>{data.label?.toUpperCase()}</Tooltip.Content>
        </Tooltip>
        <Menu.Content placement="bottom">
          <Menu.Item onAction={handleClick("edit")} textValue={data.label}>
            <IconPencilBox /> Edit
          </Menu.Item>
          <Menu.Item
            onAction={handleClick("add-step")}
            textValue={`Replace ${data.label}`}
          >
            <IconRepeat /> Replace
          </Menu.Item>
          <Menu.Item
            isDanger
            onAction={() => setIsDeleteOpen(true)}
            textValue={`Delete ${data.label}`}
          >
            <IconTrash /> Delete
          </Menu.Item>
        </Menu.Content>
      </Menu>
      <DeleteNodeModal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        node={data}
        routeId=""
      />
    </div>
  );
});
