import React from "react";
import MonacoEditor from "@monaco-editor/react";
import { yamlToJson } from "@/features/utils/yaml-json";
import { useTopologyStore } from "../topology-store";

export function TopologyEditor() {
	const { getCamelConfigYaml, setCamelConfig } = useTopologyStore();
	const [code, setCode] = React.useState(getCamelConfigYaml());

	const editorDidMount = (editor: any, monaco: any) => {
		editor.focus();
	};

	const onChange = (newValue: string | undefined, e: any) => {
		if (newValue !== undefined) {
			setCode(newValue);
			setCamelConfig(yamlToJson(newValue));
		}
	};

	const options = {
		selectOnLineNumbers: true,
	};

	return (
		<div className="w-full h-full relative border rounded-lg p-3">
			<MonacoEditor
				className="w-full h-full bg-scroll"
				language="yaml"
				theme="vs-light"
				value={code}
				options={options}
				onChange={onChange}
				onMount={editorDidMount}
			/>
		</div>
	);
}
