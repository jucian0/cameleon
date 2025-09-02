import { useTopologyStore } from "core";
import { Button } from "app/components/ui/button";
import { TopologyEditor } from "../topology-editor/code-editor";
import { useNavigation, useSubmit } from "react-router";
import { Loader } from "app/components/ui/loader";

export const TopologyToolbarActions = () => {
  const { getCamelConfigYaml } = useTopologyStore();
  const submit = useSubmit();
  const navigation = useNavigation();

  function handleSave() {
    submit({ content: getCamelConfigYaml() }, { method: "post" });
  }

  return (
    <div className={`flex items-center gap-1`}>
      <Button
        size="sm"
        onPress={handleSave}
        isPending={navigation.state === "submitting"}
      >
        {navigation.state === "submitting" && <Loader />}
        Save
      </Button>
      <TopologyEditor />
    </div>
  );
};
