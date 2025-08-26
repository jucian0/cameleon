import React from "react";
import MonacoEditor from "@monaco-editor/react";
import { useTopologyStore } from "core";
import { yamlToJson } from "core";
import { Sheet } from "app/components/ui/sheet";
import { Button } from "app/components/ui/button";
import { Code2Icon } from "lucide-react";
import { useTheme } from "remix-themes";

export function TopologyEditor() {
  const { getCamelConfigYaml, setCamelConfig } = useTopologyStore();
  const [code, setCode] = React.useState<string | undefined>(
    getCamelConfigYaml(),
  );
  const theme = useTheme();

  const editorDidMount = (editor: any, monaco: any) => {
    editor.focus();
  };

  const onChange = (newValue: string | undefined, e: any) => {
    if (newValue !== undefined) {
      setCamelConfig(yamlToJson(newValue));
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
              //	value={code}
              defaultValue={getCamelConfigYaml()}
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
