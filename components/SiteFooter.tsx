export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <p className="eyebrow">Benincosa / Armchair Notes</p>
          <p className="footer-statement">
            I build systems, raise humans, and write down what I learn.
          </p>
        </div>
        <div className="footer-links" aria-label="Footer navigation">
          <a href="/about">About</a>
          <a href="/archive">Archive</a>
          <a href="/feed.xml">RSS</a>
        </div>
        <p className="footer-fineprint">
          Writing here is personal and does not represent my employer.
          <br />© {new Date().getFullYear()} Vallard Benincosa
        </p>
      </div>
    </footer>
  );
}
