import type { Metadata, Viewport } from "next";
import { DM_Mono, Fraunces, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { PageTransition } from "./components/page-transition";
import { SiteHeader } from "./components/site-header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  display: "swap",
});

const siteUrl = "https://www.bokzgacilo.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ariel Jericko Gacilo | Technical Partner for Web, Commerce, and Automation",
  description:
    "Ariel Jericko Gacilo partners with businesses to build web products, Shopify and commerce workflows, API integrations, data automation, and launch-ready systems.",
  keywords: [
    "Ariel Jericko Gacilo",
    "full-stack developer Philippines",
    "freelance web developer",
    "React developer",
    "Next.js developer",
    "Shopify developer",
    "thesis system developer",
    "capstone system developer",
    "web scraping",
    "ETL",
    "Excel work",
    "API development",
  ],
  authors: [{ name: "Ariel Jericko Gacilo" }],
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      "x-default": "/",
    },
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/assets/headshot.jpeg",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Ariel Jericko Gacilo Portfolio",
    title: "Ariel Jericko Gacilo | Technical Partner for Web, Commerce, and Automation",
    description:
      "Technical partner for web products, Shopify and commerce workflows, API integrations, automation, data work, and launch support.",
    url: siteUrl,
    images: [
      {
        url: "/assets/headshot.jpeg",
        width: 800,
        height: 800,
        alt: "Headshot of Ariel Jericko Gacilo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ariel Jericko Gacilo | Technical Partner for Web, Commerce, and Automation",
    description:
      "Partnering with businesses on web products, commerce workflows, API integrations, automation, and launch-ready systems.",
    images: ["/assets/headshot.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f5f0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${dmMono.variable}`}
    >
      <body className="antialiased">
        <SiteHeader />
        <PageTransition>{children}</PageTransition>
        <Analytics />
      </body>
    </html>
  );
}
