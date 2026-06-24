import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// Police « belle écriture » réservée aux titres (le reste est en Arial).
const titleFont = Poppins({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "ixtazzking | Parcours NationsGlory White",
  description:
    "Parcours staff et journalisme de ixtazzking sur NationsGlory White.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${titleFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
