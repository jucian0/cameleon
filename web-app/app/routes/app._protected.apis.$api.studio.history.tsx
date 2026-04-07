import React from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import { withModal } from "app/components/utils/with-modal";
import { Sheet } from "app/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createServerSupabase } from "@/modules/supabase/supabase-server";
import {
  createApiVersion,
  deleteApiVersion,
  listApiVersions,
} from "@/rest-studio/rest-records";
import {
  apiSpecToJson,
  parseApiSpec,
  serializeApiSpec,
  useApiStore,
} from "@/rest-studio/rest-spec";
import { History, RotateCcw, Trash2 } from "lucide-react";
import {
  useFetcher,
  useLocation,
  useOutletContext,
  useRevalidator,
  type LoaderFunctionArgs,
} from "react-router";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

export const handle = {
  breadcrumb: () => "History",
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const apiId = params.api;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const api = await supabase
    .from("apis")
    .select("id, owner")
    .eq("id", apiId)
    .maybeSingle();

  if (api.error) {
    throw new Response(api.error.message, { status: 500 });
  }

  if (!api.data) {
    throw new Response("API not found", { status: 404 });
  }

  if (!user?.id || api.data.owner !== user.id) {
    throw new Response("You do not have access to this API.", {
      status: 403,
    });
  }

  const versions = await listApiVersions(supabase, apiId ?? "");

  return {
    canEdit: true,
    versions: versions.data ?? [],
    versionsError: versions.error?.message ?? null,
  };
}

export async function action({ request, params }: LoaderFunctionArgs) {
  const { supabase } = createServerSupabase(request);
  const apiId = params.api;
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "restore");
  const versionId = String(formData.get("versionId") ?? "");
  const content = String(formData.get("content") ?? "");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const api = await supabase
    .from("apis")
    .select("id, owner")
    .eq("id", apiId)
    .maybeSingle();

  if (api.error) {
    return { ok: false, error: api.error.message };
  }

  if (!api.data) {
    return { ok: false, error: "API not found." };
  }

  if (!user?.id || api.data.owner !== user.id) {
    return {
      ok: false,
      error:
        intent === "create-version"
          ? "You do not have permission to create versions."
          : "You do not have permission to manage versions.",
    };
  }

  if (intent === "create-version") {
    const versionResult = await createApiVersion(
      supabase,
      apiId ?? "",
      content,
      {
        status: "milestone",
        description: "Manual milestone snapshot",
      },
    );

    return {
      ok: true,
      createdVersion: true,
      versionError: versionResult.error?.message ?? null,
    };
  }

  if (intent === "delete-version") {
    const deleteResult = await deleteApiVersion(
      supabase,
      apiId ?? "",
      versionId,
    );

    if (deleteResult.error) {
      return { ok: false, error: deleteResult.error.message };
    }

    if (!deleteResult.data) {
      return {
        ok: false,
        error:
          "Version could not be deleted. Check the api_versions delete policy.",
      };
    }

    return {
      ok: true,
      deletedVersion: true,
    };
  }

  const version = await supabase
    .from("api_versions")
    .select("id, version, content")
    .eq("id", versionId)
    .eq("api_id", apiId)
    .maybeSingle();

  if (version.error) {
    return { ok: false, error: version.error.message };
  }

  if (!version.data) {
    return { ok: false, error: "Version not found." };
  }

  const update = await supabase
    .from("apis")
    .update({
      content: version.data.content,
    })
    .eq("id", apiId);

  if (update.error) {
    return { ok: false, error: update.error.message };
  }

  const versionResult = await createApiVersion(
    supabase,
    apiId ?? "",
    version.data.content,
    {
      status: "restored",
      description: `Restored from version ${version.data.version}`,
    },
  );

  return {
    ok: true,
    content: version.data.content,
    versionError: versionResult.error?.message ?? null,
  };
}

