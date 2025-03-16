import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Cookie Policy - Voicero.AI",
  description: "Cookie Policy for Voicero.AI's AI chatbot solution for Shopify stores",
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 