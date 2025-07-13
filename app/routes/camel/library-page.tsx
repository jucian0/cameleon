import { Autocomplete, useFilter } from "react-aria-components";
import { Tabs } from "components/ui/tabs";
import { SearchField } from "components/ui/search-field";
import { Outlet, useLocation, useSearchParams } from "react-router";


export default function TopologyLibrary() {
  const { pathname } = useLocation();
  const routeParts = pathname.split("/");
  const currentCamelRoute = pathname.split("/")[routeParts.length - 1];

  const [filter, setFilter] = useSearchParams();
  const { contains } = useFilter({ sensitivity: 'base' });

  function handleQueryChange(value: string) {
    if (value) {
      setFilter({ q: value });
    } else {
      setFilter({});
    }
  }

  return (
    <div className="m-6 flex flex-col gap-4">
      <Autocomplete aria-label="Topology library" filter={contains}>
        <div className="flex items-center gap-2">
          <SearchField
            aria-label="Search by name"
            placeholder="Search"
            className="w-full"
            defaultValue={filter.get('q') || ''}
            onChange={handleQueryChange}
          />
        </div>
        <Tabs aria-label="Camel EIPs and Components" selectedKey={currentCamelRoute}>
          <Tabs.List>
            <Tabs.Tab id="eips" href="/camel/library/eips" routerOptions={{
              replace: true,
              state: { scrollToTop: true }
            }}>EIPs</Tabs.Tab>
            <Tabs.Tab id="components" href="/camel/library/components" routerOptions={{
              replace: true,
              state: { scrollToTop: true }
            }}>Components</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="eips">
          </Tabs.Panel>
          <Tabs.Panel id={currentCamelRoute}>
            <Outlet />
          </Tabs.Panel>
        </Tabs>
      </Autocomplete>
    </div>
  );
}