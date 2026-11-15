import type { Project } from '../types';

export const solarLightingMonitor: Project = {
  id: 'solar-lighting-monitor',
  title: {
    en: 'Solar-Powered Lighting with Efficiency Monitoring',
    id: 'Lampu Tenaga Surya dengan Pemantauan Efisiensi',
  },
  period: { en: 'May 2026 to Jun 2026', id: 'Mei 2026 sampai Jun 2026' },
  role: { en: 'Designer and builder', id: 'Perancang dan pembuat' },
  summary: {
    en: 'A solar-powered LED lighting system with live power and efficiency readouts. Embedded Systems final project.',
    id: 'Sistem lampu LED tenaga surya dengan tampilan daya dan efisiensi langsung. Proyek akhir Sistem Tertanam.',
  },
  facts: [
    {
      en: 'Photovoltaic panel, Arduino and a 2-sensor array.',
      id: 'Panel fotovoltaik, Arduino, dan susunan 2 sensor.',
    },
    {
      en: 'Real-time power and efficiency from INA219 and LDR sensors, shown on a 0.96" I2C OLED.',
      id: 'Daya dan efisiensi real time dari sensor INA219 dan LDR, tampil di OLED I2C 0,96".',
    },
  ],
  tags: ['Arduino', 'INA219', 'LDR', 'I2C OLED'],
  group: 'hardware',
  links: [],
  media: [],
};
