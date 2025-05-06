import React from "react";
import Form, { type IChangeEvent } from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { Button } from "components/ui/button";
import { Sheet } from "components/ui/sheet";

type Props = {
	schema: Record<string, any>;
	initialFormData: Record<string, any>;
	onSubmit?: (formData: Record<string, any>) => void;
};

export function DynamicForm({ schema, initialFormData, onSubmit }: Props) {
	const [formData, setFormData] = React.useState(initialFormData);
	const handleSubmit = ({ formData }: IChangeEvent) => {
		//console.log("Form Data Submitted:", formData);
		if (onSubmit) {
			onSubmit(formData);
		}
	};

	const handleChange = ({ formData }: IChangeEvent) => {
		setFormData(formData);
	};

	return (
		<Form
			schema={schema}
			formData={formData}
			onSubmit={handleSubmit}
			onChange={handleChange}
			//liveValidate={true}
			validator={validator}
		>
			<Sheet.Footer className="flex justify-end -m-2">
				<Sheet.Close>Cancel</Sheet.Close>
				<Button intent="primary" type="submit">
					Save Changes
				</Button>
			</Sheet.Footer>
		</Form>
	);
}
