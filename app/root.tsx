import stylesheet from "@/app.css?url"
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useNavigate, type LinksFunction, type LoaderFunctionArgs } from "react-router"
import { RouterProvider } from "react-aria-components"
import { themeSessionResolver } from "./routes/set-theme/server"
import { PreventFlashOnWrongTheme, ThemeProvider, useTheme } from "./routes/set-theme/provider"


export async function loader({ request, context }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request)

  return {
    theme: getTheme(),
  }
}

export const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesheet }]

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  return (
    <RouterProvider navigate={navigate}>
      <ThemeProvider specifiedTheme={data.theme} themeAction="set-theme">
        <App />
      </ThemeProvider>
    </RouterProvider>
  )
}

function App() {
  const loaderData = useLoaderData<typeof loader>()
  const [theme] = useTheme()

  return (
    <html lang='en' data-theme={theme ?? ""} className={theme ?? ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(loaderData.theme)} />
        <Links />
      </head>
      <body className="font-sans antialiased min-h-svh">
        <ScrollRestoration />
        <Scripts />
        <Outlet />
      </body>
    </html>
  )
}
