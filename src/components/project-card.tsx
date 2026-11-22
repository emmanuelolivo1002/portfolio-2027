"use client";

import Image from "next/image";
import { ArrowLeft, ArrowUpRight, CodeXml, Search } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import type { Project } from "@/content/portfolio";
import { cn } from "@/lib/utils";
import { ProjectGallery } from "./project-gallery";
import { RichText } from "./rich-text";
import { TechnologyIcon } from "./technology-icon";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";

function Roles({ roles, className, size = "compact" }: { roles: string[]; className?: string; size?: "compact" | "large" }) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {roles.map((role) => (
        <Badge
          key={role}
          variant="outline"
          className={cn(
            "rounded-full border-border bg-secondary font-medium text-muted-foreground",
            size === "large" ? "h-11 px-3.5 py-0 text-sm" : "h-auto px-2.5 py-1 text-xs",
          )}
        >
          {role}
        </Badge>
      ))}
    </div>
  );
}

function ProjectDetails({ project }: { project: Project }) {
  const container = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ container });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const inlineImages = project.detail.filter((block) => block.type === "image").map(({ image }) => ({
    src: image.url,
    alt: image.alternativeText ?? "",
    width: image.width,
    height: image.height,
    caption: image.caption ?? undefined,
  }));
  const leadImages = project.gallery.length ? project.gallery : project.thumbnail ? [project.thumbnail] : [];
  const images = [...new Map([...leadImages, ...inlineImages].map((image) => [image.src, image])).values()]
    .map((image, index) => ({ ...image, alt: image.alt || `${project.title} screenshot ${index + 1}` }));
  const description = project.detail.filter((block) => block.type !== "image");
  const baseHeadingLevel = description.reduce(
    (level, block) => block.type === "heading" ? Math.min(level, block.level) : level,
    6,
  );
  const subsectionLevels = [4, 5, 6] as const;
  const overview = description.map((block) => block.type === "heading"
    ? { ...block, level: subsectionLevels[Math.min(block.level - baseHeadingLevel, subsectionLevels.length - 1)] }
    : block);

  return (
    <>
      <div className="relative border-b border-border bg-background-alt">
        <div className="site-container flex min-h-16 items-center py-2">
          <DialogClose asChild>
            <Button type="button" variant="ghost" className="h-11 gap-2 px-2.5 text-foreground">
              <ArrowLeft aria-hidden="true" /> Back to projects
            </Button>
          </DialogClose>
        </div>
        {!reducedMotion && (
          <motion.div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary" style={{ scaleX: progress }} />
        )}
      </div>
      <div
        ref={container} tabIndex={0} role="region" aria-label={`${project.title} details`}
        className="overflow-y-auto overscroll-contain focus-visible:-outline-offset-2"
      >
        <div className="site-container pt-7 pb-12 sm:pt-10 sm:pb-16">
          <div className="mb-7 border-b border-border pb-6 sm:mb-9 sm:pb-8">
            <DialogTitle className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">{project.title}</DialogTitle>
            <DialogDescription className="sr-only">{project.shortDescription}</DialogDescription>
            <div className="mt-4 flex flex-col items-start gap-x-6 gap-y-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
              <Roles roles={project.roles} size="large" className="gap-2" />
              {(project.linkToView || project.linkToCode) && (
                <div className="flex flex-wrap gap-2.5">
                  {project.linkToView && (
                    <Button asChild variant="outline" className="h-11 px-3 text-foreground">
                      <a href={project.linkToView} target="_blank" rel="noopener noreferrer">
                        <ArrowUpRight aria-hidden="true" /> Go To Live Project
                      </a>
                    </Button>
                  )}
                  {project.linkToCode && (
                    <Button asChild variant="outline" className="h-11 px-3 text-foreground">
                      <a href={project.linkToCode} target="_blank" rel="noopener noreferrer">
                        <CodeXml aria-hidden="true" /> View Source Code
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className={cn("grid gap-8 lg:gap-12", images.length > 0 && "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]")}>
            <ProjectGallery title={project.title} images={images} />
            <article className="project-overview max-w-[65ch] min-w-0 text-base text-muted-foreground">
              <h3 className="project-section-title mb-4">Overview</h3>
              <RichText content={overview} />
              {project.technologies.length > 0 && (
                <div className="mt-7 border-t border-border pt-6">
                  <h3 className="project-section-title mb-3">Technologies</h3>
                  <ul className="flex flex-wrap gap-2">
                    {project.technologies.map(({ iconKey, label }) => (
                      <li key={label} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
                        <TechnologyIcon name={iconKey} />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          </div>
        </div>
      </div>
    </>
  );
}

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const { title, thumbnail, shortDescription, technologies } = project;

  return (
    <Dialog>
      <Card className={cn("project-card group relative gap-0 overflow-hidden rounded-[1.25rem] border border-border p-0 text-foreground ring-0", featured && "border-t-primary/60")}>
        <div className="relative aspect-video w-full overflow-hidden bg-background-alt">
          {thumbnail && (
            <Image
              src={thumbnail.src} alt={thumbnail.alt || title} width={thumbnail.width} height={thumbnail.height}
              sizes={featured ? "(min-width: 1280px) 610px, (min-width: 640px) 47vw, 94vw" : "(min-width: 1280px) 400px, (min-width: 1024px) 30vw, (min-width: 640px) 47vw, 94vw"}
              className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
            />
          )}
          <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <span className="rounded-full border-2 border-muted-foreground/10 bg-primary p-2 text-primary-foreground shadow-xl">
              <Search size={44} />
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <Roles roles={project.roles} className="gap-1.5" />
          <h3 className={`mt-3 font-heading font-bold tracking-tight ${featured ? "text-3xl" : "text-[1.65rem]"}`}>
            <DialogTrigger asChild>
              <button type="button" className="cursor-pointer text-left after:absolute after:inset-0 after:rounded-lg hover:text-primary hover:underline focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-3 focus-visible:after:outline-primary">
                {title}
              </button>
            </DialogTrigger>
          </h3>
          <p className="mt-2 pb-4 text-sm leading-relaxed text-muted-foreground md:text-base">{shortDescription}</p>
          <div className="mt-auto flex flex-wrap gap-2 text-base text-muted-foreground">
            {technologies.slice(0, 6).map(({ iconKey, label }) => (
              <span key={label} title={label} className="rounded-full border border-border bg-secondary p-1.5">
                <span className="sr-only">{label}</span>
                <TechnologyIcon name={iconKey} />
              </span>
            ))}
          </div>
        </div>
      </Card>
      <DialogContent fullScreen showCloseButton={false} className="grid-rows-[auto_minmax(0,1fr)]">
        <ProjectDetails project={project} />
      </DialogContent>
    </Dialog>
  );
}
