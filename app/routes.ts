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
    ...prefix("camel-studio", [
      route("configs", "pages/camel/configs-page/configs-page.tsx", [
        route("studio", "pages/camel/configs-page/studio-page.tsx", {
          id: "configs-create",
        }),
        route(":configId/studio", "pages/camel/configs-page/studio-page.tsx", {
          id: "configd-edit",
        }),
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
