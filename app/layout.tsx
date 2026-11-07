import type { Metadata, Viewport } from "next";
import { Geist_Mono, Instrument_Serif, Space_Grotesk } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { SiteShell } from "@/components/layout/SiteShell";
import { SITE } from "@/lib/constants";
import { HOME_TITLE, OG_IMAGE } from "@/lib/seo";
import "./globals.css";

/**
 * Fonts — change site-wide type here, then map CSS vars in globals.css
 * (--font-display, --font-body, --font-nav) to the new next/font variables.
 */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

/** Display face for big titles — planet names, page headings, wordmark */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: HOME_TITLE,
    template: "%s · Gettysburg Planet Walk",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author, url: `${SITE.url}/about` }],
  creator: SITE.author,
  keywords: [
    "Planet Walk",
    "Gettysburg Planet Walk",
    "Gettysburg College Planet Walk",
    "solar system scale model",
    "solar system walk",
    "Gettysburg College",
    "Hatter Planetarium",
    "Gettysburg College Observatory",
    "Md Nafisul Hasan Sami",
    "Nafis",
    "nuancesbynafis",
  ],
  category: "education",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_US",
    title: HOME_TITLE,
    description: SITE.description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SITE.description,
    images: [OG_IMAGE.url],
  },
  verification: { google: "rUXkAvoaggP7b08ULFt-DSJSbynQqHEwRJz-NNd-Rag" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#03040a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${instrumentSerif.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <AppProviders>
          <SiteShell>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
