import stylesheet from "@/root.css?url";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
  useRouteLoaderData,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "react-router";

import { createServerSupabase } from "./modules/supabase/supabase-server";
import { getSupabaseEnv } from "./modules/supabase/supabase-env";
import { RouterProvider } from "react-aria-components";
import { themeSessionResolver } from "./routes/app.set-theme";
import {
  PreventFlashOnWrongTheme,
  Theme,
  ThemeProvider,
  useTheme,
} from "remix-themes";

export type Loader = typeof loader;
export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  const { supabase } = createServerSupabase(request);
  const currentUser = await supabase.auth.getUser();
  const { url, key } = getSupabaseEnv();

  return {
    theme: getTheme(),
    user: currentUser.data.user,
    env: {
      SUPABASE_URL: url,
      SUPABASE_KEY: key,
      ENV: process.env.NODE_ENV,
    },
  };
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

function Providers({ children }: Readonly<React.PropsWithChildren>) {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider
      specifiedTheme={data?.theme as Theme}
      themeAction="/set-theme"
    >
      <Layout>{children}</Layout>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
}

function Layout({ children }: Readonly<React.PropsWithChildren>) {
  const data = useRouteLoaderData<typeof loader>("root");
  const [theme] = useTheme();
  const navigate = useNavigate();

  return (
    <html lang="en" data-theme={theme} className={theme ?? ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className="font-sans antialiased min-h-svh"
        suppressHydrationWarning
      >
        <RouterProvider navigate={navigate}>{children}</RouterProvider>
        <ScrollRestoration />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data?.theme)} />
        <Scripts />
      </body>
    </html>
  );
}
