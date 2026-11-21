"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import type { Experience } from "@/content/portfolio";
import { RichText } from "./rich-text";

export function Timeline({ jobs }: { jobs: Experience[] }) {
  const timeline = useRef<HTMLOListElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: timeline, offset: ["start 78%", "end 57%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <ol ref={timeline} className="relative grid gap-7 border-l border-border pl-6 sm:pl-8">
      <motion.li
        role="presentation" aria-hidden="true"
        className="absolute -left-px top-0 bottom-0 w-px origin-top bg-primary-ink"
        style={{ scaleY: reduceMotion ? 1 : progress }}
      />
      {jobs.map((job) => {
        const years = `${job.startDate.slice(0, 4)} – ${job.endDate?.slice(0, 4) ?? "Present"}`;
        return (
          <li key={job.id} className="relative rounded-xl border border-border bg-card p-5 sm:p-7">
            <span aria-hidden="true" className="absolute -left-[1.55rem] top-7 size-2.5 -translate-x-1/2 rounded-full border border-primary-ink bg-primary sm:-left-[2.05rem]" />
            <p className="text-sm font-semibold text-primary-ink">{years}</p>
            <h3 className="mt-1 font-heading text-xl font-bold tracking-tight sm:text-[1.55rem]">{job.title}</h3>
            <p className="mb-3 text-muted-foreground">{job.company} | {job.location}</p>
            <article className="text-sm sm:text-base">
              <RichText content={job.detail} />
            </article>
          </li>
        );
      })}
    </ol>
  );
}
