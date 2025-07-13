import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  route('auth', 'routes/auth/auth-page.tsx'),
  route('auth/callback', 'routes/auth/callback-page.ts'),
  layout('routes/layout.tsx', [
    index("routes/home/home-page.tsx"),
    ...prefix('camel', [
      route('studio', 'routes/camel/studio-page.tsx'),
      route('library', 'routes/camel/library-page.tsx', [
        // index('routes/camel/library-eips-page.tsx'),
        route('eips', 'routes/camel/library-eips-page.tsx'),
        route('components', 'routes/camel/library-components-page.tsx'),
      ]),
    ]),
    route('set-theme', 'routes/set-theme/set-theme-page.ts'),
  ]),
] satisfies RouteConfig;
