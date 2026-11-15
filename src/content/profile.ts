import type { L } from './types';

export const profile: {
  name: string;
  bio: L;
  location: L;
  contact: { email: string; linkedin: string; github: string; cv: string };
} = {
  name: 'Muhammad Fatih Zamzami',
  bio: {
    en: 'Electrical Engineering undergraduate at Universitas Indonesia, working across control systems, full-stack development and industrial automation, and leading technical and organisational teams.',
    id: 'Mahasiswa Teknik Elektro Universitas Indonesia yang bekerja di sistem kendali, pengembangan full-stack, dan otomasi industri, serta memimpin tim teknis dan organisasi.',
  },
  location: { en: 'Depok, West Java', id: 'Depok, Jawa Barat' },
  // Empty strings are hidden by the UI.
  contact: {
    email: 'muhfatihzamzami@gmail.com',
    linkedin: 'https://www.linkedin.com/in/fatihzamzami/',
    github: 'https://github.com/enclaireee/',
    cv: '/cv.pdf',
  },
};
