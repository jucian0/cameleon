import MonacoEditor from "@monaco-editor/react";
import { jsonToYaml, useTopologyStore, yamlToJson } from "core";
import { Sheet } from "app/components/ui/sheet";
import { useTheme } from "remix-themes";
import React from "react";
import debounce from "debounce";
import { withModal } from "app/components/utils/with-modal";
import type { Route } from "./+types/app.camel.workflows.$workflow.studio.code";
import { useLocation } from "react-router";

export default withModal<Route.ComponentProps>(({
  isOpen,
  closeModal,
}) => {
  const { setCamelConfig, camelConfig } = useTopologyStore();
  const theme = useTheme();
  const location = useLocation()
  const [debouncedSetCamelConfig] = React.useState(() =>
    debounce(setCamelConfig, 500),
  );

  const onChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      debouncedSetCamelConfig(yamlToJson(newValue));
    }
  };

  const options = {
    selectOnLineNumbers: true,
  };

  function handleClose() {
    closeModal(`${location.pathname.replace('/code', '')}${location.search}`);
  }

  return (
    <Sheet isOpen={isOpen} onOpenChange={handleClose}>
      <Sheet.Content>
        <Sheet.Body className="p-0!">
          <div className="w-full h-full relative rounded-lg py-11">
            <MonacoEditor
              className="w-full h-full"
              language="yaml"
              theme={theme[0] === "dark" ? "vs-dark" : "vs-light"}
              defaultValue={jsonToYaml(camelConfig)}
              options={options}
              onChange={onChange}
            />
          </div>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
});
