import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  layout('routes/layout.tsx', [
    index("routes/home/page.tsx"),
    ...prefix('camel', [
      route('studio', 'routes/camel/page.tsx')
    ]),
    route('set-theme', 'routes/set-theme/page.ts'),
  ]),
] satisfies RouteConfig;
