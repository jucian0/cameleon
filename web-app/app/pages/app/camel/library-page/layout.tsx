import { Autocomplete, useFilter } from "react-aria-components";
import { Tab, TabList, TabPanel, Tabs } from "app/components/ui/tabs";
import { SearchField } from "app/components/ui/search-field";
import { Outlet, useLocation, useSearchParams } from "react-router";
import { PresetIcon } from "app/components/icons/preset";
import { ProcessorIcon } from "app/components/icons/processor";
import { ResourcesIcon } from "app/components/icons/resources";

const metaData = {
  title: "Topology Library | Cameleon",
  description:
    "Explore the Camel Topology Library, including EIPs and Components.",
};

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
      <div>
        <p className="text-muted-foreground">{metaData.description}</p>
      </div>
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
              href={`/app/camel/library/eips?${filter.toString()}`}
            >
              <ProcessorIcon />
              EIPs{" "}
            </Tab>
            <Tab
              id="components"
              href={`/app/camel/library/components?${filter.toString()}`}
            >
              <ResourcesIcon /> Components
            </Tab>
            <Tab
              id="presets"
              href={`/app/camel/library/presets?${filter.toString()}`}
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
