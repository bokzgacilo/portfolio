import { PageHero, SubPage } from "../components/editorial";
import { WorkShowcase } from "../components/work-showcase";

export const metadata = {
  title: "Works | Ariel Jericko Gacilo",
  description: "Browse selected web products, commerce builds, API platforms, and technical project work.",
};

export default function WorksPage() {
  return (
    <SubPage>
      <PageHero eyebrow="Works" title="Project showcase.">
        Browse selected builds by type, tag, and technology. Open each project for
        a fuller PDP-style view.
      </PageHero>

      <WorkShowcase />
    </SubPage>
  );
}