export default withModal(function ApiHistoryModal({
  isOpen,
  closeModal,
  loaderData,
}: any) {
  const location = useLocation();
  const restoreFetcher = useFetcher<{
    ok?: boolean;
    error?: string;
    content?: string;
    versionError?: string | null;
  }>();
  const versionFetcher = useFetcher<{
    ok?: boolean;
    error?: string;
    createdVersion?: boolean;
    versionError?: string | null;
  }>();
  const deleteFetcher = useFetcher<{
    ok?: boolean;
    error?: string;
    deletedVersion?: boolean;
  }>();
  const revalidator = useRevalidator();
  const { apiSpec, setApiSpec } = useApiStore();
  const { canEdit } = useOutletContext<{ apiId: string; canEdit: boolean }>();
  const [selectedVersionId, setSelectedVersionId] = React.useState<
    string | null
  >(loaderData.versions[0]?.id ?? null);
  const currentDraft = React.useMemo(() => apiSpecToJson(apiSpec), [apiSpec]);
  const currentDraftContent = React.useMemo(
    () => serializeApiSpec(apiSpec),
    [apiSpec],
  );
  const selectedVersion = React.useMemo(
    () =>
      loaderData.versions.find(
        (version: any) => version.id === selectedVersionId,
      ) ?? null,
    [loaderData.versions, selectedVersionId],
  );
  const selectedVersionDisplay = React.useMemo(() => {
    if (!selectedVersion) return null;
    try {
      return apiSpecToJson(parseApiSpec(selectedVersion.content));
    } catch {
      return selectedVersion.content;
    }
  }, [selectedVersion]);
  const hasDiffChanges = React.useMemo(
    () =>
      Boolean(
        selectedVersion && selectedVersion.content !== currentDraftContent,
      ),
    [currentDraftContent, selectedVersion],
  );
  const diffStyles = React.useMemo(
    () =>
      ({
        variables: {
          dark: {
            diffViewerBackground: "transparent",
            diffViewerColor: "var(--color-foreground)",
            addedBackground:
              "color-mix(in oklab, var(--color-success) 12%, transparent)",
            addedColor: "var(--color-foreground)",
            removedBackground:
              "color-mix(in oklab, var(--color-danger) 12%, transparent)",
            removedColor: "var(--color-foreground)",
            wordAddedBackground:
              "color-mix(in oklab, var(--color-success) 24%, transparent)",
            wordRemovedBackground:
              "color-mix(in oklab, var(--color-danger) 24%, transparent)",
            gutterBackground:
              "color-mix(in oklab, var(--color-muted) 28%, transparent)",
            gutterBackgroundDark:
              "color-mix(in oklab, var(--color-muted) 28%, transparent)",
            gutterColor: "var(--color-muted-fg)",
            addedGutterBackground:
              "color-mix(in oklab, var(--color-success) 16%, transparent)",
            removedGutterBackground:
              "color-mix(in oklab, var(--color-danger) 16%, transparent)",
            codeFoldGutterBackground:
              "color-mix(in oklab, var(--color-muted) 22%, transparent)",
            codeFoldBackground:
              "color-mix(in oklab, var(--color-muted) 18%, transparent)",
            emptyLineBackground: "transparent",
            highlightBackground:
              "color-mix(in oklab, var(--color-warning) 18%, transparent)",
            lineNumberColor: "var(--color-muted-fg)",
          },
        },
        diffContainer: {
          borderColor: "var(--color-border)",
        },
        line: {
          fontSize: "12px",
        },
        contentText: {
          fontFamily:
            "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
        },
      }) as const,
    [],
  );

  React.useEffect(() => {
    setSelectedVersionId(loaderData.versions[0]?.id ?? null);
  }, [loaderData.versions]);

  React.useEffect(() => {
    if (!restoreFetcher.data?.ok || !restoreFetcher.data.content) {
      return;
    }

    setApiSpec(parseApiSpec(restoreFetcher.data.content));
    closeModal(
      `${location.pathname.replace("/history", "")}${location.search}`,
    );
  }, [
    closeModal,
    location.pathname,
    location.search,
    restoreFetcher.data,
    setApiSpec,
  ]);

  React.useEffect(() => {
    if (!versionFetcher.data?.ok || !versionFetcher.data.createdVersion) return;
    revalidator.revalidate();
  }, [revalidator, versionFetcher.data]);

  React.useEffect(() => {
    if (!deleteFetcher.data?.ok || !deleteFetcher.data.deletedVersion) return;
    setSelectedVersionId((current) =>
      current === selectedVersionId ? null : current,
    );
    revalidator.revalidate();
  }, [deleteFetcher.data, revalidator, selectedVersionId]);

  function handleClose() {
    closeModal(
      `${location.pathname.replace("/history", "")}${location.search}`,
    );
  }

  return (
    <Sheet isOpen={isOpen} onOpenChange={handleClose}>
      <Sheet.Content className="w-[min(90vw,72rem)] sm:max-w-[72rem]">
        <Sheet.Header className="px-4 py-4 pb-3">
          <div className="flex items-center gap-2">
            <Badge intent="secondary">
              <History className="h-3 w-3" />
              History
            </Badge>
          </div>
          <Sheet.Title>Version history</Sheet.Title>
          <Sheet.Description>
            Review saved REST API snapshots and restore an earlier version when
            needed.
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Body className="space-y-3 px-4 py-2 pb-4">
          {versionFetcher.data?.versionError && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-foreground">
              {versionFetcher.data.versionError}
            </div>
          )}
          {loaderData.versionsError && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-foreground">
              {loaderData.versionsError}
            </div>
          )}
          {deleteFetcher.data?.error && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-foreground">
              {deleteFetcher.data.error}
            </div>
          )}
          {loaderData.versions.length === 0 && !loaderData.versionsError && (
            <section className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-fg">
              <p>No saved versions yet.</p>
              {canEdit && (
                <Button
                  className="mt-3"
                  size="sm"
                  isDisabled={versionFetcher.state !== "idle"}
                  isPending={versionFetcher.state !== "idle"}
                  onPress={() =>
                    versionFetcher.submit(
                      {
                        intent: "create-version",
                        content: currentDraftContent,
                      },
                      { method: "post" },
                    )
                  }
                >
                  New version
                </Button>
              )}
            </section>
          )}
          {loaderData.versions.map((version: any, index: number) => (
            <section
              key={version.id}
              className={`rounded-xl border bg-background px-3 py-3 ${
                selectedVersionId === version.id
                  ? "border-primary"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="flex-1 space-y-2 text-left"
                  onClick={() => setSelectedVersionId(version.id)}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Version {version.version}
                    </p>
                    <Badge intent={index === 0 ? "success" : "secondary"}>
                      {index === 0 ? "Latest" : version.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-fg">{version.description}</p>
                  <p className="text-xs text-muted-fg">
                    {formatTimestamp(version.updated_at)}
                  </p>
                </button>
                {canEdit && index === 0 ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      isDisabled={
                        versionFetcher.state !== "idle" ||
                        currentDraftContent === version.content
                      }
                      isPending={versionFetcher.state !== "idle"}
                      onPress={() =>
                        versionFetcher.submit(
                          {
                            intent: "create-version",
                            content: currentDraftContent,
                          },
                          { method: "post" },
                        )
                      }
                    >
                      New version
                    </Button>
                    <Button
                      size="sq-sm"
                      intent="plain"
                      className="text-danger hover:text-danger"
                      isDisabled={deleteFetcher.state !== "idle"}
                      isPending={deleteFetcher.state !== "idle"}
                      onPress={() =>
                        deleteFetcher.submit(
                          {
                            intent: "delete-version",
                            versionId: version.id,
                          },
                          { method: "post" },
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : canEdit ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      intent="secondary"
                      isDisabled={restoreFetcher.state !== "idle"}
                      onPress={() =>
                        restoreFetcher.submit(
                          { versionId: version.id },
                          { method: "post" },
                        )
                      }
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                    <Button
                      size="sq-sm"
                      intent="plain"
                      className="text-danger hover:text-danger"
                      isDisabled={deleteFetcher.state !== "idle"}
                      isPending={deleteFetcher.state !== "idle"}
                      onPress={() =>
                        deleteFetcher.submit(
                          {
                            intent: "delete-version",
                            versionId: version.id,
                          },
                          { method: "post" },
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </section>
          ))}
          {selectedVersion && (
            <section className="rounded-xl border border-border bg-background">
              <div className="border-b border-border px-3 py-2">
                <p className="text-sm font-medium text-foreground">
                  Compare version {selectedVersion.version} with current draft
                </p>
              </div>
              {hasDiffChanges ? (
                <div className="max-h-[70vh] overflow-auto px-3 py-3">
                  <ReactDiffViewer
                    oldValue={selectedVersionDisplay ?? ""}
                    newValue={currentDraft}
                    splitView
                    useDarkTheme
                    showDiffOnly
                    extraLinesSurroundingDiff={3}
                    compareMethod={DiffMethod.WORDS}
                    leftTitle={`Version ${selectedVersion.version}`}
                    rightTitle="Current draft"
                    styles={diffStyles}
                  />
                </div>
              ) : (
                <div className="px-3 py-4 text-sm text-muted-fg">
                  No changes between this version and the current draft.
                </div>
              )}
            </section>
          )}
          {restoreFetcher.data?.error && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-foreground">
              {restoreFetcher.data.error}
            </div>
          )}
          {versionFetcher.data?.createdVersion &&
            !versionFetcher.data.versionError && (
              <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success-foreground">
                New version created.
              </div>
            )}
          {deleteFetcher.data?.deletedVersion && (
            <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success-foreground">
              Version deleted.
            </div>
          )}
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
});
