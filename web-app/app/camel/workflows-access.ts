export type WorkflowAccessContext = {
  canView: boolean;
  canEdit: boolean;
  canClone: boolean;
};

export function getWorkflowAccess({
  currentUserId,
  owner,
}: {
  currentUserId?: string | null;
  owner?: string | null;
}): WorkflowAccessContext {
  const isOwner = Boolean(currentUserId && owner && currentUserId === owner);

  return {
    canView: isOwner,
    canEdit: isOwner,
    canClone: isOwner,
  };
}
