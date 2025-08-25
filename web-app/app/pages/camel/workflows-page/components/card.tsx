import { Card, CardContent, CardHeader } from "app/components/ui/card";
import { Badge } from "app/components/ui/badge";
import { Edit, Share2, Copy, MoreHorizontal, Trash } from "lucide-react";
import { buttonStyles } from "app/components/ui/button";
import { Menu } from "app/components/ui/menu";
import { Link } from "app/components/ui/link";
import React from "react";
import { DeleteModal } from "./delete-modal";

interface CamelCardProps {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  nodeCount: number;
}

export const CamelCard = ({
  id,
  name,
  description,
  lastModified,
  nodeCount,
}: CamelCardProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  return (
    <Card className="group relative overflow-hidden bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-card hover:-translate-y-0.5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
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
              <Menu.Item href={`/camel/workflows/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Menu.Item>
              <Menu.Item href={`/camel/workflows/${id}/clone`}>
                <Copy className="h-4 w-4 mr-2" />
                Clone
              </Menu.Item>
              <Menu.Item>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item isDanger onPress={() => setIsDeleteModalOpen(true)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Menu.Item>
            </Menu.Content>
          </Menu>
        </div>
      </CardHeader>

      <CardContent className="relative pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge intent="secondary" className="text-xs">
              {nodeCount} nodes
            </Badge>
            <span className="text-xs text-muted-foreground">
              {lastModified}
            </span>
          </div>

          <Link
            href={`/camel/workflows/${id}/studio`}
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
