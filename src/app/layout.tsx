import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zakatplanner.com"),
  title: {
    default: "ZakatPlanner — Free Zakat Calculator & Hawl Tracker",
    template: "%s | ZakatPlanner",
  },
  description:
    "Calculate your Zakat, track your Hawl (Islamic lunar year), monitor Nisab thresholds, and manage Zakat distributions. Free online Zakat planner based on Islamic Shariah.",
  keywords: [
    "zakat calculator",
    "zakat planner",
    "hawl tracker",
    "nisab calculator",
    "zakat tracker",
    "islamic finance",
    "zakat obligation",
    "zakat on gold",
    "zakat on savings",
    "zakat distribution",
    "hijri calendar zakat",
  ],
  openGraph: {
    title: "ZakatPlanner — Free Zakat Calculator & Hawl Tracker",
    description:
      "Calculate Zakat, track Hawl, monitor Nisab, and manage distributions. Free online Zakat planner based on Islamic Shariah.",
    url: "https://zakatplanner.com",
    siteName: "ZakatPlanner",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZakatPlanner — Free Zakat Calculator & Hawl Tracker",
    description:
      "Calculate Zakat, track Hawl, monitor Nisab, and manage distributions. Free Zakat planner based on Islamic Shariah.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://zakatplanner.com",
  },
  verification: {
    google: "google843172f5d7b9fc12",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
