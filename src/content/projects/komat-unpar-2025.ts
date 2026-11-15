import type { Project } from '../types';

export const komatUnpar2025: Project = {
  id: 'komat-unpar-2025',
  title: {
    en: 'KOMAT UNPAR 2025: Competition Website',
    id: 'KOMAT UNPAR 2025: Situs Kompetisi',
  },
  period: { en: 'Mar 2025 to Aug 2025', id: 'Mar 2025 sampai Agu 2025' },
  role: { en: 'Full-stack developer', id: 'Pengembang full-stack' },
  summary: {
    en: 'A full-stack site for a nationwide mathematics competition, with registration and payment.',
    id: 'Situs full-stack untuk kompetisi matematika nasional, dengan pendaftaran dan pembayaran.',
  },
  facts: [
    {
      en: 'Fully responsive participant frontend.',
      id: 'Antarmuka peserta yang sepenuhnya responsif.',
    },
    {
      en: 'Admin dashboard with registration and payment systems.',
      id: 'Dasbor admin dengan sistem pendaftaran dan pembayaran.',
    },
    {
      en: 'Deployed on Vercel with continuous delivery from GitHub.',
      id: 'Dideploy di Vercel dengan continuous delivery dari GitHub.',
    },
  ],
  tags: ['Next.js 15', 'Tailwind CSS v4', 'Framer Motion', 'Vercel'],
  group: 'web',
  links: [],
  media: [],
};
