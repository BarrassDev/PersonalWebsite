import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Listography",
  description: "A quick list-making party game with a 30-second timer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
