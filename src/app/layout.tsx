import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoulDocs — Offline-First Collaborative Document Editor",
  description: "A fast, offline-first document editor built with Next.js, TipTap, and Yjs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full w-full overflow-hidden flex flex-col font-sans bg-white dark:bg-zinc-950">
        {children}
      </body>
    </html>
  );
}
