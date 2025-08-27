import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("", "pages/landing/page.tsx"),

  ...prefix("app", [
    route("auth", "pages/app/auth/auth-page.tsx"),
    route("auth/callback", "pages/app/auth/callback-page.ts"),
    layout("pages/app/layout.tsx", [
      index("pages/app/home/home-page.tsx"),
      ...prefix("camel", [
        route("studio", "pages/app/camel/workflows-page/studio-page/page.tsx", {
          id: "workflows-create",
        }),
        route(
          "workflows/:workflowsId/studio",
          "pages/app/camel/workflows-page/studio-page/page.tsx",
          {
            id: "workflow-edit",
          },
        ),
        route("workflows", "pages/app/camel/workflows-page/page.tsx", [
          route(
            "create",
            "pages/app/camel/workflows-page/details-page/page.tsx",
            {
              id: "studio-create",
            },
          ),
          route(
            ":workflowsId/edit",
            "pages/app/camel/workflows-page/details-page/page.tsx",
            {
              id: "studio-edit",
            },
          ),
          route(
            ":workflowsId/clone",
            "pages/app/camel/workflows-page/details-page/page.tsx",
            {
              id: "studio-clone",
            },
          ),
        ]),
        ...prefix("library", [
          layout("pages/app/camel/library-page/layout.tsx", [
            route("eips", "pages/app/camel/library-page/eips-page.tsx"),
            route(
              "components",
              "pages/app/camel/library-page/components-page.tsx",
            ),
            route("presets", "pages/app/camel/library-page/presets-page.tsx"),
          ]),
        ]),
      ]),
      route("set-theme", "pages/app/set-theme/set-theme-page.ts"),
    ]),
  ]),
] satisfies RouteConfig;
