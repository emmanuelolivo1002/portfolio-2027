"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import type { Experience } from "@/content/portfolio";
import { RichText } from "./rich-text";

export function Timeline({ jobs }: { jobs: Experience[] }) {
  const timeline = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: timeline, offset: ["start 78%", "end 57%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div ref={timeline} className="experience-timeline">
      <motion.span
        aria-hidden="true"
        className="experience-progress origin-top bg-primary motion-reduce:transform-none!"
        style={{ scaleY: progress }}
      />
      <ol className="experience-cards" role="list">
        {jobs.map((job) => {
          const years = `${job.startDate.slice(0, 4)} – ${job.endDate?.slice(0, 4) ?? "Present"}`;
          return (
            <li key={job.id} data-scroll-enter="" className="experience-card relative rounded-xl border border-border bg-background p-5 sm:p-7">
              <span aria-hidden="true" className="experience-marker size-2.5 rounded-full bg-primary" />
              <p className="text-sm font-semibold text-primary">{years}</p>
              <h3 className="mt-1 font-heading text-xl font-bold tracking-tight sm:text-[1.55rem]">{job.title}</h3>
              <p className="mb-3 text-muted-foreground">{job.company} | {job.location}</p>
              <article className="text-base">
                <RichText content={job.detail} />
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
