"use client";

import { useSyncExternalStore } from "react";
import type { SiteLink } from "@/content/portfolio";
import { Button } from "./ui/button";

function subscribeToScroll(onScroll: () => void) {
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}

export function SiteHeader({ navigation, resumeLink }: { navigation: SiteLink[]; resumeLink: SiteLink }) {
  const scrolled = useSyncExternalStore(subscribeToScroll, () => window.scrollY > 4, () => false);

  return (
    <header className="site-container site-header" data-scrolled={scrolled}>
      <a href="#top" className="site-wordmark" aria-label="Emmanuel Olivo home">Emmanuel Olivo<span aria-hidden="true">.</span></a>
      <nav aria-label="Main navigation">
        <ul className="site-nav">
          {navigation.map(({ href, label }) => (
            <li key={href}><a href={href}>{label}</a></li>
          ))}
        </ul>
      </nav>
      <Button asChild variant="outline" className="hidden h-10 rounded-full border-border bg-transparent px-5 text-sm font-semibold text-foreground hover:bg-muted md:inline-flex">
        <a href={resumeLink.href} target="_blank" rel="noopener noreferrer">{resumeLink.label}</a>
      </Button>
    </header>
  );
}
