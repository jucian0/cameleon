import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  route('auth', 'routes/auth/auth-page.tsx'),
  route('auth/callback', 'routes/auth/callback-page.ts'),
  layout('routes/layout.tsx', [
    index("routes/home/home-page.tsx"),
    ...prefix('camel', [
      route('studio', 'routes/camel/studio-page.tsx')
    ]),
    route('set-theme', 'routes/set-theme/set-theme-page.ts'),
  ]),
] satisfies RouteConfig;
