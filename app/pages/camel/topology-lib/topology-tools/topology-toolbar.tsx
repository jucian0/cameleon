import { forwardRef } from "react";
import {
  Maximize,
  Minus,
  Plus,
  ArrowRightFromLine,
  Settings,
} from "lucide-react";

import {
  Panel,
  useViewport,
  useStore,
  useReactFlow,
  type PanelProps,
} from "@xyflow/react";
import { Button } from "components/ui/button";
import { Slider } from "components/ui/slider";
import { useTopologyStore } from "../topology-store";
import { useMediaQuery } from "components/utils/use-media-query";
import { Popover } from "components/ui/popover";
import { TopologyToolbarActions } from "./topology-toolbar-actions";

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
        className={`flex items-center justify-between px-4 w-full gap-1 rounded-md bg-primary-foreground text-foreground ${className}`}
        {...props}
      >
        <Popover>
          <Button intent="secondary" size="xs" aria-label="Toolbar">
            <Settings className="h-4 w-4" />
          </Button>
          <Popover.Content className="p-2 w-auto">
            <div className="flex items-center gap-1">
              <Button
                intent="secondary"
                size="xs"
                onPress={() => zoomOut({ duration: 300 })}
                aria-label="Zoom out"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Slider
                className="w-[120px]"
                value={[zoom]}
                minValue={minZoom}
                maxValue={maxZoom}
                step={0.01}
                onChange={(values) => zoomTo((values as number[])[0])}
                aria-label="Zoom slider"
              />
              <Button
                intent="secondary"
                size="xs"
                onPress={() => zoomIn({ duration: 300 })}
                aria-label="Zoom in"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                intent="secondary"
                size="xs"
                onPress={() => fitView({ duration: 300 })}
                aria-label="Fit view"
              >
                <Maximize className="h-4 w-4" />
              </Button>

              <Button
                intent="secondary"
                size="xs"
                onPress={() => setDirection(direction === "LR" ? "TB" : "LR")}
                aria-label="Change direction"
              >
                <ArrowRightFromLine
                  className={`h-4 w-4 ${direction === "LR" ? "rotate-90" : ""}`}
                />
              </Button>
            </div>
          </Popover.Content>
        </Popover>
        <TopologyToolbarActions />
      </Panel>
    );
  }

  return (
    <Panel
      className={`flex items-center justify-between px-4 w-full gap-1 rounded-md bg-primary-foreground text-foreground ${className}`}
      {...props}
    >
      <div className="flex items-center gap-1">
        <Button
          intent="secondary"
          size="xs"
          aria-label="Zoom out"
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
          aria-label="Zoom slider"
          output="none"
        />
        <Button
          intent="secondary"
          size="xs"
          aria-label="Zoom in"
          onPress={() => zoomIn({ duration: 300 })}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          className="min-w-20 tabular-nums"
          intent="secondary"
          size="xs"
          aria-label="Zoom to 100%"
          onPress={() => zoomTo(1, { duration: 300 })}
        >
          {(100 * zoom).toFixed(0)}%
        </Button>
        <Button
          intent="secondary"
          size="xs"
          aria-label="Fit view"
          onPress={() => fitView({ duration: 300 })}
        >
          <Maximize className="h-4 w-4" />
        </Button>

        <Button
          intent="secondary"
          size="xs"
          aria-label="Change direction"
          onPress={() => setDirection(direction === "LR" ? "TB" : "LR")}
        >
          <ArrowRightFromLine
            className={`h-4 w-4 ${direction === "LR" ? "rotate-90" : ""}`}
          />
        </Button>
      </div>
      <TopologyToolbarActions />
    </Panel>
  );
});
