import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROBIN — Arya's CS workspace",
  description: "A personal computer science learning workspace for Arya.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
