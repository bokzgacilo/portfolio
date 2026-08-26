import { WorkShowcase } from "../components/work-showcase";

export const metadata = {
  title: "Works | Ariel Jericko Gacilo",
  description: "Browse selected web products, commerce builds, API platforms, and technical project work.",
};

export default function WorksPage() {
  return (
    <main className="subpage works-page">
      <section className="subpage-hero">
        <p className="eyebrow">Works</p>
        <h1>Project showcase.</h1>
        <p>Browse selected builds by type, tag, and technology. Open each project for a fuller PDP-style view.</p>
      </section>

      <WorkShowcase />
    </main>
  );
}
