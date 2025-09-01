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
import { Button } from "app/components/ui/button";
import { useTopologyStore } from "core";
import { useMediaQuery } from "app/components/utils/use-media-query";
import { Popover } from "app/components/ui/popover";
import { TopologyToolbarActions } from "./topology-toolbar-actions";
import { TopologyRouteSelector } from "./topology-router-selector";
import { TopologyZoomControls } from "./topology-zoom-controls";

export const TopologyTools = forwardRef<
  HTMLDivElement,
  Omit<PanelProps, "children">
>(({ className, ...props }, ref) => {
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

  return (
    <Panel
      ref={ref}
      className={`flex items-center justify-between px-4 w-full gap-1 rounded-md bg-primary-foreground text-foreground ${className}`}
      {...props}
    >
      {query ? (
        <Popover>
          <Button intent="secondary" size="xs" aria-label="Toolbar">
            <Settings className="h-4 w-4" />
          </Button>
          <Popover.Content className="p-2 w-auto">
            <TopologyZoomControls
              zoom={zoom}
              minZoom={minZoom}
              maxZoom={maxZoom}
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              zoomTo={zoomTo}
              fitView={fitView}
              direction={direction}
              setDirection={setDirection}
              showZoomPercent={false}
            />
          </Popover.Content>
        </Popover>
      ) : (
        <TopologyZoomControls
          zoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          zoomTo={zoomTo}
          fitView={fitView}
          direction={direction}
          setDirection={setDirection}
          showZoomPercent
        />
      )}

      <TopologyRouteSelector />
      <TopologyToolbarActions />
    </Panel>
  );
});
