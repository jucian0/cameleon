import { ReactFlow, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TopologyLayer } from "../topology-layer/topology-layer";
import dagre, { } from "dagre";
import { edgeTypes, nodeTypes } from "../topology-customs";
import { TopologyTools } from "../topology-tools/topology-toolbar";
import type { Edge, Node } from "../topology-types";
import { useTopologyStore } from "../topology-store";

const getLayoutedNodes = (nodes: Node[], edges: Edge[], direction: string) => {
	const g = new dagre.graphlib.Graph();
	g.setGraph({ rankdir: direction });
	g.setDefaultEdgeLabel(() => ({}));

	nodes.forEach((node) => g.setNode(node.id, { width: 150, height: 50 }));
	edges.forEach((edge) => g.setEdge(edge.source, edge.target));

	dagre.layout(g);

	return nodes.map((node) => {
		const { x, y } = g.node(node.id);
		return { ...node, position: { x, y } };
	});
};

const getLayoutedEdges = (nodes: Node[], edges: Edge[], direction: string) => {
	const g = new dagre.graphlib.Graph();
	g.setGraph({ rankdir: direction });
	g.setDefaultEdgeLabel(() => ({}));

	nodes.forEach((node) => g.setNode(node.id, { width: 150, height: 50 }));
	edges.forEach((edge) => g.setEdge(edge.source, edge.target));

	dagre.layout(g);

	return edges.map((edge) => {
		const { x, y } = g.edge(edge.source, edge.target);
		return { ...edge, position: { x, y } };
	});
}


function Flow() {
	const { canvas } = useTopologyStore();
	const { nodes, edges, onNodesChange, onEdgesChange } = canvas;
	const { direction } = canvas

	return (
		<div className="h-[calc(100vh-52px)] relative">
			<ReactFlow
				fitView
				key={canvas.direction}
				nodes={getLayoutedNodes(nodes, edges, direction)}
				edges={getLayoutedEdges(nodes, edges, direction)}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
			>
				<Background />
				<TopologyTools position="top-center" />
			</ReactFlow>
		</div>
	);
}


export function TopologyBuilder() {
	return (
		<>
			<Flow />
			<TopologyLayer />
		</>
	);
}
