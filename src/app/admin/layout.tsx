import type { Metadata, Viewport } from "next";
import "../fonts.css";
import "../globals.css";

export const metadata: Metadata = {
  title: "FLOSSO — admin",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#1a1a1a" };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="min-h-dvh bg-foam">{children}</body>
    </html>
  );
}
