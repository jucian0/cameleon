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
      route("studio", "pages/camel/studio-page.tsx"),
      route("library", "pages/camel/library-page.tsx", [
        // index('routes/camel/library-eips-page.tsx'),
        route("eips", "pages/camel/library-eips-page.tsx"),
        route("components", "pages/camel/library-components-page.tsx"),
        route("presets", "pages/camel/library-presets-page.tsx"),
      ]),
    ]),
    route("set-theme", "pages/set-theme/set-theme-page.ts"),
  ]),
] satisfies RouteConfig;
