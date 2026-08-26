import { PageHero, SubPage } from "../components/editorial";
import { breadcrumbs, itemList, JsonLd } from "../components/json-ld";
import { WorkShowcase } from "../components/work-showcase";
import { projects } from "../data/projects";
import { absoluteUrl } from "../data/site";

export const metadata = {
  title: "Works | Ariel Jericko Gacilo",
  description: "Browse selected web products, commerce builds, API platforms, and technical project work.",
  alternates: { canonical: "/works" },
};

export default function WorksPage() {
  return (
    <SubPage>
      <JsonLd
        data={[
          breadcrumbs([
            ["Home", "/"],
            ["Works", "/works"],
          ]),
          itemList(
            `${absoluteUrl("/works")}#projects`,
            projects.map((project) => [project.title, `/works/${project.slug}`] as const)
          ),
        ]}
      />

      <PageHero eyebrow="Works" title="Project showcase.">
        Browse selected builds by type, tag, and technology. Open each project for
        a fuller PDP-style view.
      </PageHero>

      <WorkShowcase />
    </SubPage>
  );
}
