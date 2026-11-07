import type { Metadata, Viewport } from "next";
import { Geist_Mono, Instrument_Serif, Space_Grotesk } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { SiteShell } from "@/components/layout/SiteShell";
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
  title: {
    default: "Planet Walk",
    template: "%s · Planet Walk",
  },
  description:
    "An interactive 3D solar system journey across Gettysburg College — from the Milky Way to Pluto.",
  authors: [{ name: "Md Nafisul Hasan Sami" }],
  openGraph: {
    type: "website",
    siteName: "Planet Walk",
    title: "Planet Walk",
    description:
      "An interactive 3D solar system journey across Gettysburg College — from the Milky Way to Pluto.",
  },
  twitter: { card: "summary_large_image" },
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
