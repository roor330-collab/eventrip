import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/ui/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eventrip - Live the Experience",
  description:
    "Discover and book the ultimate event travel packages. Concerts, sports, festivals - all in one place. Dynamic packaging for unforgettable experiences.",
  keywords:
    "events, concerts, sports, festivals, travel packages, dynamic packaging, event tickets",
  authors: [{ name: "Eventrip Team" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://eventrip.com",
    siteName: "Eventrip",
    title: "Eventrip - Live the Experience",
    description:
      "Discover and book the ultimate event travel packages. Concerts, sports, festivals - all in one place.",
    images: [
      {
        url: "https://eventrip.com/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventrip - Live the Experience",
    description: "Book your next event travel package today",
    images: ["https://eventrip.com/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
