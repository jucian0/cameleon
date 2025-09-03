import MonacoEditor from "@monaco-editor/react";
import { jsonToYaml, useTopologyStore } from "core";
import { yamlToJson } from "core";
import { Sheet } from "app/components/ui/sheet";
import { Button } from "app/components/ui/button";
import { Code2Icon } from "lucide-react";
import { useTheme } from "remix-themes";
import React from "react";
import debounce from "debounce";

export function TopologyEditor() {
  const { setCamelConfig, camelConfig } = useTopologyStore();
  const theme = useTheme();
  const [debouncedSetCamelConfig] = React.useState(() =>
    debounce(setCamelConfig, 500),
  );

  const editorDidMount = (editor: any, monaco: any) => {
    editor.focus();
  };

  const onChange = (newValue: string | undefined, e: any) => {
    if (newValue !== undefined) {
      debouncedSetCamelConfig(yamlToJson(newValue));
    }
  };

  const options = {
    selectOnLineNumbers: true,
  };

  return (
    <Sheet>
      <Button intent="secondary" size="lg">
        <Code2Icon className="w-4 h-4" />
      </Button>
      <Sheet.Content className="">
        <Sheet.Body className="p-0!">
          <div className="w-full h-full relative rounded-lg py-11">
            <MonacoEditor
              className="w-full h-full"
              language="yaml"
              theme={theme[0] === "dark" ? "vs-dark" : "vs-light"}
              defaultValue={jsonToYaml(camelConfig)}
              options={options}
              onChange={onChange}
              onMount={editorDidMount}
            />
          </div>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
}
