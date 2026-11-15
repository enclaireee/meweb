import type { Project } from '../types';

export const demandx: Project = {
  id: 'demandx',
  title: {
    en: 'DemandX: Demand Forecasting & Inventory Decisions',
    id: 'DemandX: Prakiraan Permintaan & Keputusan Stok',
  },
  period: { en: 'Sep 2026', id: 'Sep 2026' },
  role: { en: 'Full-stack and ML engineer', id: 'Engineer full-stack dan ML' },
  summary: {
    en: 'Turns any Indonesian ERP export into forecasts and ranked reorder quantities, measured in rupiah, for mid-market distributors.',
    id: 'Mengubah ekspor ERP Indonesia apa pun menjadi prakiraan dan jumlah pesan ulang berperingkat, dihitung dalam rupiah, untuk distributor menengah.',
  },
  facts: [
    {
      en: 'Schema-agnostic ingestion maps arbitrary Indonesian ERP exports to a canonical model.',
      id: 'Ingesti tanpa skema tetap memetakan ekspor ERP Indonesia apa pun ke model kanonik.',
    },
    {
      en: 'Per-series model selection by ADI/CV² class with rolling-origin backtests (WAPE/MASE): TiRex-2 and TimesFM-3 against Croston, TSB and seasonal baselines.',
      id: 'Pemilihan model per deret menurut kelas ADI/CV² dengan backtest rolling-origin (WAPE/MASE): TiRex-2 dan TimesFM-3 melawan Croston, TSB, dan baseline musiman.',
    },
    {
      en: 'Decision layer: ranked per-branch reorder quantities (safety stock, reorder point, MOQ), quantified in rupiah.',
      id: 'Lapisan keputusan: jumlah pesan ulang per cabang berperingkat (safety stock, reorder point, MOQ), dihitung dalam rupiah.',
    },
  ],
  tags: ['Next.js 16', 'FastAPI', 'Docker', 'Forecasting'],
  group: 'data',
  links: [],
  media: [],
};
