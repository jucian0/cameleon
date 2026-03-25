import MonacoEditor from "@monaco-editor/react";
import { jsonToYaml, useTopologyStore, yamlToJson } from "core";
import { Sheet } from "app/components/ui/sheet";
import { useTheme } from "remix-themes";
import React from "react";
import debounce from "debounce";
import { withModal } from "app/components/utils/with-modal";
import { useLocation, useOutletContext } from "react-router";

export default withModal(({ isOpen, closeModal }: any) => {
  const { setCamelConfig, camelConfig } = useTopologyStore();
  const theme = useTheme();
  const location = useLocation();
  const { visibility } = useOutletContext<{
    visibility: "public" | "private";
  }>();
  const isPublic = visibility === "public";
  const [debouncedSetCamelConfig] = React.useState(() =>
    debounce(setCamelConfig, 500),
  );

  const onChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      debouncedSetCamelConfig(yamlToJson(newValue));
    }
  };

  function handleClose() {
    closeModal(`${location.pathname.replace("/code", "")}${location.search}`);
  }

  return (
    <Sheet isOpen={isOpen} onOpenChange={handleClose}>
      <Sheet.Content>
        <Sheet.Body className="p-0!">
          <div
            className={`w-full h-full relative rounded-lg py-11 ${isPublic ? "pointer-none" : ""}`}
          >
            <MonacoEditor
              className={`"w-full h-full" ${isPublic ? "pointer-none" : ""}`}
              language="yaml"
              theme={theme[0] === "dark" ? "vs-dark" : "vs-light"}
              defaultValue={jsonToYaml(camelConfig)}
              options={{
                selectOnLineNumbers: true,
                readOnly: isPublic,
              }}
              onChange={onChange}
            />
          </div>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
});
