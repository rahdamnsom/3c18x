import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeDo Sync | Advanced Account Orchestration",
  description: "High-performance automated account management and verification suite. Designed for precision and scale.",
  keywords: ["automation", "account management", "verification", "workflow optimization"],
  authors: [{ name: "fear.sh" }],
  robots: "index, follow",
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  "user-scalable": false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
