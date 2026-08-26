import { PageHero, SubPage } from "../components/editorial";
import { breadcrumbs, itemList, JsonLd } from "../components/json-ld";
import { absoluteUrl } from "../data/site";
import { toolHref, tools } from "./data";
import { ToolIdeaForm } from "./tool-idea-form";
import { ToolsIndex } from "./tools-index";

export const metadata = {
  title: "Free Web Tools | Ariel Jericko Gacilo",
  description:
    "A growing hub of free browser-based and server-backed utilities: image conversion, background removal, data wrangling, text and developer tools. No signup.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <SubPage className="w-[var(--measure-gallery)]">
      <JsonLd
        data={[
          breadcrumbs([
            ["Home", "/"],
            ["Tools", "/tools"],
          ]),
          itemList(
            `${absoluteUrl("/tools")}#tools`,
            tools.map((tool) => [tool.title, toolHref(tool)] as const)
          ),
        ]}
      />

      <PageHero eyebrow={`Tools · ${tools.length} planned`} title="Small tools, no signup.">
        A growing hub of utilities I keep reaching for on client work — image
        conversion, background removal, data wrangling, and text cleanup. Free to
        use, nothing to install.
      </PageHero>

      <ToolsIndex />

      <ToolIdeaForm />
    </SubPage>
  );
}
