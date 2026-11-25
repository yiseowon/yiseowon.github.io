export interface NavLink {
  href: string;
  label: string;
  section?: string;
}

export const navLinks: NavLink[] = [
  { href: '/#about', label: 'About', section: 'about' },
  { href: '/#experience', label: 'Experience', section: 'experience' },
  { href: '/#research', label: 'Research', section: 'research' },
  { href: '/#skills', label: 'Skills', section: 'skills' },
  { href: '/projects', label: 'Projects', section: 'projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/#contact', label: 'Contact', section: 'contact' },
];

export function isActivePath(link: NavLink, pathname: string): boolean {
  if (link.href.startsWith('/#')) return false;
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}
