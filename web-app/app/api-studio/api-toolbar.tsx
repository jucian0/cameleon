import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "app/components/ui/button";
import { Link } from "app/components/ui/link";
import { Slider } from "app/components/ui/slider";
import { Tooltip } from "app/components/ui/tooltip";
import { ArrowRightFromLine, Code2, Maximize, Minus, Plus } from "lucide-react";
import React from "react";
import { useFetcher, useLocation } from "react-router";
import type { ApiSpec } from "./api-spec";

export function ApiToolbar({
  name,
  description,
  spec,
  canEdit,
  initialSnapshot,
  zoom,
  minZoom,
  maxZoom,
  direction,
  onZoomIn,
  onZoomOut,
  onZoomTo,
  onFitView,
  onToggleDirection,
}: {
  name: string;
  description: string;
  spec: ApiSpec;
  canEdit: boolean;
  initialSnapshot: string;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  direction: "LR" | "TB";
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomTo: (value: number) => void;
  onFitView: () => void;
  onToggleDirection: () => void;
}) {
  const location = useLocation();
  const saveFetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const currentSnapshot = React.useMemo(
    () =>
      JSON.stringify({
        name,
        description,
        spec,
      }),
    [name, description, spec],
  );
  const [saveState, setSaveState] = React.useState<
    "unsaved" | "saving" | "synced" | "failed"
  >("synced");
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const lastSavedSnapshotRef = React.useRef(initialSnapshot);
  const pendingSnapshotRef = React.useRef<string | null>(null);
  const isHydratedRef = React.useRef(false);

  React.useEffect(() => {
    lastSavedSnapshotRef.current = initialSnapshot;
    pendingSnapshotRef.current = null;
    setSaveError(null);
    setSaveState("synced");
    isHydratedRef.current = false;
  }, [initialSnapshot]);

  React.useEffect(() => {
    if (!isHydratedRef.current && currentSnapshot === initialSnapshot) {
      isHydratedRef.current = true;
    }
  }, [currentSnapshot, initialSnapshot]);

  React.useEffect(() => {
    if (saveFetcher.state !== "idle" || pendingSnapshotRef.current == null) {
      return;
    }

    if (saveFetcher.data?.ok === false) {
      setSaveState("failed");
      setSaveError(saveFetcher.data.error ?? "Failed to save API.");
      pendingSnapshotRef.current = null;
      return;
    }

    lastSavedSnapshotRef.current = pendingSnapshotRef.current;
    pendingSnapshotRef.current = null;
    setSaveError(null);
    setSaveState(
      currentSnapshot === lastSavedSnapshotRef.current ? "synced" : "unsaved",
    );
  }, [currentSnapshot, saveFetcher.data, saveFetcher.state]);

  React.useEffect(() => {
    if (!canEdit || !isHydratedRef.current || saveFetcher.state !== "idle") {
      return;
    }

    if (currentSnapshot === lastSavedSnapshotRef.current) {
      if (saveState !== "synced") {
        setSaveState("synced");
      }
      return;
    }

    setSaveState("unsaved");
    const timeoutId = window.setTimeout(() => {
      pendingSnapshotRef.current = currentSnapshot;
      setSaveState("saving");
      setSaveError(null);
      saveFetcher.submit(
        {
          name,
          description,
          content: JSON.stringify(spec),
          saveMode: "autosave",
        },
        { method: "post" },
      );
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [
    canEdit,
    currentSnapshot,
    description,
    name,
    saveFetcher,
    saveState,
    spec,
  ]);

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-overlay/90 px-3 py-2 shadow-card backdrop-blur-sm">
      <div className="flex items-center gap-1">
        <Button
          intent="secondary"
          size="xs"
          aria-label="Zoom out"
          onPress={onZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Slider
          className="flex w-[120px] items-center sm:w-[140px]"
          value={[zoom]}
          minValue={minZoom}
          maxValue={maxZoom}
          step={0.01}
          onChange={(values) => onZoomTo((values as number[])[0])}
          aria-label="Zoom slider"
          output="none"
        />
        <Button
          intent="secondary"
          size="xs"
          aria-label="Zoom in"
          onPress={onZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          className="min-w-20 tabular-nums"
          intent="secondary"
          size="xs"
          aria-label="Zoom to 100%"
          onPress={() => onZoomTo(1)}
        >
          {(100 * zoom).toFixed(0)}%
        </Button>
        <Button
          intent="secondary"
          size="xs"
          aria-label="Fit view"
          onPress={onFitView}
        >
          <Maximize className="h-4 w-4" />
        </Button>
        <Button
          intent="secondary"
          size="xs"
          aria-label="Change direction"
          onPress={onToggleDirection}
        >
          <ArrowRightFromLine
            className={`h-4 w-4 ${direction === "LR" ? "rotate-90" : ""}`}
          />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <Badge
            intent={
              saveState === "failed"
                ? "danger"
                : saveState === "saving"
                  ? "warning"
                  : saveState === "unsaved"
                    ? "secondary"
                    : "success"
            }
          >
            {saveState === "failed"
              ? "Sync failed"
              : saveState === "saving"
                ? "Syncing"
                : saveState === "unsaved"
                  ? "Unsaved"
                  : "Synced"}
          </Badge>
          <Tooltip.Content>
            {saveError
              ? saveError
              : saveState === "unsaved"
                ? "Changes will autosave shortly."
                : saveState === "saving"
                  ? "Syncing API changes."
                  : "All changes synced."}
          </Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Link
            href={`${location.pathname}/code${location.search}`}
            aria-label="Open code view"
            className={buttonStyles({ size: "sq-sm", intent: "secondary" })}
          >
            <Code2 size={16} />
          </Link>
          <Tooltip.Content>Code view</Tooltip.Content>
        </Tooltip>
      </div>
    </div>
  );
}
