import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: "Voicero.AI - AI-Powered Voice Navigation",
  description:
    "Voicero.AI is an AI-powered voice navigation platform that helps you navigate your website with ease. Join us to experience the Voicero.AI difference.",
  openGraph: {
    title: "Voicero.AI - AI-Powered Voice Navigation",
    description:
      "Voicero.AI is an AI-powered voice navigation platform that helps you navigate your website with ease. Join us to experience the Voicero.AI difference.",
    url: "https://voicero.ai",
    siteName: "Voicero.AI",
    images: [
      {
        url: "https://voicero.ai/logo.png",
        width: 1200,
        height: 630,
        alt: "Voicero.AI Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voicero.AI - AI-Powered Voice Navigation",
    description:
      "Voicero.AI is an AI-powered voice navigation platform that helps you navigate your website with ease. Join us to experience the Voicero.AI difference.",
    images: ["https://voicero.ai/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        {/* Google Tag Manager */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16904549407"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-16904549407');
          `}
        </Script>
      </head>
      <body
        className="bg-white text-brand-text-primary font-sans antialiased"
        suppressHydrationWarning
      >
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
