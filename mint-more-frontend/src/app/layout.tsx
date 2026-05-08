import type { Metadata } from "next";
import { Inter } from "next/font/google";
// @ts-expect-error -- Next.js global CSS side-effect import
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mint More — Controlled Freelancer Matchmaking",
  description:
    "Connect with the right freelancers through AI-powered controlled matchmaking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}