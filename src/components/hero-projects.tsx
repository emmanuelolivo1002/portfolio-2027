"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { PortfolioImage, Project } from "@/content/portfolio";
import { Button } from "./ui/button";

type HeroProject = Pick<Project, "id" | "title" | "roles"> & { thumbnail: PortfolioImage };

const rotationInterval = 6500;
const controlStyle = "size-11 rounded-full border-border bg-background/55";

export function HeroProjects({ projects }: { projects: HeroProject[] }) {
  const carousel = useRef<HTMLDivElement>(null);
  const inView = useInView(carousel);
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const canRotate = projects.length > 1;
  const isPlaying = playing ?? !reducedMotion;

  useEffect(() => {
    if (!canRotate || !inView || !isPlaying || hovered) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % projects.length);
    }, rotationInterval);
    return () => window.clearInterval(timer);
  }, [canRotate, hovered, inView, isPlaying, projects.length]);

  const project = projects[index];
  if (!project) return null;

  function move(offset: number) {
    setPlaying(false);
    setIndex((current) => (current + offset + projects.length) % projects.length);
  }

  return (
    <div
      ref={carousel}
      className="hero-feature"
      role="group"
      aria-label="Featured projects"
      aria-roledescription={canRotate ? "carousel" : undefined}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={(event) => {
        if (event.target.matches(":focus-visible") && !event.currentTarget.contains(event.relatedTarget)) {
          setPlaying(false);
        }
      }}
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
            className="h-full w-full rounded-[0.55rem] object-contain motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
          />
        </div>
      </div>
      <div className="hero-feature-footer">
        <div className="hero-feature-caption" aria-live={canRotate && !isPlaying ? "polite" : "off"} aria-atomic="true">
          {projects.map(({ id, title, roles }) => (
            <div key={id} className={id === project.id ? undefined : "invisible"} aria-hidden={id !== project.id}>
              <span className="font-semibold text-primary">{title}</span>
              <span className="text-sm">{roles.join(" · ")}</span>
            </div>
          ))}
        </div>
        {canRotate && (
          <div className="flex shrink-0 gap-1">
            <Button type="button" variant="outline" size="icon" className={controlStyle} aria-label="Previous project" onClick={() => move(-1)}>
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              type="button" variant="outline" size="icon" className={controlStyle}
              aria-label={isPlaying ? "Pause project rotation" : "Play project rotation"}
              onClick={() => setPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </Button>
            <Button type="button" variant="outline" size="icon" className={controlStyle} aria-label="Next project" onClick={() => move(1)}>
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
