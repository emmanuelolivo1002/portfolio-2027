"use client";

import { Pause, Play } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { PortfolioImage, Project } from "@/content/portfolio";
import { LoadingImage } from "./loading-image";
import { Button } from "./ui/button";

type HeroProject = Pick<Project, "id" | "title" | "roles"> & { thumbnail: PortfolioImage };

const rotationInterval = 6500;
const transparentPixel = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>')}`;

export function HeroProjects({ projects }: { projects: HeroProject[] }) {
  const carousel = useRef<HTMLDivElement>(null);
  const inView = useInView(carousel);
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [rotationPaused, setRotationPaused] = useState(false);
  const canRotate = projects.length > 1;

  useEffect(() => {
    if (!canRotate || !inView || reducedMotion || hovered || rotationPaused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % projects.length);
    }, rotationInterval);
    return () => window.clearInterval(timer);
  }, [canRotate, hovered, inView, projects.length, reducedMotion, rotationPaused]);

  const project = projects[index];
  if (!project) return null;
  const rotationAction = rotationPaused ? "Resume project preview" : "Pause project preview";

  return (
    <div
      ref={carousel}
      className="hero-feature"
      role="group"
      aria-label="Featured projects"
      aria-roledescription={canRotate ? "carousel" : undefined}
      data-preview-paused={rotationPaused || undefined}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={(event) => {
        if (event.target.matches(":focus-visible")) setRotationPaused(true);
      }}
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
        {canRotate && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="col-start-2 row-start-1 size-10 self-center rounded-full motion-reduce:hidden"
            aria-label={rotationAction}
            title={rotationAction}
            onClick={() => setRotationPaused((paused) => !paused)}
          >
            {rotationPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          </Button>
        )}
      </div>
    </div>
  );
}
