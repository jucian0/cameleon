import { useTopologyStore } from "core";
import { Button, buttonStyles } from "app/components/ui/button";
import { useLocation, useNavigation, useOutletContext, useSubmit } from "react-router";
import { Loader } from "app/components/ui/loader";
import { Link } from "app/components/ui/link";
import { Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const TopologyToolbarActions = () => {
  const { getCamelConfigYaml } = useTopologyStore();
  const submit = useSubmit();
  const navigation = useNavigation();
  const location = useLocation();
  const { visibility } = useOutletContext<{ visibility: "public" | "private" }>();

  function handleSave() {
    submit({ content: getCamelConfigYaml() }, { method: "post" });
  }

  return (
    <div className='flex items-center gap-1'>
      {visibility === "private" && (
        <Badge className="px-3 py-2" intent="info">Private</Badge>
      )}
      {
        visibility === "public" && (
          <Badge className="px-3 py-2" intent="warning">Public</Badge>
        )
      }
      <Button
        size="sm"
        onPress={handleSave}
        isPending={navigation.state === "submitting"}
      >
        {navigation.state === "submitting" && <Loader />}
        Save
      </Button>
      <Link href={`${location.pathname}/code${location.search}`} className={buttonStyles({ size: "lg", intent: "secondary" })}>
        <Code2 size={16} />
      </Link>
    </div>
  );
};
