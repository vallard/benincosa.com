import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { posts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "About",
  description: "About Vallard Benincosa and Armchair Notes.",
};

export default function AboutPage() {
  const firstYear = posts.at(-1)?.date.slice(0, 4) ?? "2009";
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="about-page shell">
        <header className="page-intro">
          <p className="feature-kicker"><span aria-hidden="true" /> About this place</p>
          <h1>I build systems, raise humans, and write down what I learn.</h1>
        </header>
        <div className="about-grid">
          <div className="about-lead">
            <p>
              I’m Vallard Benincosa. Most of my working life has been spent around software,
              infrastructure, and the people trying to make complicated systems behave.
            </p>
            <p>
              But technology is only one kind of system. This site is also for questions about
              work, cities, housing, fitness, family, and whatever else becomes impossible not
              to think about.
            </p>
          </div>
          <aside className="about-facts">
            <div><strong>{posts.length}</strong><span>published notes</span></div>
            <div><strong>{firstYear}—now</strong><span>an irregular record</span></div>
            <div><strong>Personal</strong><span>opinions, always</span></div>
          </aside>
        </div>
        <section className="about-principles" aria-labelledby="principles-title">
          <p className="eyebrow">A loose editorial policy</p>
          <h2 id="principles-title">Useful, curious, and allowed to change.</h2>
          <ol>
            <li><span>01</span><p>Explain the thing clearly enough that future me can use it.</p></li>
            <li><span>02</span><p>Follow interesting arguments beyond the boundaries of technology.</p></li>
            <li><span>03</span><p>Preserve old writing honestly, even when the commands—or opinions—have aged.</p></li>
          </ol>
        </section>
        <a className="about-archive-link" href="/archive">Start with the archive <span aria-hidden="true">→</span></a>
      </main>
      <SiteFooter />
    </>
  );
}
