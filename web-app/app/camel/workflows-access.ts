export type WorkflowVisibility = "public" | "private";
export type WorkflowAccessMode = "editable" | "read-only";

export type WorkflowAccessContext = {
  visibility: WorkflowVisibility;
  accessMode: WorkflowAccessMode;
  canView: boolean;
  canEdit: boolean;
  canClone: boolean;
};

export function getWorkflowAccess({
  currentUserId,
  owner,
  visibility,
}: {
  currentUserId?: string | null;
  owner?: string | null;
  visibility: WorkflowVisibility;
}): WorkflowAccessContext {
  const isOwner = Boolean(currentUserId && owner && currentUserId === owner);
  const canView = visibility === "public" || isOwner;
  const canEdit = isOwner;

  return {
    visibility,
    accessMode: canEdit ? "editable" : "read-only",
    canView,
    canEdit,
    canClone: visibility === "public" || canEdit,
  };
}
