import React from "react";
import { Position, type NodeProps } from "@xyflow/react";
import { STEP_TYPE, generateStepId, type Node, useTopologyStore } from "core";
import { addBetween } from "core/operations";
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
  const { camelConfig, setCamelConfig } = useTopologyStore();
  const { setNode } = useLayer();

  function handleClick() {
    if (
      data.stepType === STEP_TYPE.ADD_WHEN ||
      data.stepType === STEP_TYPE.ADD_DO_CATCH
    ) {
      const branchConfig =
        data.stepType === STEP_TYPE.ADD_WHEN
          ? {
              id: generateStepId("when"),
              steps: [],
            }
          : {
              id: generateStepId("doCatch"),
              exception: ["java.lang.Exception"],
              steps: [],
            };

      setCamelConfig(addBetween(camelConfig, data.absolutePath, branchConfig));
      return;
    }

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
            aria-label="Add node"
            onClick={handleClick}
            disabled={!canEdit}
            className="relative flex w-6 cursor-pointer justify-center gap-2 rounded border border-dashed border-primary bg-transparent p-1 px-2 transition-all duration-200 ease-in-out disabled:cursor-not-allowed"
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
