import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StoryCard } from "@/components/StoryCard";
import {
  formatDate,
  getPost,
  postIsHistorical,
  posts,
  preparePostContent,
  readingMinutes,
  relatedPosts,
} from "@/lib/posts";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/notes/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      modifiedTime: post.modified,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { html, headings } = preparePostContent(post);
  const related = relatedPosts(post);
  const index = posts.findIndex((candidate) => candidate.id === post.id);
  const newer = index > 0 ? posts[index - 1] : undefined;
  const older = index < posts.length - 1 ? posts[index + 1] : undefined;

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <article className="article-shell">
          <header className="article-header shell-narrow">
            <p className="feature-kicker">
              <span aria-hidden="true" /> {post.section}
            </p>
            <h1>{post.title}</h1>
            <div className="article-byline">
              <span>By Vallard Benincosa</span>
              <span>{formatDate(post.date)}</span>
              <span>{readingMinutes(post)} min read</span>
            </div>
          </header>

          {postIsHistorical(post) && (
            <aside className="historical-note shell-narrow" aria-label="Older article notice">
              <strong>From the archive.</strong> This note was published in {post.date.slice(0, 4)}.
              Technical details may have aged; the original context is preserved.
            </aside>
          )}

          <div className={headings.length >= 3 ? "article-layout shell" : "article-layout shell no-toc"}>
            {headings.length >= 3 && (
              <aside className="table-of-contents" aria-label="On this page">
                <p className="eyebrow">On this page</p>
                <ol>
                  {headings.map((heading) => (
                    <li key={heading.id} className={heading.level === 3 ? "toc-level-three" : undefined}>
                      <a href={`#${heading.id}`}>{heading.label}</a>
                    </li>
                  ))}
                </ol>
              </aside>
            )}
            <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />
          </div>

          <footer className="article-footer shell-narrow">
            <p className="article-tags">
              {post.categories.filter((term) => term.name !== "Uncategorized").map((term) => (
                <a key={term.id} href={`/archive?q=${encodeURIComponent(term.name)}`}>
                  {term.name}
                </a>
              ))}
            </p>
            <div className="post-navigation">
              {older ? (
                <a href={`/notes/${older.slug}`}>
                  <span>Older note</span>
                  {older.title}
                </a>
              ) : <span />}
              {newer && (
                <a href={`/notes/${newer.slug}`}>
                  <span>Newer note</span>
                  {newer.title}
                </a>
              )}
            </div>
          </footer>
        </article>

        <section className="related-section shell" aria-labelledby="related-title">
          <div className="section-heading">
            <h2 id="related-title">Keep reading</h2>
            <span aria-hidden="true" />
          </div>
          <div className="story-grid">
            {related.map((candidate) => (
              <StoryCard key={candidate.id} post={candidate} compact />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
