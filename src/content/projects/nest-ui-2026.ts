import type { Project } from '../types';

export const nestUi2026: Project = {
  id: 'nest-ui-2026',
  title: {
    en: 'NEST UI 2026: Competition Registration Platform',
    id: 'NEST UI 2026: Platform Pendaftaran Kompetisi',
  },
  period: { en: 'Jun 2026 to Sep 2026', id: 'Jun 2026 sampai Sep 2026' },
  role: { en: 'Development lead', id: 'Ketua pengembangan' },
  summary: {
    en: 'The registration platform for a national competition, with multi-step team sign-up and an admin dashboard.',
    id: 'Platform pendaftaran kompetisi nasional, dengan pendaftaran tim bertahap dan dasbor admin.',
  },
  facts: [
    {
      en: 'Multi-step team registration with per-competition team-size rules.',
      id: 'Pendaftaran tim bertahap dengan aturan ukuran tim per kompetisi.',
    },
    {
      en: 'Postgres-enforced duplicate prevention and collision-free registration codes.',
      id: 'Pencegahan duplikasi dan kode pendaftaran bebas tabrakan, dijaga Postgres.',
    },
    {
      en: 'Semifinalist submissions, finalist mode, admin dashboard (verification, export, login lockout), email via Resend.',
      id: 'Pengumpulan semifinalis, mode finalis, dasbor admin (verifikasi, ekspor, kunci login), email via Resend.',
    },
  ],
  tags: ['Next.js', 'Supabase Auth', 'Tailwind CSS', 'Framer Motion', 'Resend'],
  group: 'web',
  links: [],
  media: [],
};
