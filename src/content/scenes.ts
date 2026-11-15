import type { L } from './types';

// Per-scene text, shaped for each beat's own layout. Same facts as beats.ts (which <Plain> reads),
// split into the pieces each scene sets separately. *word* = emphasis.
const l = (en: string, id: string): L => ({ en, id });

/** One spotlighted role (b3, b4, b8). `nid` = the number written the Indonesian way. `project` = a project id to link. */
export type Stat = { n: string; nid?: string; unit: L };
export type Role = { period: L; now?: boolean; title: L; org: string | L; badge?: L; stats: Stat[]; points: L[]; chips?: string[]; project?: string };

export const scenes = {
  b0: {
    first: 'Muhammad',
    given: 'Fatih',
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
  // Experience, one role at a time (see <Spotlight>): b3 engineering, b4 teaching.
  b3: [
    {
      period: l('Jun to Aug 2026', 'Jun sampai Agu 2026'),
      title: l('SCADA & Automation Engineer Intern', 'Magang Insinyur SCADA & Otomasi'),
      org: 'PT PGAS Telekomunikasi Nusantara',
      stats: [
        { n: '3', unit: l('SCADA & network platforms automated', 'platform SCADA & jaringan diotomasi') },
      ],
      points: [
        l('Automated telemetry collection and alarm notification, improving fault visibility for the control room.', 'Mengotomatiskan pengumpulan telemetri dan notifikasi alarm, memperjelas visibilitas gangguan bagi ruang kendali.'),
        l('Traced the telemetry path from metering stations to the control room: pressure, flow, temperature and alarm thresholds.', 'Menelusuri jalur telemetri dari stasiun meter ke ruang kendali: tekanan, aliran, suhu, dan ambang alarm.'),
      ],
      chips: ['Wonderware', 'Reliance', 'Zabbix', 'Python'],
      project: 'ot-observability-lab',
    },
    {
      period: l('Feb to Dec 2025', 'Feb sampai Des 2025'),
      title: l('Software Engineer', 'Software Engineer'),
      org: 'EXERCISE FTUI 2025',
      stats: [],
      points: [
        l('Built and shipped full-stack websites for clients inside and outside FTUI.', 'Membangun dan merilis situs full-stack untuk klien di dalam dan luar FTUI.'),
        l('Turned client requirements into build specs, then shipped through code review, revisions and deployment handover.', 'Mengubah kebutuhan klien menjadi spesifikasi, lalu merilis lewat code review, revisi, dan serah terima deployment.'),
      ],
      chips: ['React', 'Next.js', 'Node.js', 'Tailwind CSS', 'Git'],
    },
  ] as Role[],
  b4: [
    {
      period: l('Aug 2026 to now', 'Agu 2026 sampai kini'),
      now: true,
      title: l('Teaching Assistant, Advanced Mathematics 2', 'Asisten Dosen, Matematika Teknik 2'),
      org: 'Fakultas Teknik UI',
      stats: [{ n: '50', unit: l('students supported', 'mahasiswa didampingi') }],
      points: [
        l('Laplace, Fourier and z-transforms; ordinary and partial differential equations.', 'Transformasi Laplace, Fourier, dan z; persamaan diferensial biasa dan parsial.'),
        l('Weekly practice sessions, answering student questions and grading assignments.', 'Sesi latihan mingguan, menjawab pertanyaan mahasiswa, dan menilai tugas.'),
      ],
    },
    {
      period: l('Aug 2025 to Jun 2026', 'Agu 2025 sampai Jun 2026'),
      title: l('Teaching Assistant, Computational Thinking', 'Asisten Dosen, Computational Thinking'),
      org: 'Fakultas Teknik UI',
      stats: [
        { n: '2', unit: l('consecutive terms', 'periode berturut-turut') },
        { n: 'All', nid: 'Semua', unit: l('FTUI engineering majors', 'jurusan teknik FTUI') },
      ],
      points: [
        l('Co-delivered weekly lectures with 2 lecturers in a faculty-wide course.', 'Ikut membawakan kuliah mingguan bersama 2 dosen di mata kuliah tingkat fakultas.'),
        l('Mentored Python algorithmic problem solving and graded weekly work with structured feedback.', 'Membimbing pemecahan masalah algoritmik dengan Python dan menilai tugas mingguan dengan umpan balik terstruktur.'),
      ],
      chips: ['Python'],
    },
  ] as Role[],
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
  // Leadership, one role at a time with stamped numbers.
  b8: [
    {
      period: l('Jan 2026 to now', 'Jan 2026 sampai kini'),
      now: true,
      title: l('Head of Research & Development', 'Kepala Riset & Pengembangan'),
      org: 'IME FTUI 2026',
      badge: l('Best BPH 2026', 'BPH Terbaik 2026'),
      stats: [
        { n: '11', unit: l('analysts led', 'analis dipimpin') },
        { n: '12', unit: l('divisions advised', 'divisi dinasihati') },
        { n: '150+', unit: l('staff reached', 'staf dijangkau') },
      ],
      points: [
        l('Quarterly HRE and Gap Analysis e-reports; directs the Blueprint gap-analysis program and presents recommendations to the division heads.', 'E-report HRE dan Gap Analysis kuartalan; memimpin program Blueprint dan memaparkan rekomendasi kepada para kepala divisi.'),
      ],
    },
    {
      period: l('Jun to Sep 2026', 'Jun sampai Sep 2026'),
      title: l('Lead Developer', 'Lead Developer'),
      org: 'NEST UI 2026',
      stats: [
        { n: '200', unit: l('registrants', 'pendaftar') },
        { n: '3', unit: l('national competitions', 'kompetisi nasional') },
        { n: '3', unit: l('stages each', 'tahap per kompetisi') },
      ],
      points: [
        l('Led the registration platform: multi-step team sign-up, semifinal submissions, a finalist mode and an admin dashboard.', 'Memimpin platform pendaftaran: pendaftaran tim bertahap, pengumpulan semifinal, mode finalis, dan dasbor admin.'),
      ],
      chips: ['Next.js', 'Supabase', 'Postgres', 'Resend'],
      project: 'nest-ui-2026',
    },
    {
      period: l('Apr to Sep 2025', 'Apr sampai Sep 2025'),
      title: l('Director of Events', 'Direktur Acara'),
      org: 'EXERTION UI 2025',
      stats: [
        { n: '3', unit: l('competitions built', 'kompetisi dibangun') },
        { n: '150+', unit: l('participants', 'peserta') },
      ],
      points: [
        l('Built the first flagship event from zero, above first-year targets; owned rules, judging and event-day operations.', 'Membangun acara unggulan pertama dari nol, melampaui target tahun pertama; memegang aturan, penjurian, dan operasional hari-H.'),
      ],
    },
    {
      period: l('Aug 2023', 'Agu 2023'),
      title: l('Contingent Team Leader', 'Ketua Kontingen'),
      org: l('25th World Scout Jamboree, South Korea', '25th World Scout Jamboree, Korea Selatan'),
      stats: [
        { n: '30', unit: l('people I led', 'orang saya pimpin') },
        { n: '43,000', nid: '43.000', unit: l('participants around us', 'peserta di sekitar kami') },
        { n: '1', unit: l('typhoon, Khanun', 'topan, Khanun') },
      ],
      points: [
        l('Kept the team together through a heatwave and the evacuation ahead of the typhoon, then moved the contingent to Seoul on short notice.', 'Menjaga tim tetap solid di tengah gelombang panas dan evakuasi sebelum topan, lalu memindahkan kontingen ke Seoul dalam waktu singkat.'),
      ],
    },
  ] as Role[],
  b9: {
    greeting: l('Dear visitor,', 'Halo,'),
    body: l('Have a project, a question, or just a hello? Write to me. I read everything.', 'Punya proyek, pertanyaan, atau sekadar sapa? Tulis ke saya. Semua saya baca.'),
    signoff: l('Warmly,', 'Salam hangat,'),
    from: 'Fatih',
    place: l('Depok, West Java', 'Depok, Jawa Barat'),
  },
};
