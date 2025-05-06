import { TopologyEditor } from "./topology/topology-editor/code-editor";
import React from "react";
import { useTopologyStore } from "./topology/topology-store";
import { Button } from "components/ui/button";
import { Tabs } from "components/ui/tabs";
import { TopologyBuilder } from "./topology/topology-builder/topology-builder";


export function CamelStudio() {
	const { fetchCamelConfig } = useTopologyStore()
	React.useEffect(() => {
		fetchCamelConfig()
	}, [])
	return (
		<>
			{/* <div className="w-2/3 h-16 flex items-start justify-between">
				<p>Do your actions here</p>
				<div className="flex items-start justify-end gap-2">
					<Button intent="primary">Save</Button>
					<Button intent="secondary">Any action</Button>
				</div>
			</div>
			<Tabs aria-label="Recipe App" className={"w-2/3 h-2/3"}>
				<Tabs.List>
					<Tabs.Tab id="topology-builder">Topology Builder</Tabs.Tab>
					<Tabs.Tab id="topology-editor">Topology Editor</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel id="topology-builder"> */}
			<TopologyBuilder />
			{/* </Tabs.Panel>
				<Tabs.Panel id="topology-editor">
					<TopologyEditor />
				</Tabs.Panel>
			</Tabs> */}
		</>
	);
}

