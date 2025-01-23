import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-brand-lavender-light/20">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-sm text-brand-text-light">
            &copy; {new Date().getFullYear()} Voicero.AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
