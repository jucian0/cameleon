import { ReactFlow, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TopologyLayer } from "../topology-layer/topology-layer";
import dagre, { } from "dagre";
import { edgeTypes, nodeTypes } from "../topology-customs";
import { TopologyZoom } from "../topology-zoom/topology-zoom";
import { TopologyRouteSelector } from "../topology-router-selector/topology-router-selector";
import type { Edge, Node } from "../topology-types";
import { useTopologyStore } from "../topology-store";

const getLayoutedNodes = (nodes: Node[], edges: Edge[]) => {
	const g = new dagre.graphlib.Graph();
	g.setGraph({ rankdir: "TB" });
	g.setDefaultEdgeLabel(() => ({}));

	nodes.forEach((node) => g.setNode(node.id, { width: 150, height: 50 }));
	edges.forEach((edge) => g.setEdge(edge.source, edge.target));

	dagre.layout(g);

	return nodes.map((node) => {
		const { x, y } = g.node(node.id);
		return { ...node, position: { x, y } };
	});
};

const getLayoutedEdges = (nodes: Node[], edges: Edge[]) => {
	const g = new dagre.graphlib.Graph();
	g.setGraph({ rankdir: "TB" });
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

	return (
		<div className="w-full h-[calc(100vh-52px)] relative">
			<ReactFlow
				fitView
				nodes={getLayoutedNodes(nodes, edges)}
				edges={getLayoutedEdges(nodes, edges)}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
			>
				<Background />
				<TopologyZoom position="top-left" />
				<TopologyRouteSelector position="top-right" />
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
