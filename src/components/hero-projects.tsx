"use client";

import Image from "next/image";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { PortfolioImage, Project } from "@/content/portfolio";

type HeroProject = Pick<Project, "id" | "title" | "roles"> & { thumbnail: PortfolioImage };

const rotationInterval = 6500;

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
        <div className="aspect-video">
          <Image
            key={project.id}
            src={project.thumbnail.src}
            alt={project.thumbnail.alt || project.title}
            width={project.thumbnail.width}
            height={project.thumbnail.height}
            preload={index === 0}
            sizes="(min-width: 1200px) 560px, (min-width: 768px) 42vw, 80vw"
            className="hero-feature-image h-full w-full rounded-[0.55rem] object-contain"
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
