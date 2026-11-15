import type { Project } from '../types';

export const otObservabilityLab: Project = {
  id: 'ot-observability-lab',
  title: {
    en: 'OT Observability Lab: Catalog-Driven OT/ICS Monitoring',
    id: 'OT Observability Lab: Pemantauan OT/ICS Berbasis Katalog',
  },
  period: { en: 'Jun 2026 to Aug 2026', id: 'Jun 2026 sampai Agu 2026' },
  role: { en: 'Designer and developer', id: 'Perancang dan pengembang' },
  summary: {
    en: 'A YAML-driven Zabbix provisioning framework for industrial control assets.',
    id: 'Kerangka provisioning Zabbix berbasis YAML untuk aset kendali industri.',
  },
  facts: [
    {
      en: 'Zabbix 7.0 provisioning for 4 asset classes (PLC, HMI, network, gas instrumentation); a Python engine creates hosts, templates, items and triggers via the API.',
      id: 'Provisioning Zabbix 7.0 untuk 4 kelas aset (PLC, HMI, jaringan, instrumentasi gas); mesin Python membuat host, template, item, dan trigger lewat API.',
    },
    {
      en: 'Synthetic SCADA telemetry simulator and a 3-tier asset health model (Good/Underperform/Failed).',
      id: 'Simulator telemetri SCADA sintetis dan model kesehatan aset 3 tingkat (Good/Underperform/Failed).',
    },
    {
      en: 'Correlation-based failure-chain detection across SNMP parameters.',
      id: 'Deteksi rantai kegagalan berbasis korelasi pada parameter SNMP.',
    },
  ],
  tags: ['Zabbix', 'Python', 'SCADA', 'SNMP', 'YAML'],
  group: 'hardware',
  links: [],
  media: [],
};
