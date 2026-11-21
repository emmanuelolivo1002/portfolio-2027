"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import type { Experience } from "@/content/portfolio";
import { RichText } from "./rich-text";

export function Timeline({ jobs }: { jobs: Experience[] }) {
  const timeline = useRef<HTMLOListElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: timeline, offset: ["start 75%", "end center"] });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <ol ref={timeline} className="relative grid gap-2 py-20">
      <motion.li role="presentation" aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-1 origin-top -translate-x-1/2 rounded-full bg-primary lg:left-1/2" style={{ scaleY: reduceMotion ? 1 : progress }} />
      {jobs.map((job, index) => {
        const left = index % 2 === 0;
        const years = `${job.startDate.slice(0, 4)} - ${job.endDate?.slice(0, 4) ?? "Present"}`;
        return (
          <li key={job.id} className={`relative flex ${left ? "lg:justify-start" : "lg:justify-end"}`}>
            <span aria-hidden="true" className="absolute left-0 top-7 size-6 -translate-x-1/2 rounded-full border-8 border-primary bg-background lg:left-1/2" />
            <div className={`w-full pl-7 pt-7 lg:w-1/2 lg:px-8 ${left ? "lg:text-right" : ""}`}>
              <p className="inline-block rounded-2xl bg-primary px-2 py-1 text-sm font-semibold text-primary-foreground lg:text-base">{years}</p>
              <h3 className="mb-1 mt-2 text-xl font-semibold lg:text-2xl">{job.title}</h3>
              <p className="mb-4 text-muted-foreground lg:text-lg">{job.company} | {job.location}</p>
              <article className="text-left lg:max-w-prose">
                <RichText content={job.detail} />
              </article>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
