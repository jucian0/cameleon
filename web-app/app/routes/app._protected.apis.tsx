import { Outlet } from "react-router";

export const handle = {
  breadcrumb: () => "API Studio",
};

export default function ApiStudioLayout() {
  return <Outlet />;
}
