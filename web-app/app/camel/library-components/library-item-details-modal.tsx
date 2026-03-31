import { Badge } from "app/components/ui/badge";
import { Modal } from "app/components/ui/modal";

type DetailsProperty = {
  name: string;
  title?: string | null;
  description?: string | null;
  required?: boolean;
};

export type LibraryDetailsItem = {
  kind: "component" | "eip";
  title: string;
  name: string;
  description: string;
  syntax?: string;
  propertyCount: number;
  requiredCount: number;
  groupCount: number;
  highlightedProperties: DetailsProperty[];
};

export function LibraryItemDetailsModal({
  item,
  isOpen,
  onOpenChange,
}: {
  item: LibraryDetailsItem | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  return (
    <Modal.Content
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      isBlurred
    >
      <Modal.Header>
        <div className="flex items-center gap-2">
          <Badge intent={item?.kind === "component" ? "secondary" : "info"}>
            {item?.kind === "component" ? "Component" : "EIP"}
          </Badge>
          {item && <Badge intent="outline">{item.name}</Badge>}
        </div>
        <Modal.Title>{item?.title ?? ""}</Modal.Title>
        <Modal.Description>{item?.description ?? ""}</Modal.Description>
      </Modal.Header>
      <Modal.Body className="space-y-4">
        {item?.syntax ? (
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
              Syntax
            </p>
            <code className="mt-1 block text-sm text-foreground">
              {item.syntax}
            </code>
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
              Properties
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {item?.propertyCount ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
              Required
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {item?.requiredCount ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
              Groups
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {item?.groupCount ?? 0}
            </p>
          </div>
        </div>
        {item && item.highlightedProperties.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Key properties
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {item.highlightedProperties.map((property) => (
                <div
                  key={property.name}
                  className="rounded-lg border border-border bg-muted/10 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {property.title || property.name}
                    </span>
                    {property.required && (
                      <Badge intent="warning">Required</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-fg">
                    {property.description || "No description available."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Modal.Close>Close</Modal.Close>
      </Modal.Footer>
    </Modal.Content>
  );
}
