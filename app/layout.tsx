import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://benincosa.com"),
  title: {
    default: "Benincosa — Armchair Notes",
    template: "%s — Benincosa",
  },
  description: "An old man’s take on tech, systems, and trying to make sense of the world.",
  authors: [{ name: "Vallard Benincosa", url: "/about" }],
  creator: "Vallard Benincosa",
  openGraph: {
    type: "website",
    siteName: "Benincosa — Armchair Notes",
    title: "Benincosa — Armchair Notes",
    description: "An old man’s take on tech, systems, and trying to make sense of the world.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Benincosa Armchair Notes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Benincosa — Armchair Notes",
    description: "An old man’s take on tech, systems, and trying to make sense of the world.",
    images: ["/og.png"],
  },
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
