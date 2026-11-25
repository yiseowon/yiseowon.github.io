import { getCollection } from 'astro:content';
import { profile } from '../data/profile';
import { skills } from '../data/skills';
import { socials } from '../data/socials';
import type { TerminalData } from '../scripts/terminal';

export async function getTerminalData(): Promise<TerminalData> {
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);

  return {
    name: profile.name,
    role: profile.role,
    tagline: profile.introduction,
    skills,
    projects: projects.map((p) => ({
      slug: p.id,
      title: p.data.title,
      category: p.data.category,
      year: p.data.startDate?.slice(0, 4),
    })),
    socials: {
      email: socials.email,
      github: socials.github.url,
      phone: socials.phone,
    },
  };
}
