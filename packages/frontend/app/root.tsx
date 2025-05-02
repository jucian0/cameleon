import stylesheet from "@/app.css?url"
import { themeSessionResolver } from "./features/theme/server"
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useNavigate, type LinksFunction, type LoaderFunctionArgs } from "react-router"
import { PreventFlashOnWrongTheme, ThemeProvider, useTheme } from "./features/theme/provider"
import { RouterProvider } from "react-aria-components"
import { getLocale, i18nextMiddleware } from "./features/locale/server"
import { useChangeLanguage } from "remix-i18next/react"
import { useTranslation } from "react-i18next"

export const unstable_middleware = [i18nextMiddleware];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request)
  let locale = getLocale(context);

  return {
    theme: getTheme(),
    locale,
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
  const { i18n } = useTranslation()
  useChangeLanguage(loaderData.locale);

  return (
    <html lang={loaderData.locale} dir={i18n.dir(i18n.language)} data-theme={theme ?? ""} className={theme ?? ""}>
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
