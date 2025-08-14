import type { CamelConfigView } from "@/modules/supabase/supabase-db";
import { Card } from "components/ui/card";
import { Link } from "components/ui/link";
import { StatusBadge } from "./status-badge";
import { Badge } from "components/ui/badge";

type Props = {
  configs: CamelConfigView[];
};

export function CardView(props: Props) {
  return (
    <section aria-label="Configs grid">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {props.configs?.map((c) => (
          <Link href={`/camel/configs/${c.id}/studio`} key={c.id}>
            <Card
              key={c.id}
              className="transition shadow-sm hover:shadow-md focus-within:ring-2 ring-ring h-50"
            >
              <Card.Header>
                <div className="flex items-start justify-between gap-2">
                  <Card.Title className="text-lg leading-tight">
                    {c.name} <span>v{c.latest_version[0].version}</span>
                  </Card.Title>
                  <StatusBadge status={c.latest_version[0].status} />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {new Date(
                      c.latest_version[0].updated_at,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </Card.Header>
              <Card.Content>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {c.latest_version[0].description} description goes here. And
                  not here... hehre here here
                </p>
                <div className="flex flex-wrap gap-2">
                  {c.tags?.slice(0, 3).map((t) => (
                    <Badge key={t} intent="outline">
                      #{t}
                    </Badge>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
