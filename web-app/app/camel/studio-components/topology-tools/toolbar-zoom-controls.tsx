import { Maximize, Minus, Plus, ArrowRightFromLine } from "lucide-react";
import { useReactFlow, useStore, useViewport } from "@xyflow/react";
import { Button } from "app/components/ui/button";
import { Slider } from "app/components/ui/slider";
import { useSearchParams } from "react-router";

export function TopologyZoomControls({
  showZoomPercent = false,
}: Readonly<{
  showZoomPercent?: boolean;
}>) {

  const { zoom } = useViewport();
  const { zoomTo, zoomIn, zoomOut, fitView } = useReactFlow();
  const [query, setQuery] = useSearchParams();

  const { minZoom, maxZoom } = useStore(
    (state) => ({
      minZoom: state.minZoom,
      maxZoom: state.maxZoom,
    }),
    (a, b) => a.minZoom !== b.minZoom || a.maxZoom !== b.maxZoom,
  );

  function setDirection(direction: "LR" | "TB" | "RL" | "BT") {
    query.set("direction", direction);
    setQuery(query);
  }

  const direction = query.get("direction") || "LR";

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
        className="w-[120px] sm:w-[140px] flex items-center"
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
