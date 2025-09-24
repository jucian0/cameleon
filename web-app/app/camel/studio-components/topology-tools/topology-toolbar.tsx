import { forwardRef } from "react";
import { Settings } from "lucide-react";

import {
  Panel,
  type PanelProps,
} from "@xyflow/react";
import { Button } from "app/components/ui/button";
import { useMediaQuery } from "app/components/utils/use-media-query";
import { Popover } from "app/components/ui/popover";
import { TopologyToolbarActions } from "./toolbar-actions";
import { TopologyRouteSelector } from "./toolbar-router-selector";
import { TopologyZoomControls } from "./toolbar-zoom-controls";

export const TopologyTools = forwardRef<
  HTMLDivElement,
  Omit<PanelProps, "children">
>(({ className, ...props }, ref) => {
  const isMobile = useMediaQuery("(max-width: 768px)");


  return (
    <Panel
      ref={ref}
      className={`flex items-center justify-between px-4 w-full gap-1 rounded-md bg-primary-foreground text-foreground ${className}`}
      {...props}
    >
      {isMobile ? (
        <Popover>
          <Button intent="secondary" size="xs" aria-label="Toolbar">
            <Settings className="h-4 w-4" />
          </Button>
          <Popover.Content className="p-2 w-auto">
            <TopologyZoomControls showZoomPercent={false} />
          </Popover.Content>
        </Popover>
      ) : (
        <TopologyZoomControls showZoomPercent />
      )}

      <TopologyRouteSelector />
      <TopologyToolbarActions />
    </Panel>
  );
});
