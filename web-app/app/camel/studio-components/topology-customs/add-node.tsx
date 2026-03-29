import React from "react";
import { Position, type NodeProps } from "@xyflow/react";
import type { Node } from "core";
import { DefaultHandle } from "./default-handle";
import { useLayer } from "../topology-layer/topology-layer";
import { IconPlus } from "@intentui/icons";
import { Tooltip } from "app/components/ui/tooltip";
import { Pressable } from "react-aria-components";
import { useOutletContext, useSearchParams } from "react-router";
import type { WorkflowAccessContext } from "@/camel/workflows-access";

export const AddNode = React.memo(({ data }: NodeProps<Node>) => {
  const [query] = useSearchParams();
  const direction = query.get("direction") || "LR";
  const targetPosition = direction === "LR" ? Position.Left : Position.Top;
  const { canEdit } = useOutletContext<
    WorkflowAccessContext & { workflowId: string }
  >();

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
      <Pressable isDisabled={!canEdit}>
        <div className="w-10 h-10 flex items-center justify-center">
          <button
            disabled={!canEdit}
            aria-label="Add node"
            onClick={handleClick}
            className="relative cursor-pointer flex justify-center border-dashed border-primary border rounded bg-transparent transition-all duration-200 ease-in-out w-6 h-6 p-1 px-2 gap-2 disabled:cursor-not-allowed"
            type="button"
          >
            {data.iconName && (
              <div className="flex items-center justify-center">
                <IconPlus className="text-primary" />
              </div>
            )}
            <DefaultHandle type="target" position={targetPosition} />
          </button>
        </div>
      </Pressable>
      <Tooltip.Content>{data.label.toUpperCase()}</Tooltip.Content>
    </Tooltip>
  );
});
