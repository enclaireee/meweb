import type { L } from './types';

// Per-scene text, shaped for each beat's own layout. Same facts as beats.ts (which <Plain> reads),
// split into the pieces each scene sets separately. *word* = emphasis.
const l = (en: string, id: string): L => ({ en, id });

export const scenes = {
  b0: {
    first: 'Muhammad Fatih',
    last: 'Zamzami',
    label: l('Depok · Electrical Engineering, UI', 'Depok · Teknik Elektro, UI'),
  },
  b1: {
    sentence: l(
      'I work across *control systems,* *full-stack code* and *industrial automation.* I have led teams of *11* and *30* and a national event of three competitions, and I ship real systems: ticketing, forecasting, *SCADA,* embedded hardware.',
      'Saya bekerja di *sistem kendali,* *kode full-stack,* dan *otomasi industri.* Saya pernah memimpin tim *11* dan *30* orang serta acara nasional tiga kompetisi, dan saya membangun sistem nyata: tiket, prakiraan, *SCADA,* perangkat tertanam.',
    ),
  },
  b2: {
    degree: l('B.Eng. Electrical Engineering', 'S1 Teknik Elektro'),
    school: 'Universitas Indonesia',
    period: l('Aug 2024 to present · 4th semester', 'Agu 2024 sampai sekarang · semester 4'),
    coursesLabel: l('This semester', 'Semester ini'),
    courses: [
      l('Circuit Analysis', 'Analisis Rangkaian'),
      l('Signals & Systems', 'Sinyal & Sistem'),
      l('Power Systems', 'Sistem Tenaga'),
      l('Numerical Methods', 'Metode Numerik'),
      l('Advanced Programming & Algorithms', 'Pemrograman Lanjut & Algoritma'),
    ],
  },
  b3: [
    {
      period: l('Jan 2026 to now', 'Jan 2026 sampai kini'),
      title: l('Head of Research & Development', 'Kepala Riset & Pengembangan'),
      org: 'IME FTUI 2026',
      note: l('11 analysts advising 12 divisions; quarterly e-reports to 150+ staff.', '11 analis menasihati 12 divisi; e-report kuartalan untuk 150+ staf.'),
    },
    {
      period: l('Aug 2026 to now', 'Agu 2026 sampai kini'),
      title: l('Teaching Assistant, Advanced Mathematics 2', 'Asisten Dosen, Matematika Teknik 2'),
      org: 'FTUI',
      note: l('50 students, transforms and differential equations.', '50 mahasiswa, transformasi dan persamaan diferensial.'),
    },
    {
      period: l('Aug 2025 to Jun 2026', 'Agu 2025 sampai Jun 2026'),
      title: l('Teaching Assistant, Computational Thinking', 'Asisten Dosen, Computational Thinking'),
      org: 'FTUI',
      note: l('Two terms of Python problem solving, all engineering majors.', 'Dua periode pemecahan masalah Python, semua jurusan teknik.'),
    },
  ],
  b4: [
    {
      years: '2026',
      role: l('SCADA & Automation Engineer Intern', 'Magang Insinyur SCADA & Otomasi'),
      org: 'PT PGAS Telekomunikasi Nusantara',
      note: l('Telemetry and alarm automation across Wonderware, Reliance and Zabbix, on national gas transmission.', 'Otomasi telemetri dan alarm di Wonderware, Reliance, dan Zabbix, pada transmisi gas nasional.'),
    },
    {
      years: '2025',
      role: l('Director of Events', 'Direktur Acara'),
      org: 'EXERTION UI 2025',
      note: l('First flagship event from zero: 3 competitions, 150+ participants.', 'Acara unggulan pertama dari nol: 3 kompetisi, 150+ peserta.'),
    },
    {
      years: '2025',
      role: l('Software Engineer Team', 'Tim Software Engineer'),
      org: 'EXERCISE FTUI 2025',
      note: l('Full-stack websites for clients inside and outside FTUI.', 'Situs full-stack untuk klien di dalam dan luar FTUI.'),
    },
  ],
  b5: {
    word: l('projects', 'proyek'),
    hint: l('Three ways in. Take the door.', 'Tiga jalan masuk. Lewati pintunya.'),
    cta: l('Enter the projects', 'Masuk ke proyek'),
  },
  b6: [
    { label: l('Programming', 'Pemrograman'), items: 'Python · TypeScript · JavaScript · C/C++ · MATLAB' },
    { label: l('Frameworks & tools', 'Framework & alat'), items: 'React · Next.js · FastAPI · Tailwind · Supabase · Git · Docker · Arduino' },
    { label: l('Forecasting & data', 'Prakiraan & data'), items: l('time-series forecasting · rolling-origin backtesting · pandas · REST APIs', 'prakiraan deret waktu · backtesting rolling-origin · pandas · REST API') },
  ],
  b6Languages: l('Bahasa Indonesia (native) · English (professional)', 'Bahasa Indonesia (asli) · Inggris (profesional)'),
  b7: [
    { title: l('1st Runner-Up', 'Juara 2'), detail: l('ProtoTech Competition, The Sandbox 2.0 · IEEE ITB SB · 2025', 'ProtoTech Competition, The Sandbox 2.0 · IEEE ITB SB · 2025') },
    { title: l('Best Presentation', 'Presentasi Terbaik'), detail: l('ProtoTech Competition, The Sandbox 2.0 · IEEE ITB SB · 2025', 'ProtoTech Competition, The Sandbox 2.0 · IEEE ITB SB · 2025') },
    { title: l('Best BPH', 'BPH Terbaik'), detail: l('R&D Division, Ikatan Mahasiswa Elektro FTUI · 2026', 'Divisi Litbang, Ikatan Mahasiswa Elektro FTUI · 2026') },
    { title: l('Finalist, UI Hackathon', 'Finalis, UI Hackathon'), detail: l('Universitas Indonesia · 2026', 'Universitas Indonesia · 2026') },
  ],
  b8: {
    numbers: [
      { n: '30', unit: l('people I led', 'orang saya pimpin') },
      { n: '43,000', unit: l('participants around us', 'peserta di sekitar kami'), nid: '43.000' },
      { n: '1', unit: l('typhoon, Khanun', 'topan, Khanun') },
    ],
    role: l('Contingent Team Leader', 'Ketua Kontingen'),
    event: l('25th World Scout Jamboree, South Korea · Aug 2023', '25th World Scout Jamboree, Korea Selatan · Agu 2023'),
    story: l('Kept the team together through a heatwave and the evacuation ahead of the typhoon.', 'Menjaga tim tetap solid di tengah gelombang panas dan evakuasi sebelum topan.'),
    also: l('Also: development lead, NEST UI 2026, a national competition registration platform.', 'Juga: ketua pengembangan NEST UI 2026, platform pendaftaran kompetisi nasional.'),
  },
  b9: {
    greeting: l('Dear visitor,', 'Halo,'),
    body: l('Have a project, a question, or just a hello? Write to me. I read everything.', 'Punya proyek, pertanyaan, atau sekadar sapa? Tulis ke saya. Semua saya baca.'),
    signoff: l('Warmly,', 'Salam hangat,'),
    from: 'Fatih',
    place: l('Depok, West Java', 'Depok, Jawa Barat'),
  },
};
