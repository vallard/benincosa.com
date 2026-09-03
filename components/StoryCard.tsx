import { formatDate, type Post } from "@/lib/posts";

export function StoryCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  return (
    <article className={compact ? "story-card story-card-compact" : "story-card"}>
      <p className="story-meta">
        {post.section} <span aria-hidden="true">·</span> {formatDate(post.date, "short")}
      </p>
      <h3>
        <a href={`/notes/${post.slug}`}>{post.title}</a>
      </h3>
      {!compact && <p className="story-excerpt">{post.excerpt}</p>}
      <a className="read-link" href={`/notes/${post.slug}`} aria-label={`Read ${post.title}`}>
        Read note <span aria-hidden="true">→</span>
      </a>
    </article>
  );
}
