import React from "react";
import { Position, type NodeProps } from "@xyflow/react";
import type { Node } from "core";
import { DefaultHandle } from "./default-handle";
import { useLayer } from "../topology-layer/topology-layer";
import { IconPlus } from "@intentui/icons";
import { Tooltip } from "app/components/ui/tooltip";
import { Pressable } from "react-aria-components";
import { useSearchParams } from "react-router";

export const AddNode = React.memo(({ data }: NodeProps<Node>) => {
  const [query] = useSearchParams();
  const direction = query.get("direction") || "LR";
  const targetPosition = direction === "LR" ? Position.Left : Position.Top;

  const { setNode } = useLayer();

  function handleClick() {
    setNode({ ...data, operation: "add-step" });
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      handleClick();
    }
  }

  return (
    <Tooltip>
      <Pressable>
        <div className="w-10 h-10 flex items-center justify-center">
          <div
            aria-label="Add node"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            className="relative cursor-pointer flex justify-center border-dashed border-primary border rounded bg-transparent transition-all duration-200 ease-in-out w-6 h-6 p-1 px-2 gap-2"
          >
            {data.iconName && (
              <div className="flex items-center justify-center">
                <IconPlus className="text-primary" />
              </div>
            )}
            <DefaultHandle type="target" position={targetPosition} />
          </div>
        </div>
      </Pressable>
      <Tooltip.Content>{data.label.toUpperCase()}</Tooltip.Content>
    </Tooltip>
  );
});
