"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatDate, sectionFromSlug, sections, sectionSlugs, type Section } from "@/lib/post-types";

export type ArchivePost = {
  id: number;
  slug: string;
  title: string;
  date: string;
  section: Section;
  searchText: string;
};

export function ArchiveClient({ posts }: { posts: ArchivePost[] }) {
  const [search, setSearch] = useState("");
  const [sectionSlug, setSectionSlug] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("q") ?? "");
      setSectionSlug(params.get("section") ?? "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const section = sectionFromSlug(sectionSlug);
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return posts.filter(
      (post) =>
        (!section || post.section === section) &&
        (!needle || post.searchText.includes(needle)),
    );
  }, [posts, search, section]);

  const byYear = filtered.reduce((years, post) => {
    const year = post.date.slice(0, 4);
    const yearPosts = years.get(year) ?? [];
    yearPosts.push(post);
    years.set(year, yearPosts);
    return years;
  }, new Map<string, ArchivePost[]>());

  function updateAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (sectionSlug) params.set("section", sectionSlug);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `/archive/?${query}` : "/archive/");
  }

  function clearFilters() {
    setSearch("");
    setSectionSlug("");
    window.history.replaceState(null, "", "/archive/");
  }

  return (
    <>
      <form id="archive-search" className="archive-search" onSubmit={updateAddress}>
        <label htmlFor="q">Search the archive</label>
        <div className="search-row">
          <input
            id="q"
            name="q"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="SSH, Kubernetes, P90X…"
          />
          <select
            name="section"
            aria-label="Filter by section"
            value={sectionSlug}
            onChange={(event) => setSectionSlug(event.target.value)}
          >
            <option value="">All sections</option>
            {sections.map((item) => (
              <option value={sectionSlugs[item]} key={item}>{item}</option>
            ))}
          </select>
          <button type="submit">Search</button>
        </div>
      </form>

      <div className="archive-summary" aria-live="polite">
        <p>
          <strong>{filtered.length}</strong> {filtered.length === 1 ? "note" : "notes"}
          {section ? ` in ${section}` : ""}{search ? ` matching “${search}”` : ""}
        </p>
        {(search || section) && (
          <button className="clear-filters" type="button" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      <div className="archive-years">
        {[...byYear.entries()].map(([year, yearPosts]) => (
          <section key={year} className="archive-year" aria-labelledby={`year-${year}`}>
            <h2 id={`year-${year}`}>{year}</h2>
            <div className="archive-list">
              {yearPosts.map((post) => (
                <article key={post.id}>
                  <p>{formatDate(post.date, "short")}</p>
                  <h3><a href={`/notes/${post.slug}/`}>{post.title}</a></h3>
                  <span>{post.section}</span>
                </article>
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <h2>No notes found.</h2>
            <p>Try a broader search or browse the complete archive.</p>
            <button className="read-link clear-filters" type="button" onClick={clearFilters}>
              View all notes →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
