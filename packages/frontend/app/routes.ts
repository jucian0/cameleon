import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route('set-theme', 'routes/set-theme.ts'),
  route('set-locale', 'routes/set-locale.ts'),
] satisfies RouteConfig;
