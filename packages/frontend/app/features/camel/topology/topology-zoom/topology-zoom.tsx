import { forwardRef } from "react";
import { Maximize, Minus, Plus } from "lucide-react";

import {
  Panel,
  useViewport,
  useStore,
  useReactFlow,
  type PanelProps,
} from "@xyflow/react";
import { Button } from "components/ui/button";
import { Slider } from "components/ui/slider";


export const TopologyZoom = forwardRef<
  HTMLDivElement,
  Omit<PanelProps, "children">
>(({ className, ...props }) => {
  const { zoom } = useViewport();
  const { zoomTo, zoomIn, zoomOut, fitView } = useReactFlow();

  const { minZoom, maxZoom } = useStore(
    (state) => ({
      minZoom: state.minZoom,
      maxZoom: state.maxZoom,
    }),
    (a, b) => a.minZoom !== b.minZoom || a.maxZoom !== b.maxZoom,
  );

  return (
    <Panel
      // className={cn(
      //   "flex items-center gap-1 rounded-md bg-primary-foreground p-1 text-foreground",
      //   className,
      // )}
      className={`flex items-center gap-1 rounded-md bg-primary-foreground p-1 text-foreground ${className}`}
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
    </Panel>
  );
});