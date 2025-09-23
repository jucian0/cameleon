import { Badge } from "app/components/ui/badge";

export function StatusBadge({ status }: { status: any }) {
  const variant =
    status === "active"
      ? "secondary"
      : status === "draft"
        ? "outline"
        : "destructive";
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <Badge className={`badge-${variant}`}>{label}</Badge>;
}
