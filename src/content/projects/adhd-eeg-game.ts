import type { Project } from '../types';

export const adhdEegGame: Project = {
  id: 'adhd-eeg-game',
  title: {
    en: 'Refocusing ADHD: EEG Neuro-Adaptive Video Game',
    id: 'Refocusing ADHD: Gim Neuro-Adaptif Berbasis EEG',
  },
  period: { en: 'Feb 2025 to Apr 2025', id: 'Feb 2025 sampai Apr 2025' },
  role: { en: 'Developer', id: 'Pengembang' },
  summary: {
    en: 'A closed-loop neurofeedback game for non-pharmacological ADHD therapy.',
    id: 'Gim neurofeedback loop tertutup untuk terapi ADHD nonfarmakologis.',
  },
  facts: [
    {
      en: 'Adapts difficulty in real time from the user\'s Low Beta/Theta ratio (NeuroSky Mindwave).',
      id: 'Menyesuaikan kesulitan secara real time dari rasio Low Beta/Theta pengguna (NeuroSky Mindwave).',
    },
    {
      en: 'DB-6 Discrete Wavelet Transform features with a 5-model GMM ensemble for attention-state recognition.',
      id: 'Fitur DB-6 Discrete Wavelet Transform dengan ansambel 5 model GMM untuk mengenali kondisi atensi.',
    },
  ],
  tags: ['Python', 'Godot', 'EEG', 'GMM'],
  group: 'data',
  links: [],
  media: [],
};
