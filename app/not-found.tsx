import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="not-found shell">
        <p className="issue-number">404</p>
        <p className="feature-kicker"><span aria-hidden="true" /> Misplaced armchair note</p>
        <h1>This page wandered off.</h1>
        <p>The archive is intact. Try searching for what brought you here.</p>
        <a className="read-link" href="/archive#archive-search">Search the archive →</a>
      </main>
      <SiteFooter />
    </>
  );
}
