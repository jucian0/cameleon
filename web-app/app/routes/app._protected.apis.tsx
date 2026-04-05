import { Outlet } from "react-router";

export const handle = {
  breadcrumb: () => "Rest Studio",
};

export default function ApiStudioLayout() {
  return <Outlet />;
}
