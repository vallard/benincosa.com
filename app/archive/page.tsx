import type { Metadata } from "next";
import { ArchiveClient, type ArchivePost } from "@/components/ArchiveClient";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { posts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Archive",
  description: "Browse every Benincosa armchair note, from 2009 to today.",
};

export default function ArchivePage() {
  const archivePosts: ArchivePost[] = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    date: post.date,
    section: post.section,
    searchText: `${post.title} ${post.excerpt} ${post.categories.map((term) => term.name).join(" ")} ${post.tags.map((term) => term.name).join(" ")}`.toLowerCase(),
  }));

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="archive-page shell">
        <header className="page-intro">
          <p className="feature-kicker"><span aria-hidden="true" /> The complete record</p>
          <h1>Archive</h1>
          <p>Every armchair note since 2009. Search the details or wander by year.</p>
        </header>
        <ArchiveClient posts={archivePosts} />
      </main>
      <SiteFooter />
    </>
  );
}
