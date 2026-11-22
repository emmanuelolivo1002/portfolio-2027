"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { PortfolioImage, Project } from "@/content/portfolio";
import { LoadingImage } from "./loading-image";

type HeroProject = Pick<Project, "id" | "title" | "roles"> & { thumbnail: PortfolioImage };

const rotationInterval = 6500;
const transparentPixel = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>')}`;

export function HeroProjects({ projects }: { projects: HeroProject[] }) {
  const carousel = useRef<HTMLDivElement>(null);
  const inView = useInView(carousel);
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const canRotate = projects.length > 1;

  useEffect(() => {
    if (!canRotate || !inView || reducedMotion || hovered || focused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % projects.length);
    }, rotationInterval);
    return () => window.clearInterval(timer);
  }, [canRotate, focused, hovered, inView, projects.length, reducedMotion]);

  const project = projects[index];
  if (!project) return null;

  return (
    <div
      ref={carousel}
      className="hero-feature"
      role="group"
      aria-label="Featured projects"
      aria-roledescription={canRotate ? "carousel" : undefined}
      tabIndex={canRotate ? 0 : undefined}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div className="hero-feature-frame">
        <div className="relative aspect-video overflow-hidden rounded-[0.55rem]">
          <LoadingImage
            key={project.id}
            src={project.thumbnail.src}
            alt={project.thumbnail.alt || project.title}
            width={project.thumbnail.width}
            height={project.thumbnail.height}
            fetchPriority={index === 0 ? "high" : undefined}
            sizes="(min-width: 1200px) 560px, 42vw"
            sources={<source media="(max-width: 47.99rem)" srcSet={transparentPixel} />}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
      <div className="hero-feature-caption">
        {projects.map(({ id, title, roles }) => (
          <div key={id} className={id === project.id ? undefined : "invisible"} aria-hidden={id !== project.id}>
            <span className="font-semibold text-primary">{title}</span>
            <span className="text-sm">{roles.join(" · ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
