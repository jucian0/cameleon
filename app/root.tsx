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
import { themeSessionResolver } from "./routes/set-theme/server";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
  type Theme,
} from "./routes/set-theme/provider";
import { createServerSupabase } from "./modules/supabase/supabase-server";
import { RouterProvider } from "react-aria-components";

export type Loader = typeof loader;
export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  const { supabase } = createServerSupabase(request);
  const currentUser = await supabase.auth.getUser();

  return {
    theme: getTheme(),
    user: currentUser.data.user,
    env: {
      VITE_PUBLIC_SUPABASE_URL: process.env.VITE_PUBLIC_SUPABASE_URL,
      VITE_PUBLIC_SUPABASE_ANON_KEY: process.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
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
