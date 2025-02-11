import type { Metadata } from "next";
import "../../app/globals.css";

export const metadata: Metadata = {
  title: "Demo - Voicero.AI",
  description: "Experience our AI-powered voice and text search demo",
};

export default function DemoLayout({
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