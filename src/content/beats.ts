import type { Beat, BeatSlug } from './types';

// Portfolio first: `line` is a plain section heading, `label` a small kicker, `facts` the main text.
export const beats: Record<BeatSlug, Beat> = {
  'b0-outside': {
    line: { en: 'Muhammad Fatih Zamzami', id: 'Muhammad Fatih Zamzami' },
    label: { en: 'Portfolio', id: 'Portofolio' },
    facts: [
      {
        en: 'Electrical engineering undergraduate at <strong>Universitas Indonesia</strong>: control systems, full-stack development, industrial automation.',
        id: 'Mahasiswa teknik elektro <strong>Universitas Indonesia</strong>: sistem kendali, pengembangan full-stack, otomasi industri.',
      },
      { en: 'Depok, West Java', id: 'Depok, Jawa Barat' },
    ],
  },
  'b1-approach': {
    line: { en: 'About', id: 'Tentang' },
    label: { en: '01 / About', id: '01 / Tentang' },
    facts: [
      {
        en: 'Works across <strong>control systems, full-stack development and industrial automation</strong>.',
        id: 'Bekerja di <strong>sistem kendali, pengembangan full-stack, dan otomasi industri</strong>.',
      },
      {
        en: 'Has led technical and organisational teams: an 11-member analyst team, a 30-person Scout contingent, and a 3-competition national event.',
        id: 'Pernah memimpin tim teknis dan organisasi: 11 analis, kontingen Pramuka 30 orang, dan acara nasional dengan 3 kompetisi.',
      },
      {
        en: 'Ships real systems: ticketing and registration platforms, a demand-forecasting tool, SCADA monitoring and embedded hardware.',
        id: 'Membangun sistem nyata: platform tiket dan pendaftaran, alat prakiraan permintaan, pemantauan SCADA, dan perangkat tertanam.',
      },
    ],
  },
  'b2-first-fold': {
    line: { en: 'Education', id: 'Pendidikan' },
    label: { en: '02 / Education', id: '02 / Pendidikan' },
    facts: [
      {
        en: '<strong>B.Eng. Electrical Engineering, Universitas Indonesia</strong> (Aug 2024 to present). 4th semester: Circuit Analysis, Signals &amp; Systems, Power Systems, Numerical Methods, Advanced Programming and Algorithm.',
        id: '<strong>S1 Teknik Elektro, Universitas Indonesia</strong> (Agu 2024 sampai sekarang). Semester 4: Analisis Rangkaian, Sinyal &amp; Sistem, Sistem Tenaga, Metode Numerik, Pemrograman Lanjut dan Algoritma.',
      },
    ],
  },
  'b3-scale-flip': {
    line: { en: 'Experience', id: 'Pengalaman' },
    label: { en: '03 / Experience', id: '03 / Pengalaman' },
    facts: [
      {
        en: '<strong>Head of Research and Development, IME FTUI 2026</strong> (Jan 2026 to present). Leads an 11-member analyst team advising 12 divisions; publishes quarterly e-reports to over 150 staff.',
        id: '<strong>Kepala Riset dan Pengembangan, IME FTUI 2026</strong> (Jan 2026 sampai sekarang). Memimpin 11 analis yang menasihati 12 divisi; menerbitkan e-report kuartalan untuk 150+ staf.',
      },
      {
        en: '<strong>Teaching Assistant, Advanced Mathematics 2, FTUI</strong> (Aug 2026 to present). Supports 50 students in transforms and differential equations.',
        id: '<strong>Asisten Dosen, Matematika Teknik 2, FTUI</strong> (Agu 2026 sampai sekarang). Mendampingi 50 mahasiswa dalam transformasi dan persamaan diferensial.',
      },
      {
        en: '<strong>Teaching Assistant, Computational Thinking, FTUI</strong> (Aug 2025 to Jun 2026). Two terms, Python problem solving for all engineering majors.',
        id: '<strong>Asisten Dosen, Computational Thinking, FTUI</strong> (Agu 2025 sampai Jun 2026). Dua periode, pemecahan masalah Python untuk semua jurusan teknik.',
      },
    ],
  },
  'b4-inner-sun': {
    line: { en: 'Experience', id: 'Pengalaman' },
    label: { en: '04 / Experience, continued', id: '04 / Pengalaman, lanjutan' },
    facts: [
      {
        en: '<strong>SCADA &amp; Automation Engineer Intern, PT PGAS Telekomunikasi Nusantara</strong> (Jun to Aug 2026). Automated telemetry and alarm notification across 3 platforms (Wonderware, Reliance, Zabbix) on national gas transmission infrastructure.',
        id: '<strong>Magang Insinyur SCADA &amp; Otomasi, PT PGAS Telekomunikasi Nusantara</strong> (Jun sampai Agu 2026). Mengotomatiskan telemetri dan notifikasi alarm di 3 platform (Wonderware, Reliance, Zabbix) pada infrastruktur transmisi gas nasional.',
      },
      {
        en: '<strong>Software Engineer Team, EXERCISE FTUI 2025</strong> (Feb to Dec 2025). Shipped full-stack websites for clients inside and outside FTUI.',
        id: '<strong>Tim Software Engineer, EXERCISE FTUI 2025</strong> (Feb sampai Des 2025). Merilis situs full-stack untuk klien di dalam dan luar FTUI.',
      },
      {
        en: '<strong>Director of Events, EXERTION UI 2025</strong> (Apr to Sep 2025). Built the first flagship event from the ground up: 3 competitions, over 150 participants, above first-year targets.',
        id: '<strong>Direktur Acara, EXERTION UI 2025</strong> (Apr sampai Sep 2025). Membangun acara unggulan pertama dari nol: 3 kompetisi, 150+ peserta, melampaui target tahun pertama.',
      },
    ],
  },
  'b5-understory': {
    line: { en: 'Projects', id: 'Proyek' },
    label: { en: '05 / Projects', id: '05 / Proyek' },
    facts: [
      {
        en: 'Eight projects across <strong>web platforms, data and ML, and hardware and automation</strong>.',
        id: 'Delapan proyek di <strong>platform web, data dan ML, serta perangkat keras dan otomasi</strong>.',
      },
    ],
  },
  'b6-lantern-vault': {
    line: { en: 'Skills', id: 'Keahlian' },
    label: { en: '06 / Skills', id: '06 / Keahlian' },
    facts: [
      {
        en: '<strong>Programming:</strong> Python, TypeScript, JavaScript, C/C++, MATLAB',
        id: '<strong>Pemrograman:</strong> Python, TypeScript, JavaScript, C/C++, MATLAB',
      },
      {
        en: '<strong>Frameworks &amp; tools:</strong> React, Next.js, FastAPI, Tailwind CSS, Supabase, Git, Docker, Arduino',
        id: '<strong>Framework &amp; alat:</strong> React, Next.js, FastAPI, Tailwind CSS, Supabase, Git, Docker, Arduino',
      },
      {
        en: '<strong>Forecasting &amp; data:</strong> time-series forecasting, rolling-origin backtesting, pandas, REST API design',
        id: '<strong>Prakiraan &amp; data:</strong> prakiraan deret waktu, backtesting rolling-origin, pandas, desain REST API',
      },
      {
        en: '<strong>Languages:</strong> Bahasa Indonesia (native), English (professional)',
        id: '<strong>Bahasa:</strong> Bahasa Indonesia (asli), Inggris (profesional)',
      },
    ],
  },
  'b7-second-fold': {
    line: { en: 'Awards', id: 'Penghargaan' },
    label: { en: '07 / Awards', id: '07 / Penghargaan' },
    facts: [
      {
        en: '<strong>1st Runner-Up</strong>, ProtoTech Competition, The Sandbox 2.0, IEEE ITB Student Branch (2025)',
        id: '<strong>Juara 2</strong>, ProtoTech Competition, The Sandbox 2.0, IEEE ITB Student Branch (2025)',
      },
      {
        en: '<strong>Best Presentation</strong>, ProtoTech Competition, The Sandbox 2.0, IEEE ITB Student Branch (2025)',
        id: '<strong>Presentasi Terbaik</strong>, ProtoTech Competition, The Sandbox 2.0, IEEE ITB Student Branch (2025)',
      },
      {
        en: '<strong>Best BPH</strong>, Research &amp; Development Division, Ikatan Mahasiswa Elektro FTUI (2026)',
        id: '<strong>BPH Terbaik</strong>, Divisi Riset &amp; Pengembangan, Ikatan Mahasiswa Elektro FTUI (2026)',
      },
      {
        en: '<strong>Finalist</strong>, UI Hackathon 2026, Universitas Indonesia (2026)',
        id: '<strong>Finalis</strong>, UI Hackathon 2026, Universitas Indonesia (2026)',
      },
    ],
  },
  'b8-seam': {
    line: { en: 'Leadership', id: 'Kepemimpinan' },
    label: { en: '08 / Leadership', id: '08 / Kepemimpinan' },
    facts: [
      {
        en: '<strong>Contingent Team Leader, 25th World Scout Jamboree, South Korea</strong> (Aug 2023). Led 30 people among 43,000 participants; kept the team together through a heatwave and the evacuation ahead of Typhoon Khanun.',
        id: '<strong>Ketua Kontingen, 25th World Scout Jamboree, Korea Selatan</strong> (Agu 2023). Memimpin 30 orang di antara 43.000 peserta; menjaga tim tetap solid di tengah gelombang panas dan evakuasi sebelum Topan Khanun.',
      },
      {
        en: '<strong>Development lead, NEST UI 2026</strong> (Jun to Sep 2026). Led the build of a national competition registration platform.',
        id: '<strong>Ketua pengembangan, NEST UI 2026</strong> (Jun sampai Sep 2026). Memimpin pembuatan platform pendaftaran kompetisi nasional.',
      },
    ],
  },
  'b9-window': {
    line: { en: 'Contact', id: 'Kontak' },
    label: { en: '09 / Contact', id: '09 / Kontak' },
    facts: [
      {
        en: 'Have a project, a question, or just a hello? Get in touch.',
        id: 'Punya proyek, pertanyaan, atau sekadar sapa? Hubungi saya.',
      },
    ],
  },
};
