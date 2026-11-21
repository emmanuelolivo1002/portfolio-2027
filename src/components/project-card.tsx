"use client";

import Image from "next/image";
import { ArrowUpRight, CodeXml, Search } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import type { Project } from "@/content/portfolio";
import { RichText } from "./rich-text";
import { TechnologyIcon } from "./technology-icon";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";

function Roles({ roles, className = "" }: { roles: string[]; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {roles.map((role) => (
        <Badge key={role} variant="outline" className="h-auto rounded-2xl border-2 border-muted-foreground px-2 py-1 text-xs font-normal text-muted-foreground">
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

  return (
    <>
      {!reducedMotion && <motion.div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left bg-primary" style={{ scaleX: progress }} />}
      <div ref={container} className="overflow-y-auto overscroll-contain px-6">
        <div className="grid gap-6 pb-1 lg:grid-cols-[minmax(0,65ch)_minmax(15rem,1fr)]">
          <Roles roles={project.roles} className="lg:hidden" />
          <article className="min-w-0">
            <RichText content={project.detail} />
          </article>
          <aside className="flex min-w-0 flex-col gap-4 self-start lg:sticky lg:top-0">
            <Roles roles={project.roles} className="hidden lg:flex" />
            {project.technologies.length > 0 && (
              <Card className="grid gap-2 gap-x-5 rounded-xl bg-background-alt p-4 text-muted-foreground ring-0 sm:grid-cols-2 lg:p-6">
                <h3 className="col-span-full mb-2 text-xl">Technologies Used:</h3>
                {project.technologies.map(({ iconKey, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <TechnologyIcon name={iconKey} />
                    {label}
                  </div>
                ))}
              </Card>
            )}
            {project.linkToView && (
              <Button asChild size="lg" variant="outline" className="h-auto min-h-11 w-full rounded-lg px-3 text-primary">
                <a href={project.linkToView} target="_blank" rel="noopener noreferrer">
                  <ArrowUpRight aria-hidden="true" /> Go To Live Project
                </a>
              </Button>
            )}
            {project.linkToCode && (
              <Button asChild size="lg" variant="outline" className="h-auto min-h-11 w-full rounded-lg px-3 text-primary">
                <a href={project.linkToCode} target="_blank" rel="noopener noreferrer">
                  <CodeXml aria-hidden="true" /> View Source Code
                </a>
              </Button>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const { title, thumbnail, shortDescription, technologies } = project;

  return (
    <Dialog>
      <Card className="group relative gap-0 rounded-none bg-transparent p-0 text-foreground ring-0 shadow-none">
        <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg bg-background-alt">
          {thumbnail && (
            <Image
              src={thumbnail.src} alt={thumbnail.alt || title} width={thumbnail.width} height={thumbnail.height}
              sizes="(min-width: 1280px) 410px, (min-width: 768px) 48vw, 92vw"
              className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
            />
          )}
          <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <span className="rounded-full border-2 border-muted-foreground/10 bg-muted p-2 text-primary shadow-xl">
              <Search size={44} />
            </span>
          </div>
        </div>
        <Roles roles={project.roles} />
        <h3 className="mt-4 text-3xl font-semibold text-primary">
          <DialogTrigger asChild>
            <button type="button" className="cursor-pointer text-left after:absolute after:inset-0 after:rounded-lg hover:underline focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-primary">
              {title}
            </button>
          </DialogTrigger>
        </h3>
        <p className="mt-2 text-sm md:text-base xl:text-lg">{shortDescription}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-lg text-muted-foreground">
          {technologies.slice(0, 6).map(({ iconKey, label }) => (
            <span key={label} title={label} className="rounded-full border border-secondary-foreground/20 bg-background-alt p-2">
              <span className="sr-only">{label}</span>
              <TechnologyIcon name={iconKey} />
            </span>
          ))}
        </div>
      </Card>
      <DialogContent className="flex max-h-[90dvh] w-[90vw] max-w-[90vw] flex-col gap-6 overflow-hidden rounded-lg border-border bg-background px-0 py-6 sm:max-w-[90vw] lg:w-[min(76rem,90vw)]">
        <DialogTitle className="px-6 pr-14 text-lg text-primary">{title}</DialogTitle>
        <DialogDescription className="sr-only">{shortDescription}</DialogDescription>
        <ProjectDetails project={project} />
      </DialogContent>
    </Dialog>
  );
}
