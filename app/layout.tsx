import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vocero.AI - Voice Navigation Assistant",
  description: "AI-powered voice navigation for websites and e-commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-brand-text-primary font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
