import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StoryCard } from "@/components/StoryCard";
import {
  featuredNote,
  findPost,
  formatDate,
  posts,
  sections,
  sectionSlugs,
  type Post,
} from "@/lib/posts";

export const metadata: Metadata = {
  title: "Benincosa — Armchair Notes",
  description: "An old man’s take on tech, systems, and trying to make sense of the world.",
};

export default function Home() {
  const selected = [
    findPost("Jetson nano"),
    findPost("P90X - 20 Years Later"),
    findPost("Setting up reverse proxies"),
  ].filter(Boolean) as Post[];
  const recent = selected.length === 3 ? selected : posts.slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="feature shell" aria-labelledby="feature-title">
          <div className="feature-copy">
            <p className="feature-kicker">
              <span aria-hidden="true" /> {featuredNote.section} · {featuredNote.draft ? "Coming next" : formatDate(featuredNote.date, "short")}
            </p>
            <h1 id="feature-title">{featuredNote.title}</h1>
            <p className="feature-deck">
              {featuredNote.excerpt}
            </p>
            {featuredNote.draft ? (
              <p className="feature-status">{featuredNote.status}</p>
            ) : (
              <a className="feature-status" href={`/notes/${featuredNote.slug}/`}>Read the featured note →</a>
            )}
          </div>
          <aside className="feature-aside" aria-label="Issue and author note">
            <p className="issue-number">{featuredNote.issue}</p>
            <p className="issue-description">{featuredNote.description}</p>
            <div className="why-i-write">
              <p className="eyebrow">Why I write</p>
              <p>I build systems, raise humans, and write down what I learn.</p>
            </div>
          </aside>
        </section>

        <section className="recent-section shell" aria-labelledby="recent-title">
          <div className="section-heading">
            <h2 id="recent-title">Recent armchair notes</h2>
            <span aria-hidden="true" />
          </div>
          <div className="story-grid">
            {recent.map((post) => (
              <StoryCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        <section className="archive-feature shell" aria-labelledby="archive-feature-title">
          <div className="archive-label">
            <p className="eyebrow">From the archive</p>
            <p className="archive-number">17 years of notes</p>
          </div>
          <div className="archive-copy">
            <p className="eyebrow">Unix / field-tested oddities</p>
            <h2 id="archive-feature-title">Stupid SSH Tricks</h2>
            <p>
              Tunnels, proxies, jump hosts, and the useful commands that kept working long
              after I forgot why I needed them.
            </p>
          </div>
          <a className="archive-action" href="/archive?q=ssh">
            Browse the SSH notes <span aria-hidden="true">→</span>
          </a>
        </section>

        <section className="browse-sections shell" aria-labelledby="browse-title">
          <div>
            <p className="eyebrow">Browse by subject</p>
            <h2 id="browse-title">One curiosity, several directions.</h2>
          </div>
          <div className="section-links">
            {sections.map((section, index) => {
              const count = posts.filter((post) => post.section === section).length;
              return (
                <a key={section} href={`/archive?section=${sectionSlugs[section]}`}>
                  <span className="section-index">0{index + 1}</span>
                  <span>{section}</span>
                  <span className="section-count">{count} notes</span>
                  <span aria-hidden="true">↗</span>
                </a>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
