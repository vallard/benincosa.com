import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="masthead shell">
        <Link className="brand" href="/" aria-label="Benincosa Armchair Notes home">
          <span className="brand-name">BENINCOSA</span>
          <span className="brand-edition">Armchair Notes</span>
        </Link>
        <p className="tagline">
          An old man’s take on tech, systems, and trying to make sense of the world.
        </p>
      </div>
      <nav className="primary-nav" aria-label="Primary navigation">
        <div className="shell nav-inner">
          <a href="/archive?section=technology">Technology</a>
          <a href="/archive?section=society-place">Society &amp; Place</a>
          <a href="/archive?section=life-experiments">Life &amp; Experiments</a>
          <a href="/archive">Archive</a>
          <a href="/about">About</a>
          <a className="nav-search" href="/archive#archive-search">
            <span aria-hidden="true">⌕</span> Search
          </a>
        </div>
      </nav>
    </header>
  );
}
