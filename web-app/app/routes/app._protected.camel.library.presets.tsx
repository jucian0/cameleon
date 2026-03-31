import { redirect, type LoaderFunctionArgs } from "react-router";

export function meta() {
  return [
    { title: "Templates | Cameleon" },
    {
      description:
        "Presets were consolidated into workflow templates. Use the template flow to start faster.",
    },
  ];
}

export const handle = {
  breadcrumb: () => "Templates",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const target = query
    ? `/app/camel/workflows/create?mode=template&q=${encodeURIComponent(query)}`
    : "/app/camel/workflows/create?mode=template";

  throw redirect(target);
}

export default function LegacyPresetsRedirect() {
  return null;
}
