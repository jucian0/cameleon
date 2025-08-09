import { IconColorSwatch, IconComputer, IconMoon, IconSun } from '@intentui/icons'
import { Menu } from 'components/ui/menu'
import type { Selection } from 'react-aria-components'
import { Theme, useTheme } from 'remix-themes'

export function ThemeMenu() {
  const [theme, setTheme] = useTheme()

  const switchTheme = (theme: Selection) => {
    const nextThemeValue = (theme as Set<string>).values().next().value
    console.log('nextTheme', nextThemeValue)
    if (nextThemeValue === 'system') {
      setTheme(null)
    } else {
      setTheme(nextThemeValue as Theme)
    }
  }

  return (
    <Menu.Submenu>
      <Menu.Item>
        <IconColorSwatch />
        <Menu.Label>Themes</Menu.Label>
      </Menu.Item>
      <Menu.Content onSelectionChange={switchTheme} selectionMode='single' selectedKeys={[theme] as any}>
        <Menu.Item id="system">
          <IconComputer />
          <Menu.Label>System</Menu.Label>
        </Menu.Item>
        <Menu.Item id="dark">
          <IconMoon />
          <Menu.Label>Dark</Menu.Label>
        </Menu.Item>
        <Menu.Item id="light">
          <IconSun />
          <Menu.Label>Light</Menu.Label>
        </Menu.Item>
      </Menu.Content>
    </Menu.Submenu>
  )
}
