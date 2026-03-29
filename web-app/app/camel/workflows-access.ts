export type WorkflowVisibility = "public" | "private";

export type WorkflowAccessContext = {
  visibility: WorkflowVisibility;
  isOwner: boolean;
  isStarter: boolean;
  canView: boolean;
  canEdit: boolean;
  canDuplicate: boolean;
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
  const isStarter = visibility === "public";

  return {
    visibility,
    isOwner,
    isStarter,
    canView: isOwner || isStarter,
    canEdit: isOwner,
    canDuplicate: isOwner || isStarter,
  };
}
