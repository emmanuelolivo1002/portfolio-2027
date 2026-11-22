"use client";

import { useEffect } from "react";

export function ScrollEntrances() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const elements = Array.from(document.querySelectorAll("#main [data-scroll-enter]"))
      .filter((element) => element.getBoundingClientRect().top >= window.innerHeight);
    const observer = new IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        target.removeAttribute("data-enter-pending");
        observer.unobserve(target);
      }
    });

    for (const element of elements) {
      element.setAttribute("data-enter-pending", "");
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      for (const element of elements) element.removeAttribute("data-enter-pending");
    };
  }, []);

  return null;
}
