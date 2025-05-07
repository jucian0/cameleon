import { type HandleProps, Position, Handle } from "@xyflow/react";
import { Button } from "components/ui/button";
import { PlusIcon } from "lucide-react";
import React from "react";

const Base = React.forwardRef<HTMLDivElement, HandleProps>(({ children, ...props }, ref) => {
	return (
		<Handle
			ref={ref}
			{...props}
			className={
				"h-[11px] w-[11px] rounded-full border border-primary bg-primary transition dark:border-primary dark:bg-primary"
			}
		>
			{children}
		</Handle>
	);
});

export const BaseHandle = (props: HandleProps) => {
	return (
		<Base {...props} style={{ background: "transparent", border: "none" }}>
			<div className="-left-0 -top-0 absolute h-[6px] w-[6px] rounded-full border border-primary bg-primary transition dark:border-primary dark:bg-primary" />
		</Base>
	);
};

const wrapperClassNames: Record<Position, string> = {
	[Position.Top]: "left-1/2 -translate-x-1/2",
	[Position.Bottom]: "left-1/2 -translate-x-1/2 translate-y-[10px]",
	[Position.Left]: "top-1/2 -translate-y-1/2 -translate-x-[10px]",
	[Position.Right]: "top-1/2 -translate-y-1/2 translate-x-[10px]",
};

export const AddNodeHandle = ({
	showButton = true,
	position = Position.Bottom,
	children,
	...props
}: HandleProps & { showButton?: boolean }) => {
	const wrapperClassName = wrapperClassNames[position || Position.Bottom];
	const vertical = position === Position.Top || position === Position.Bottom;
	return (
		<Handle
			{...props}
			style={{ background: "transparent", border: "none" }}
			position={position}
			id={props.id}
			{...props}
		>
			<div className={`absolute flex items-center ${wrapperClassName} pointer-events-none`}>
				<div className={`bg-gray-300 ${vertical ? "w-[1px] h-0" : "h-[1px] w-0"}`} />
				<div className="nodrag nopan pointer-events-auto">
					<Button size="extra-small" intent="outline" className="h-8 rounded-full flex items-center justify-center">
						<PlusIcon size={14} /> {children}
					</Button>
				</div>
			</div>
		</Handle>
	);
};
