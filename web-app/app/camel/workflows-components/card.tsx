import { Card, CardContent, CardHeader } from "app/components/ui/card";
import { Badge } from "app/components/ui/badge";
import { Edit, CopyPlus, MoreHorizontal, Trash, Workflow } from "lucide-react";
import { buttonStyles } from "app/components/ui/button";
import { Menu } from "app/components/ui/menu";
import { Link } from "app/components/ui/link";
import React from "react";
import { DeleteModal } from "./delete-modal";
import type { CamelConfig } from "@/modules/supabase/supabase-db";
import { getWorkflowAccess } from "../workflows-access";

type CamelCardProps = {
  camelConfig: CamelConfig;
  currentUserId: string | null;
};

export const CamelCard = ({ camelConfig, currentUserId }: CamelCardProps) => {
  const { id, name, description, owner, updated_at, visibility } = camelConfig;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const access = getWorkflowAccess({
    currentUserId,
    owner,
    visibility,
  });
  const updatedAt = new Date(updated_at).toLocaleDateString();

  return (
    <Card className="group relative gap-0 overflow-hidden border-border/50 bg-gradient-card py-0 transition-all duration-300 hover:border-primary/50 hover:shadow-card">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="relative gap-3 px-4 py-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex flex-1 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/60 bg-secondary/40">
              <Workflow className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold text-foreground">
                {name}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>

          <Menu>
            <Menu.Trigger
              className={buttonStyles({
                intent: "plain",
                size: "sq-sm",
              })}
            >
              <MoreHorizontal size={16} />
            </Menu.Trigger>
            <Menu.Content className="justify-end">
              <Menu.Item
                isDisabled={!access.canEdit}
                href={`/app/camel/workflows/${id}/edit`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Menu.Item>
              <Menu.Item
                isDisabled={!access.canDuplicate}
                href={`/app/camel/workflows/${id}/clone`}
              >
                <CopyPlus className="h-4 w-4 mr-2" />
                {access.isStarter ? "Use as starter" : "Clone"}
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item
                isDisabled={!access.canEdit}
                isDanger
                onPress={() => setIsDeleteModalOpen(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Menu.Item>
            </Menu.Content>
          </Menu>
        </div>
      </CardHeader>

      <CardContent className="relative px-4 pb-4 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              intent={access.isStarter ? "warning" : "secondary"}
              className="text-xs"
            >
              {access.isStarter ? "Starter" : "Personal"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {`Updated on ${updatedAt}`}
            </span>
          </div>

          <Link
            href={`/app/camel/workflows/${id}/studio`}
            className={buttonStyles({
              intent: "plain",
              className: "text-primary",
              size: "sm",
            })}
          >
            Open
          </Link>
        </div>

        {/* Visual workflow preview */}
        <div className="mt-4 h-12 rounded-lg bg-gradient-to-r from-workflow-node to-workflow-connection/20 border border-border/30 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <div className="w-8 h-px bg-workflow-connection" />
              <div className="w-2 h-2 rounded-full bg-workflow-connection" />
              <div className="w-8 h-px bg-workflow-connection" />
              <div className="w-2 h-2 rounded-full bg-accent" />
            </div>
          </div>
        </div>
      </CardContent>
      <DeleteModal
        id={id}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </Card>
  );
};
