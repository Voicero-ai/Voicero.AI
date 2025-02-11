import type { Metadata } from "next";
import "../../app/globals.css";

export const metadata: Metadata = {
  title: "About - Voicero.AI",
  description: "Learn about our mission to revolutionize search with AI innovation",
};

export default function AboutLayout({
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