import { Autocomplete, useFilter } from "react-aria-components";
import { Tab, TabList, TabPanel, Tabs } from "components/ui/tabs";
import { SearchField } from "components/ui/search-field";
import { Outlet, useLocation, useSearchParams } from "react-router";
import { PresetIcon } from "components/icons/preset";
import { ProcessorIcon } from "components/icons/processor";
import { ResourcesIcon } from "components/icons/resources";

export const handle = {
  breadcrumb: () => "Topology Library",
};

export default function TopologyLibrary() {
  const { pathname } = useLocation();
  const routeParts = pathname.split("/");
  const currentCamelRoute = pathname.split("/")[routeParts.length - 1];

  const [filter, setFilter] = useSearchParams();
  const { contains } = useFilter({ sensitivity: "base" });

  function handleQueryChange(value: string) {
    if (value) {
      setFilter({ q: value });
    } else {
      setFilter({});
    }
  }

  return (
    <div className="m-6 flex flex-col gap-4">
      <Autocomplete
        aria-label="Topology library"
        filter={contains}
        defaultInputValue={filter.get("q") || ""}
        onInputChange={handleQueryChange}
      >
        <div className="flex items-center gap-2">
          <SearchField
            aria-label="Search by name"
            placeholder="Search"
            className="w-full"
          />
        </div>
        <Tabs
          aria-label="Camel EIPs and Components"
          selectedKey={currentCamelRoute}
        >
          <TabList>
            <Tab
              id="eips"
              href={`/camel-studio/library/eips?${filter.toString()}`}
            >
              <ProcessorIcon />
              EIPs{" "}
            </Tab>
            <Tab
              id="components"
              href={`/camel-studio/library/components?${filter.toString()}`}
            >
              <ResourcesIcon /> Components
            </Tab>
            <Tab
              id="presets"
              href={`/camel-studio/library/presets?${filter.toString()}`}
            >
              <PresetIcon /> Presets
            </Tab>
          </TabList>
          <TabPanel id="eips"></TabPanel>
          <TabPanel id={currentCamelRoute}>
            <Outlet />
          </TabPanel>
        </Tabs>
      </Autocomplete>
    </div>
  );
}
