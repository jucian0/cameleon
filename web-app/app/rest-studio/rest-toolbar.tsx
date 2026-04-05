import { Button } from "app/components/ui/button";
import { Slider } from "app/components/ui/slider";
import { ArrowRightFromLine, Maximize, Minus, Plus } from "lucide-react";
import React from "react";
import { useFetcher } from "react-router";
import type { ApiSpec } from "./rest-spec";

export function RestToolbar({
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
  orientation = "horizontal",
  onSaveStateChange,
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
  orientation?: "horizontal" | "vertical";
  onSaveStateChange?: (state: {
    saveState: "unsaved" | "saving" | "synced" | "failed";
    saveError: string | null;
  }) => void;
}) {
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
    onSaveStateChange?.({ saveState, saveError });
  }, [onSaveStateChange, saveError, saveState]);

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

  const isVertical = orientation === "vertical";

  return (
    <div
      className={
        isVertical
          ? "flex flex-col items-center gap-2 rounded-md bg-primary-foreground p-2 text-foreground"
          : "flex w-full items-center justify-between gap-1 rounded-md bg-primary-foreground px-4 text-foreground"
      }
    >
      <div
        className={
          isVertical
            ? "flex flex-col items-center gap-2"
            : "flex items-center gap-1"
        }
      >
        <Button
          intent="secondary"
          size="xs"
          aria-label="Zoom out"
          onPress={onZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Slider
          className={
            isVertical
              ? "flex h-[140px] items-center"
              : "flex w-[120px] items-center sm:w-[140px]"
          }
          value={[zoom]}
          minValue={minZoom}
          maxValue={maxZoom}
          step={0.01}
          onChange={(values) => onZoomTo((values as number[])[0])}
          aria-label="Zoom slider"
          output="none"
          orientation={isVertical ? "vertical" : "horizontal"}
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
    </div>
  );
}
