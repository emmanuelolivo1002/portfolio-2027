import { Copyright, Heart, Link as LinkIcon, Mail } from "lucide-react";
import { siGithub } from "simple-icons";
import { HeroProjects } from "@/components/hero-projects";
import { ProjectCard } from "@/components/project-card";
import { RichText } from "@/components/rich-text";
import { SiteHeader } from "@/components/site-header";
import { Timeline } from "@/components/timeline";
import { Button } from "@/components/ui/button";
import { portfolio } from "@/content/portfolio";

const heroProjectSlugs = [
  "atlas",
  "searchtexastax",
  "wealthcharts",
  "enjoyspi",
  "verderosa",
  "unfolded-poetry-project",
  "mcallen-education-foundation",
];

function ContactIcon({ name }: { name: string }) {
  const className = "size-4 shrink-0";
  if (name === "email") return <Mail aria-hidden="true" className={className} strokeWidth={2.4} />;
  if (name === "github") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor"><path d={siGithub.path} /></svg>;
  }
  if (name === "linkedIn") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.55 1.55 0 0 0 22 20.45V3.55A1.55 1.55 0 0 0 20.45 2ZM8 19H5V9h3Zm-1.5-11A1.75 1.75 0 1 1 6.5 4.5 1.75 1.75 0 0 1 6.5 8ZM19 19h-3v-5.3c0-1.2-.5-1.9-1.5-1.9s-1.7.7-1.7 1.9V19h-3V9h2.9v1.3A3.5 3.5 0 0 1 15.6 9c2.2 0 3.4 1.4 3.4 3.9Z" />
      </svg>
    );
  }
  return <LinkIcon aria-hidden="true" className={className} />;
}

export default function Home() {
  const { hero, work, experience, about, contact, navigation, sourceLink } = portfolio;
  const heroProjects = heroProjectSlugs.flatMap((slug) => {
    const project = work.projects.find((item) => item.slug === slug);
    if (!project?.thumbnail) return [];
    const { id, title, roles, thumbnail } = project;
    return [{ id, title, roles, thumbnail }];
  });
  const intro = hero.heading.replace(/^Hi! I'm Emmanuel Olivo, a /, "");

  return (
    <>
      <a href="#main" className="sr-only z-[70] rounded-md bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>

      <SiteHeader navigation={navigation} resumeLink={hero.resumeLink} />

      <main id="main" tabIndex={-1} className="overflow-x-clip">
        <div className="site-container">
          <section aria-label="Introduction" className="hero-panel">
            <div aria-hidden="true" className="hero-lights" />
            <div className="hero-copy">
              <h1>Emmanuel<br /><span className="hero-surname">Olivo<span>.</span></span></h1>
              <p className="hero-intro">{intro}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="hero-work-link h-11 rounded-full px-5 text-sm font-semibold sm:px-6">
                  <a href={hero.workLink.href}>{hero.workLink.label}</a>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-full border-primary/35 bg-background/45 px-5 text-sm font-semibold text-foreground hover:border-primary hover:bg-muted sm:px-6">
                  <a href={hero.resumeLink.href} target="_blank" rel="noopener noreferrer">{hero.resumeLink.label}</a>
                </Button>
              </div>
            </div>
            <HeroProjects projects={heroProjects} />
          </section>
        </div>

        <section id="projects" className="site-container section-space">
          <div className="section-intro">
            <h2 className="section-heading">{work.title}</h2>
            <p>{work.subtitle}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:gap-7">
            {work.projects.slice(0, 2).map((project) => <ProjectCard key={project.id} project={project} featured />)}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:mt-7 lg:grid-cols-3 lg:gap-7">
            {work.projects.slice(2).map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        </section>

        <section id="experience" className="border-y border-border bg-background-alt">
          <div className="site-container section-space experience-layout">
            <div className="experience-heading">
              <h2 className="section-heading">{experience.title}</h2>
              <p>{experience.subtitle}</p>
            </div>
            <Timeline jobs={experience.jobs} />
          </div>
        </section>

        <section id="about" aria-labelledby="about-title" className="site-container section-space about-layout">
          <h2 id="about-title" className="section-heading">{about.title}</h2>
          <div className="about-copy">
            <RichText content={about.detail} />
          </div>
        </section>

        <section id="contact" aria-labelledby="contact-title" className="contact-band">
          <div className="site-container contact-layout">
            <div>
              <h2 id="contact-title" className="section-heading">{contact.title}</h2>
              <p className="contact-intro">{contact.subtitle}</p>
            </div>
            <div className="contact-links">
              {contact.links.map(({ label, href }) => {
                const name = ({ email: "Email", linkedIn: "LinkedIn", github: "GitHub" })[label] ?? label;
                return (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="contact-link">
                    <ContactIcon name={label} />
                    {name}
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-5 text-sm text-muted-foreground">
        <div className="site-container flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
          <p className="flex items-center gap-1"><Copyright aria-hidden="true" className="size-4" /> Emmanuel Olivo 2024 – Present</p>
          <p className="flex items-center">
            Made with <Heart aria-label="love" className="mx-1 size-4 fill-red-700 text-red-700" /> and{" "}
            <a href={sourceLink} target="_blank" rel="noopener noreferrer" className="ml-1 underline underline-offset-3 hover:text-foreground">Next.js</a>
          </p>
        </div>
      </footer>
    </>
  );
}
