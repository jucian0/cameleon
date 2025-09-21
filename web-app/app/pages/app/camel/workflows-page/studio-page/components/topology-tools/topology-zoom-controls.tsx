import { Maximize, Minus, Plus, ArrowRightFromLine } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { Button } from "app/components/ui/button";
import { Slider } from "app/components/ui/slider";

export function TopologyZoomControls({
  zoom,
  minZoom,
  maxZoom,
  zoomIn,
  zoomOut,
  zoomTo,
  fitView,
  direction,
  setDirection,
  showZoomPercent = false,
}: {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  zoomIn: ReturnType<typeof useReactFlow>["zoomIn"];
  zoomOut: ReturnType<typeof useReactFlow>["zoomOut"];
  zoomTo: ReturnType<typeof useReactFlow>["zoomTo"];
  fitView: ReturnType<typeof useReactFlow>["fitView"];
  direction: string;
  setDirection: (d: "LR" | "TB") => void;
  showZoomPercent?: boolean;
}) {
  return (
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
        className="w-[120px] sm:w-[140px]"
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

      {showZoomPercent && (
        <Button
          className="min-w-20 tabular-nums"
          intent="secondary"
          size="xs"
          aria-label="Zoom to 100%"
          onPress={() => zoomTo(1, { duration: 300 })}
        >
          {(100 * zoom).toFixed(0)}%
        </Button>
      )}

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
  );
}
