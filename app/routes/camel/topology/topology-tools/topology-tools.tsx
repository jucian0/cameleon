import { forwardRef } from "react";
import { Maximize, Minus, Plus, ArrowRightFromLine, Settings } from "lucide-react";

import {
  Panel,
  useViewport,
  useStore,
  useReactFlow,
  type PanelProps,
} from "@xyflow/react";
import { Button, buttonStyles } from "components/ui/button";
import { Slider } from "components/ui/slider";
import { useTopologyStore } from "../topology-store";
import { useMediaQuery } from "components/utils/use-media-query";
import { Menu } from "components/ui/menu";
import { Popover } from "components/ui/popover";


export const TopologyTools = forwardRef<
  HTMLDivElement,
  Omit<PanelProps, "children">
>(({ className, ...props }) => {
  const { zoom } = useViewport();
  const { zoomTo, zoomIn, zoomOut, fitView } = useReactFlow();
  const query = useMediaQuery("(max-width: 768px)");

  const { minZoom, maxZoom } = useStore(
    (state) => ({
      minZoom: state.minZoom,
      maxZoom: state.maxZoom,
    }),
    (a, b) => a.minZoom !== b.minZoom || a.maxZoom !== b.maxZoom,
  );

  const { canvas } = useTopologyStore();
  const { direction, setDirection } = canvas;

  if (query) {
    return (
      <Panel
        className={`flex items-center gap-1 rounded-md bg-primary-foreground text-foreground ${className}`}
        {...props}
      >
        <Popover>
          <Button intent="secondary" size="extra-small">
            <Settings className="h-4 w-4" />
          </Button>
          <Popover.Content className="w-56">
            <div className="flex items-center gap-1">
              <Button
                intent="secondary"
                size="extra-small"
                onPress={() => zoomOut({ duration: 300 })}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Slider
                className="w-[140px]"
                value={[zoom]}
                minValue={minZoom}
                maxValue={maxZoom}
                step={0.01}
                onChange={(values) => zoomTo((values as number[])[0])}
              />
              <Button
                intent="secondary"
                size="extra-small"
                onPress={() => zoomIn({ duration: 300 })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="min-w-20 tabular-nums"
              intent="secondary"
              size="extra-small"
              onPress={() => zoomTo(1, { duration: 300 })}
            >
              {(100 * zoom).toFixed(0)}%
            </Button>
            <Button
              intent="secondary"
              size="extra-small"
              onPress={() => fitView({ duration: 300 })}
            >
              <Maximize className="h-4 w-4" />
            </Button>

            <Button
              intent="secondary"
              size="extra-small"
              onPress={() => setDirection(direction === "LR" ? "TB" : "LR")}
            >
              <ArrowRightFromLine
                className={`h-4 w-4 ${direction === "LR" ? "rotate-90" : ""
                  }`}
              />
            </Button>
          </Popover.Content>
        </Popover>
      </Panel>
    )
  }

  return (
    <Panel
      className={`flex items-center gap-1 rounded-md bg-primary-foreground text-foreground ${className}`}
      {...props}
    >
      <Button
        intent="secondary"
        size="extra-small"
        onPress={() => zoomOut({ duration: 300 })}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Slider
        className="w-[140px]"
        value={[zoom]}
        minValue={minZoom}
        maxValue={maxZoom}
        step={0.01}
        onChange={(values) => zoomTo((values as number[])[0])}
      />
      <Button
        intent="secondary"
        size="extra-small"
        onPress={() => zoomIn({ duration: 300 })}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        className="min-w-20 tabular-nums"
        intent="secondary"
        size="extra-small"
        onPress={() => zoomTo(1, { duration: 300 })}
      >
        {(100 * zoom).toFixed(0)}%
      </Button>
      <Button
        intent="secondary"
        size="extra-small"
        onPress={() => fitView({ duration: 300 })}
      >
        <Maximize className="h-4 w-4" />
      </Button>

      <Button
        intent="secondary"
        size="extra-small"
        onPress={() => setDirection(direction === "LR" ? "TB" : "LR")}
      >
        <ArrowRightFromLine className={`h-4 w-4 ${direction === "LR" ? "rotate-90" : ""}`} />
      </Button>
    </Panel>
  );
});