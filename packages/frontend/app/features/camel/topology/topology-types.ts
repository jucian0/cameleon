import * as RFLow from "@xyflow/react";

export type Node = RFLow.Node & {
	readonly data: {
		type: string;
		stepType: string;
		absolutePath: string;
		iconName: string;
		operation: "add-step" | "add-step-between" | "read"
		label: string;
	};
};
export type Edge = RFLow.Edge;
export type NodeType = 'add-step' | 'camel-step'

export type EPIDefinition = {
	name: string;
	title: string;
	description: string;
	iconUrl: string;
	properties: Readonly<Record<string, PropertyDefinition>>;
};

export type PropertyDefinition = {
	title: string;
	description: string;
	type: "boolean" | "string" | "number";
	defaultValue?: boolean | number | string;
	secret: boolean;
	required: boolean;
	group?: string;
	format?: "integer" | "duration";
};

export interface Step {
	readonly [key: string]: any;
}

export type Route = {
	route?: {
		id: string;
		nodePrefixId: string;
		from: {
			id: string;
			uri: string;
			steps?: Step[];
		};
	};
};

export type CamelConfig = {
	data: Route[];
	comments?: Record<string, string>;
}

export type StepType = "choice" | "split" | "join" | "aggregate" | "filter" | "transform" | "custom" | "camel" | "kafka" | "http" | "rest" | "soap" | "wsdl" | "add-step" | "when" | "otherwise" | "doCatch" | "doTry" | "doFinally" | "multicast" | "loadBalance"