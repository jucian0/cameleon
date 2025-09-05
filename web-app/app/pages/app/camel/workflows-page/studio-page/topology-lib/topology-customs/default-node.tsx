import React from "react";
import { Position, type NodeProps } from "@xyflow/react";

import type { Node } from "core";
import { DefaultHandle } from "./default-handle";
import { DeleteNodeModal } from "./delete-node-modal";
import { useLayer } from "../topology-layer/topology-layer";
import { IconPencilBox, IconRepeat, IconTrash } from "@intentui/icons";
import { Menu } from "app/components/ui/menu";
import { Tooltip } from "app/components/ui/tooltip";
import { FallbackImage } from "app/components/fallback-image";
import { useSearchParams } from "react-router";

const eipListNames = [
  "aggregate",
  "bean",
  "choice",
  "circuitBreaker",
  "claimCheck",
  "convertBodyTo",
  "convertHeaderTo",
  "convertVariableTo",
  "delay",
  "doTry",
  "doCatch",
  "doFinally",
  "dynamicRouter",
  "enrich",
  "filter",
  "idempotentConsumer",
  "loadBalancer",
  "log",
  "loop",
  "marshal",
  "multicast",
  "pausable",
  "policy",
  "pollEnrich",
  "process",
  "recipientList",
  "removeHeader",
  "removeHeaders",
  "removeProperties",
  "removeProperty",
  "removeVariable",
  "resequence",
  "resumable",
  "routingSlip",
  "saga",
  "sample",
  "script",
  "setBody",
  "setExchangePattern",
  "setHeader",
  "setHeaders",
  "setVariable",
  "setVariables",
  "sort",
  "split",
  "step",
  "stop",
  "threads",
  "throttle",
  "throwException",
  "to",
  "toD",
  "transacted",
  "transform",
  "unmarshal",
  "validate",
  "wireTap",
  "claimCheck",
  "convertVariableTo",
  "convertHeaderTo",
  "convertBodyTo",

  // EIPs complements

  "when",
  "otherwise",
  "do-while",
  "do-finally",
  "do-catch",
];

export const DefaultNode = React.memo(({ data, ...props }: NodeProps<Node>) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query] = useSearchParams();
  const direction = query.get("direction") || "LR";
  const targetPosition = direction === "LR" ? Position.Left : Position.Top;
  const sourcePosition = direction === "LR" ? Position.Right : Position.Bottom;

  const iconPath = React.useMemo(() => {
    if (eipListNames.includes(data.stepType)) {
      return `/camel-icons/eips/${data.stepType}.svg`;
    } else {
      return `/camel-icons/components/${data.stepType}.svg`;
    }
  }, [data.iconName]);

  const { setNode } = useLayer();

  function handleClick() {
    setNode({ ...data, ...props });
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
          <Menu.Item onAction={handleClick} textValue={data.label}>
            <IconPencilBox /> Edit
          </Menu.Item>
          <Menu.Item
            onAction={() => setIsOpen(true)}
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
