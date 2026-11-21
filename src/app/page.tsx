import Image from "next/image";
import { Copyright, Heart, Link as LinkIcon, Mail } from "lucide-react";
import { siGithub } from "simple-icons";
import { HeroHeading } from "@/components/hero-heading";
import { ProjectCard } from "@/components/project-card";
import { RichText } from "@/components/rich-text";
import { Timeline } from "@/components/timeline";
import { Button } from "@/components/ui/button";
import { portfolio } from "@/content/portfolio";

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-12 flex flex-col items-center md:mb-20">
      <h2 className="mb-8 text-center text-5xl text-primary md:text-8xl">{title}</h2>
      <p className="max-w-prose text-center text-muted-foreground md:text-xl">{subtitle}</p>
    </div>
  );
}

function ContactIcon({ name }: { name: string }) {
  const className = "size-9 md:size-14";
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

  return (
    <>
      <a href="#main" className="sr-only z-[70] rounded-md bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden justify-center p-2 md:flex">
        <nav aria-label="Main navigation" className="pointer-events-auto rounded-2xl border-2 border-primary bg-background/80 px-6 backdrop-blur">
          <ul className="flex gap-4">
            {navigation.map(({ href, label }) => (
              <li key={href}><a href={href} className="block whitespace-nowrap p-2 hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground">{label}</a></li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main" className="overflow-x-clip">
        <section className="hero-surface relative isolate overflow-hidden rounded-b-3xl border-b border-primary/40">
          <div className="hero-lights" aria-hidden="true"><span /><span /><span /></div>
          <div className="site-container relative flex flex-col justify-center py-10 md:h-screen md:max-h-[600px] lg:max-h-[800px]">
            <div className="mt-6 sm:mt-0 lg:max-w-[75%] xl:max-w-[85%]">
              <h1 className="text-2xl font-bold sm:text-4xl md:text-5xl lg:text-6xl"><HeroHeading heading={hero.heading} /></h1>
              <div className="mt-8 flex flex-col gap-4 sm:gap-8 md:flex-row lg:mt-12">
                <Button asChild className="h-12 w-full rounded-md px-10 text-sm shadow-xl md:w-auto md:text-lg">
                  <a href={hero.workLink.href}>{hero.workLink.label}</a>
                </Button>
                <Button asChild variant="outline" className="h-12 w-full rounded-md border-2 border-primary bg-background px-10 text-sm text-primary shadow-xl hover:bg-primary hover:text-primary-foreground md:w-auto md:text-lg">
                  <a href={hero.resumeLink.href} target="_blank" rel="noopener noreferrer">{hero.resumeLink.label}</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="bg-background py-12 md:py-24 lg:py-36">
          <div className="site-container">
            <SectionHeader title={work.title} subtitle={work.subtitle} />
            <div className="grid gap-14 md:grid-cols-2 xl:grid-cols-3">
              {work.projects.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          </div>
        </section>

        <section id="experience" className="bg-background-alt py-12 md:py-24 lg:py-36">
          <div className="site-container">
            <SectionHeader title={experience.title} subtitle={experience.subtitle} />
            <Timeline jobs={experience.jobs} />
          </div>
        </section>

        <section id="about" className="flex items-center justify-center py-12 lg:min-h-screen">
          <div className="grid w-full items-center lg:site-container lg:grid-cols-[2fr_1fr]">
            <div className="p-6 text-foreground lg:z-10 lg:rounded-xl lg:bg-background-alt lg:p-10 lg:text-lg lg:shadow-xl">
              <h2 className="mb-4 text-center text-5xl text-primary lg:text-left">{about.title}</h2>
              <RichText content={about.detail} />
            </div>
            {about.portrait && (
              <Image
                src={about.portrait.src} alt={about.portrait.alt} width={about.portrait.width} height={about.portrait.height}
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="h-auto w-full grayscale lg:rounded-xl"
              />
            )}
          </div>
        </section>

        <section id="contact" className="flex min-h-screen items-center justify-center">
          <div className="site-container relative translate-y-[60px]">
            <div className="mb-12 flex flex-col items-center lg:mb-16">
              <h2 className="mb-8 text-center text-5xl text-primary sm:text-8xl lg:mb-12 xl:text-9xl">{contact.title}</h2>
              <p className="text-muted-foreground sm:max-w-prose sm:text-center md:text-xl">{contact.subtitle}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {contact.links.map(({ label, href }) => (
                <a
                  key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={({ email: "Email", linkedIn: "LinkedIn", github: "GitHub" })[label] ?? label}
                  className="flex items-center justify-center rounded-full bg-linear-to-br from-background-alt to-primary/10 p-2 text-muted-foreground shadow-lg transition-colors hover:from-primary hover:to-primary hover:text-primary-foreground md:p-6"
                >
                  <ContactIcon name={label} />
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-primary/40 bg-background py-4 text-xs text-muted-foreground lg:text-base">
        <div className="site-container flex flex-col items-center justify-center gap-2 md:flex-row md:justify-between">
          <p className="flex items-center gap-1"><Copyright aria-hidden="true" className="size-4" /> Emmanuel Olivo 2024 - Present</p>
          <p className="flex items-center">
            Made with <Heart aria-label="love" className="mx-1 size-4 fill-red-500 text-red-500" /> and{" "}
            <a href={sourceLink} target="_blank" rel="noopener noreferrer" className="ml-1 underline hover:text-primary">Next.js</a>
          </p>
        </div>
      </footer>
    </>
  );
}
