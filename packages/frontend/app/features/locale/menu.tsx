import { SUPPORTED_LANGUAGES } from "@/features/locale/server";
import { IconTranslate } from "@intentui/icons";
import { Menu } from "components/ui/menu";
import { useTranslation } from "react-i18next";
import { useSubmit } from "react-router";
import type { Key } from "react-stately";


export function LanguageMenu() {
  const submit = useSubmit();
  const { i18n, t } = useTranslation();
  function handleSelectLanguage(language: Key) {
    submit({ lng: language }, { method: "post", action: "/set-locale" }).then(() => {
      i18n.changeLanguage(language.toString());
    });
  }

  return (
    <Menu.Submenu>
      <Menu.Item>
        <IconTranslate /> {t('language')}
      </Menu.Item>
      <Menu.Content
        selectionMode="single"
        defaultSelectedKeys={[i18n.language]}
        onAction={handleSelectLanguage} items={SUPPORTED_LANGUAGES}>
        {
          language => <Menu.Item
            id={language.code}>
            <Menu.Label><span>{language.icon}</span>{t(language.name)}</Menu.Label>
          </Menu.Item>
        }
      </Menu.Content>
    </Menu.Submenu>
  )
}
