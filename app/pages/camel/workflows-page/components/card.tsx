import { Card, CardContent, CardHeader } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { Edit, Share2, Copy, MoreHorizontal } from "lucide-react";
import { Button } from "components/ui/button";
import { Menu } from "components/ui/menu";

interface CamelCardProps {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  nodeCount: number;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onShare: (id: string) => void;
}

export const CamelCard = ({
  id,
  name,
  description,
  lastModified,
  nodeCount,
  onEdit,
  onDuplicate,
  onShare,
}: CamelCardProps) => {
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
            <Menu.Trigger>
              {/*<Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">*/}
              <MoreHorizontal className="h-4 w-4" />
              {/*</Button>*/}
            </Menu.Trigger>
            <Menu.Content className="justify-end">
              <Menu.Item onClick={() => onEdit(id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Menu.Item>
              <Menu.Item onClick={() => onDuplicate(id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Menu.Item>
              <Menu.Item onClick={() => onShare(id)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
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

          <Button
            intent="plain"
            size="sm"
            onClick={() => onEdit(id)}
            className="text-primary"
          >
            Open
          </Button>
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
    </Card>
  );
};
