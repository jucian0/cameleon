import { parseDocument, Document, isMap, isSeq } from "yaml";
import type { CamelConfig } from "../camel/topology/topology-types";


export function yamlToJson(yamlString: string): CamelConfig {
	const doc = parseDocument(yamlString);
	const comments: Record<string, string> = {};

	function extractComments(node: any, path: string) {
		if (!node || typeof node !== "object") return;

		if (node.commentBefore) {
			comments[path] = node.commentBefore.trim();
		}
		if (node.comment) {
			comments[`${path}_after`] = node.comment.trim();
		}

		if (isMap(node)) {
			node.items.forEach((item: any) => {
				const key = item.key.source || item.key.value;
				const keyPath = `${path}.${key}`;
				extractComments(item.value, keyPath);
			});
		} else if (isSeq(node)) {
			node.items.forEach((item: any, index: number) => {
				extractComments(item, `${path}.${index}`);
			});
		}
	}

	extractComments(doc.contents, "root");

	return {
		data: doc.toJSON(),
		comments,
	};
}

export function jsonToYaml(jsonWithComments: CamelConfig): string {
	const { data, comments } = jsonWithComments;
	const doc = new Document(data);

	function applyComments(node: any, path: string) {
		if (!node || typeof node !== "object") return;

		if (comments?.[path]) {
			node.commentBefore = comments[path];
		}
		if (comments?.[`${path}_after`]) {
			node.comment = comments[`${path}_after`];
		}

		if (isMap(node)) {
			node.items.forEach((item: any) => {
				const key = item.key.source || item.key.value;
				const keyPath = `${path}.${key}`;
				applyComments(item.value, keyPath);
			});
		} else if (isSeq(node)) {
			node.items.forEach((item: any, index: number) => {
				applyComments(item, `${path}.${index}`);
			});
		}
	}

	applyComments(doc.contents, "root");
	return String(doc);
}
