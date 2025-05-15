import { TopologyLibrary } from "./topology-library";
import { Form } from "./topology-form";
import { create } from "zustand";
import type { Node } from "../topology-types";
import { Sheet } from "components/ui/sheet";

export function TopologyLayer() {
	const { node, setNode } = useLayer();
	const isOpen = !!node;

	const onUnSelectedNode = () => {
		setNode();
	};


	return (
		<Sheet isOpen={isOpen} onOpenChange={onUnSelectedNode}>
			<Sheet.Content isDismissable>
				<Sheet.Header>
					<Sheet.Title className="gap-2">
						{/* <img src={iconPath} className="w-6 h-auto" /> */}
						{node?.stepType}
					</Sheet.Title>
				</Sheet.Header>
				<Sheet.Body className="space-y-4 max-w-full w-[500px]">
					{node?.type.includes('add-step') ? <TopologyLibrary /> : <Form />}
				</Sheet.Body>
			</Sheet.Content>
		</Sheet>
	);
}


type LayerStore = {
	node?: Node['data'];
	setNode: (node?: Node['data']) => void;
	getNode: () => Node['data'] | undefined;
};

export const useLayer = create<LayerStore>((set, get) => ({
	node: undefined,
	setNode: (node) => set({ node }),
	getNode: () => get().node,
}));