import type { Metadata } from "next";
import { Cinzel, Crimson_Pro } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "The Veilborn Galaxy · Sector Omega-9",
  description:
    "Interactive 3D star chart of the Veilborn Galaxy — Arcane Survey, chart No. 7 of ∞.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${crimsonPro.variable}`}>
      <body>{children}</body>
    </html>
  );
}
