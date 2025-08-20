import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("auth", "pages/auth/auth-page.tsx"),
  route("auth/callback", "pages/auth/callback-page.ts"),
  layout("pages/layout.tsx", [
    index("pages/home/home-page.tsx"),
    ...prefix("camel", [
      route("studio", "pages/camel/workflows-page/studio-page/page.tsx", {
        id: "workflows-create",
      }),
      route(
        "workflows/:workflowsId/studio",
        "pages/camel/workflows-page/studio-page/page.tsx",
        {
          id: "workflow-edit",
        },
      ),
      route("workflows", "pages/camel/workflows-page/page.tsx", [
        route("create", "pages/camel/workflows-page/details-page/page.tsx", {
          id: "studio-create",
        }),
        route(
          ":workflowsId/edit",
          "pages/camel/workflows-page/details-page/page.tsx",
          {
            id: "studio-edit",
          },
        ),
      ]),
      ...prefix("library", [
        layout("pages/camel/library-page/layout.tsx", [
          route("eips", "pages/camel/library-page/eips-page.tsx"),
          route("components", "pages/camel/library-page/components-page.tsx"),
          route("presets", "pages/camel/library-page/presets-page.tsx"),
        ]),
      ]),
    ]),
    route("set-theme", "pages/set-theme/set-theme-page.ts"),
  ]),
] satisfies RouteConfig;
