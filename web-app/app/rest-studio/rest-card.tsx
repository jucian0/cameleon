import { SwaggerIcon } from "app/components/icons/swagger";
import { Card, CardContent, CardHeader } from "app/components/ui/card";
import { buttonStyles } from "app/components/ui/button";
import { Link } from "app/components/ui/link";
import { Badge } from "@/components/ui/badge";
import type { ApiRecord } from "@/modules/supabase/supabase-db";

export function RestCard({ api }: { api: ApiRecord }) {
  const updatedAt = new Date(api.updated_at).toLocaleDateString();

  return (
    <Card className="group relative gap-0 overflow-hidden border-border/50 bg-gradient-card py-0 transition-all duration-300 hover:border-primary/50 hover:shadow-card">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative gap-3 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/60 bg-secondary/40">
            <SwaggerIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-foreground">
              {api.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {api.description ||
                "REST API definition for resources, operations, and response contracts."}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative px-4 pb-4 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge intent="secondary" className="text-xs">
              Rest Studio
            </Badge>
            <span className="text-xs text-muted-foreground">
              {`Updated on ${updatedAt}`}
            </span>
          </div>

          <Link
            href={`/app/apis/${api.id}/studio`}
            className={buttonStyles({
              intent: "plain",
              className: "text-primary",
              size: "sm",
            })}
          >
            Open
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
