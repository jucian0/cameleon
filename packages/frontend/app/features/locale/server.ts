import en from "../../../public/locales/en/translation.json";
import pt from "../../../public/locales/pt/translation.json";
import { initReactI18next } from "react-i18next";
import { createCookie, redirect, type ActionFunctionArgs } from "react-router";
import { unstable_createI18nextMiddleware } from "remix-i18next/middleware";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: 'language.en', icon: "🇺🇸 " },
  { code: "pt", name: "language.pt", icon: "🇧🇷 " },
  { code: "es", name: "language.es", icon: "🇪🇸 " },
]

export const localeCookie = createCookie("lng", {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  maxAge: 34560000,
});

export const [i18nextMiddleware, getLocale, getInstance] =
  unstable_createI18nextMiddleware({
    detection: {
      supportedLanguages: SUPPORTED_LANGUAGES.map((lang) => lang.code),
      order: ["cookie", "searchParams", "header"],
      fallbackLanguage: "en",
      cookie: localeCookie,
      searchParamKey: "lng",
    },
    i18next: {
      resources: { "en": { translation: en }, "pt": { translation: pt } },
    },
    plugins: [initReactI18next],
  });

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const lng = formData.get("lng") as string;
  const returnTo = request.headers.get("referer");

  if (!lng) {
    throw new Response("Bad Request", { status: 400 });
  }

  console.log("Setting language to", lng);
  return redirect(returnTo || "/", {
    headers: {
      'set-cookie': await localeCookie.serialize(lng),
    }
  });
}
