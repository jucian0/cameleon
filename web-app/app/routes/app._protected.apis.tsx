import { Outlet } from "react-router";

export const handle = {
  breadcrumb: () => "Rest Studio",
};

export default function ApiStudioLayout() {
  return (
    <div className="h-full min-h-0">
      <Outlet />
    </div>
  );
}
