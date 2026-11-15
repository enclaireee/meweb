import type { Project } from '../types';

export const teaterMusikalAkm: Project = {
  id: 'teater-musikal-akm',
  title: {
    en: 'Teater Musikal AKM: Ticketing & Seat Reservation',
    id: 'Teater Musikal AKM: Tiket & Reservasi Kursi',
  },
  period: { en: 'Oct 2026', id: 'Okt 2026' },
  role: { en: 'Full-stack developer', id: 'Pengembang full-stack' },
  summary: {
    en: 'A mobile-first ticketing site with a 750-seat interactive map, where two buyers can never get the same seat.',
    id: 'Situs tiket mobile-first dengan peta 750 kursi interaktif; dua pembeli tak akan pernah mendapat kursi yang sama.',
  },
  facts: [
    {
      en: 'Race-safe checkout in Postgres: atomic 10-minute seat holds, quotas enforced under lock.',
      id: 'Checkout aman dari race condition di Postgres: penahanan kursi 10 menit atomik, kuota dijaga dengan lock.',
    },
    {
      en: '750-seat interactive map, 4 ticket tiers, PDF receipts.',
      id: 'Peta 750 kursi interaktif, 4 kategori tiket, kwitansi PDF.',
    },
    {
      en: 'Admin panel for payment review.',
      id: 'Panel admin untuk peninjauan pembayaran.',
    },
  ],
  tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Postgres'],
  group: 'web',
  links: [],
  media: [],
};
