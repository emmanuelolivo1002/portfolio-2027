import type { BlocksContent } from "@strapi/blocks-react-renderer";
import data from "./portfolio.json";

export type SiteLink = { label: string; href: string };

export type PortfolioImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export type Technology = { iconKey: string; label: string };

export type Project = {
  id: number;
  slug: string;
  title: string;
  shortDescription: string;
  thumbnail: PortfolioImage | null;
  roles: string[];
  technologies: Technology[];
  detail: BlocksContent;
  gallery: PortfolioImage[];
  linkToView: string | null;
  linkToCode: string | null;
};

export type Experience = {
  id: number;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  detail: BlocksContent;
};

type Section = { title: string; subtitle: string };

type Portfolio = {
  title: string;
  description: string;
  navigation: SiteLink[];
  sourceLink: string;
  hero: { heading: string; workLink: SiteLink; resumeLink: SiteLink };
  work: Section & { projects: Project[] };
  experience: Section & { jobs: Experience[] };
  about: { title: string; detail: BlocksContent };
  contact: Section & { links: SiteLink[] };
};

export const portfolio = data as Portfolio;
