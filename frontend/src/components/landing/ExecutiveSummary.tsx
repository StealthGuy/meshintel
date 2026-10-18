import React, { useEffect, useState } from 'react';
import { networkApi } from '../../api/networkApi';

type Language = 'it' | 'en';
type NetworkReport = {
  connectivity?: { nodes?: number; edges?: number; avg_degree?: number };
  distances?: { avg_path_length?: number };
  stats?: { mqtt?: Array<{ label: string; count: number }> };
};
type RoleReport = { total_nodes?: number; mismatched_count?: number };
type RobustnessReport = { summary?: Array<{ strategy: string; nodes_to_50_percent: number; auc: number }> };
type GeoFeature = { id?: string | number; properties?: { id?: string; type?: string; community_id?: string | number } };
type GeoJson = { features?: GeoFeature[] };
type Partition = Map<string, string>;

const copy = {
  it: {
    eyebrow: 'Executive report', title: 'La mesh italiana, oggi',
    nodes: 'Nodi osservati', links: 'Collegamenti', hops: 'Hop medi', mqtt: 'MQTT', mismatches: 'Ruoli da verificare',
    study: 'Cosa emerge dallo studio', topology: 'Una rete ampia e sparsa',
    topologyText: 'Il dataset mostra la dimensione attuale della rete e il numero medio di collegamenti per nodo.',
    communities: 'Comunità riconoscibili', communitiesText: 'Louvain e Leiden individuano gruppi locali nella rete; il loro accordo misura quanto le due partizioni si somigliano.',
    agreement: 'Accordo tra algoritmi', louvain: 'Louvain', leiden: 'Leiden',
    resilience: 'Resilienza ai guasti',
    resilienceText: 'Le barre mostrano la quota di nodi rimossi prima che la componente principale scenda sotto metà della dimensione iniziale.',
    random: 'Guasti casuali', degree: 'Grado più alto', rank: 'PageRank più alto', bridges: 'Betweenness più alta',
    avgLinks: 'Link medi / nodo',
  },
  en: {
    eyebrow: 'Executive report', title: 'The Italian mesh, today',
    nodes: 'Observed nodes', links: 'Links', hops: 'Average hops', mqtt: 'MQTT', mismatches: 'Roles to review',
    study: 'What the study found', topology: 'A large, sparse network',
    topologyText: 'The dataset shows the network’s current size and its average number of links per node.',
    communities: 'Distinct network communities', communitiesText: 'Louvain and Leiden identify local groups in the network; their agreement measures how similar the two partitions are.',
    agreement: 'Algorithm agreement', louvain: 'Louvain', leiden: 'Leiden',
    resilience: 'Resilience to failures',
    resilienceText: 'Bars show the share of nodes removed before the largest component falls below half its initial size.',
    random: 'Random failures', degree: 'Highest degree', rank: 'Highest PageRank', bridges: 'Highest betweenness',
    avgLinks: 'Average links / node',
  },
} satisfies Record<Language, Record<string, string>>;

const fmt = (value: number | undefined, locale: string, digits = 0) =>
  value == null || !Number.isFinite(value)
    ? '—'
    : value.toLocaleString(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits });

const getPartition = (geoJson: GeoJson | null): Partition => {
  const partition = new Map<string, string>();
  for (const feature of geoJson?.features ?? []) {
    const props = feature.properties;
    if (props?.type !== 'node' || props.community_id == null || props.community_id === -1) continue;
    const id = String(feature.id ?? props.id ?? '');
    if (id) partition.set(id, String(props.community_id));
  }
  return partition;
};

const choose2 = (value: number) => value * (value - 1) / 2;

const comparePartitions = (first: Partition, second: Partition) => {
  const ids = [...first.keys()].filter((id) => second.has(id));
  const n = ids.length;
  if (n < 2) return { ari: undefined, nmi: undefined };

  const cells = new Map<string, number>();
  const rows = new Map<string, number>();
  const columns = new Map<string, number>();
  for (const id of ids) {
    const row = first.get(id)!;
    const column = second.get(id)!;
    const key = `${row}\u0000${column}`;
    cells.set(key, (cells.get(key) ?? 0) + 1);
    rows.set(row, (rows.get(row) ?? 0) + 1);
    columns.set(column, (columns.get(column) ?? 0) + 1);
  }

  const sumCells = [...cells.values()].reduce((sum, count) => sum + choose2(count), 0);
  const sumRows = [...rows.values()].reduce((sum, count) => sum + choose2(count), 0);
  const sumColumns = [...columns.values()].reduce((sum, count) => sum + choose2(count), 0);
  const totalPairs = choose2(n);
  const expected = sumRows * sumColumns / totalPairs;
  const maximum = (sumRows + sumColumns) / 2;
  const ari = maximum === expected ? 1 : (sumCells - expected) / (maximum - expected);

  let mutualInformation = 0;
  for (const [key, count] of cells) {
    const [row, column] = key.split('\u0000');
    mutualInformation += count / n * Math.log((count * n) / (rows.get(row)! * columns.get(column)!));
  }
  const entropy = (counts: Map<string, number>) => [...counts.values()].reduce((sum, count) => {
    const probability = count / n;
    return sum - probability * Math.log(probability);
  }, 0);
  const entropySum = entropy(rows) + entropy(columns);
  const nmi = entropySum === 0 ? 1 : 2 * mutualInformation / entropySum;

  return { ari: Math.max(-1, Math.min(1, ari)) * 100, nmi: Math.max(0, Math.min(1, nmi)) * 100 };
};

export const ExecutiveSummary: React.FC<{ language: Language }> = ({ language }) => {
  const t = copy[language];
  const locale = language === 'it' ? 'it-IT' : 'en-GB';
  const [report, setReport] = useState<NetworkReport | null>(null);
  const [roles, setRoles] = useState<RoleReport | null>(null);
  const [robustness, setRobustness] = useState<RobustnessReport | null>(null);
  const [louvainGeoJson, setLouvainGeoJson] = useState<GeoJson | null>(null);
  const [leidenGeoJson, setLeidenGeoJson] = useState<GeoJson | null>(null);

  useEffect(() => {
    let mounted = true;
    networkApi.getReport().then((data: NetworkReport) => { if (mounted) setReport(data); })
      .catch((error) => console.error('Unable to load executive report metrics', error));
    networkApi.getRoleSuggestions().then((data: RoleReport) => { if (mounted) setRoles(data); })
      .catch((error) => console.error('Unable to load role metrics', error));
    networkApi.getRobustness().then((data: RobustnessReport) => { if (mounted) setRobustness(data); })
      .catch((error) => console.error('Unable to load robustness metrics', error));
    networkApi.getGeoJson('louvain').then((data: GeoJson) => { if (mounted) setLouvainGeoJson(data); })
      .catch((error) => console.error('Unable to load Louvain partition', error));
    networkApi.getGeoJson('leiden').then((data: GeoJson) => { if (mounted) setLeidenGeoJson(data); })
      .catch((error) => console.error('Unable to load Leiden partition', error));
    return () => { mounted = false; };
  }, []);

  const mqttCount = report?.stats?.mqtt?.find((item) => ['1', 'true'].includes(item.label.toLowerCase()))?.count;
  const mismatchPct = roles?.total_nodes
    ? (Number(roles.mismatched_count || 0) / roles.total_nodes) * 100
    : undefined;
  const louvainPartition = getPartition(louvainGeoJson);
  const leidenPartition = getPartition(leidenGeoJson);
  const louvainCount = new Set(louvainPartition.values()).size;
  const leidenCount = new Set(leidenPartition.values()).size;
  const agreement = comparePartitions(louvainPartition, leidenPartition);
  const totalNodes = report?.connectivity?.nodes;
  const robustnessMetric = (strategy: string) => {
    const item = robustness?.summary?.find((entry) => entry.strategy.toLowerCase() === strategy.toLowerCase());
    return item && totalNodes ? item.nodes_to_50_percent / totalNodes * 100 : undefined;
  };

  const kpis = [
    { label: t.nodes, value: fmt(report?.connectivity?.nodes, locale) },
    { label: t.links, value: fmt(report?.connectivity?.edges, locale) },
    { label: t.hops, value: fmt(report?.distances?.avg_path_length, locale, 1) },
    ...(mqttCount != null ? [{ label: t.mqtt, value: `${fmt(mqttCount, locale)} ${language === 'it' ? 'nodi' : 'nodes'}` }] : []),
    { label: t.mismatches, value: mismatchPct == null ? '—' : `${fmt(mismatchPct, locale, 1)}%` },
  ];
  const resilience = [
    { label: t.random, value: robustnessMetric('random'), color: '#22c55e' },
    { label: t.degree, value: robustnessMetric('degree'), color: '#f59e0b' },
    { label: t.rank, value: robustnessMetric('pagerank'), color: '#f97316' },
    { label: t.bridges, value: robustnessMetric('betweenness'), color: '#ef4444' },
  ];

  return (
    <section className="border-y border-outline-variant bg-background text-on-background dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <header className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-mono uppercase tracking-[0.2em] text-primary dark:text-blue-400">{t.eyebrow}</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">{t.title}</h2>
        </header>

        <div className={`mb-4 grid grid-cols-2 gap-3 sm:gap-4 ${kpis.length === 5 ? 'sm:grid-cols-3 xl:grid-cols-5' : 'sm:grid-cols-4'}`}>
          {kpis.map((item) => <article key={item.label} className="rounded-xl border border-outline-variant bg-surface p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="text-2xl font-bold tabular-nums sm:text-3xl">{item.value}</div>
            <div className="mt-1 text-xs text-on-surface-variant dark:text-slate-400">{item.label}</div>
          </article>)}
        </div>

        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-2xl font-bold sm:text-3xl">{t.study}</h3>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-outline-variant bg-surface p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900/60">
            <h4 className="text-lg font-semibold">{t.topology}</h4>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">{t.topologyText}</p>
            <div className="mt-5 flex min-w-0 flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/70 sm:flex-row sm:items-center sm:gap-5" role="img" aria-label={`${fmt(report?.connectivity?.nodes, locale)} nodes, ${fmt(report?.connectivity?.edges, locale)} links`}>
              <svg viewBox="0 0 180 110" className="h-24 w-full max-w-44 self-center overflow-visible sm:w-36 sm:shrink-0" aria-hidden="true">
                <g fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 53 52 20 89 62 128 24 166 54M52 20 61 92 89 62 108 96 128 24M89 62 166 54" /></g>
                <g fill="#2563eb" stroke="#fff" strokeWidth="3"><circle cx="12" cy="53" r="6"/><circle cx="52" cy="20" r="6"/><circle cx="61" cy="92" r="6"/><circle cx="89" cy="62" r="6"/><circle cx="108" cy="96" r="6"/><circle cx="128" cy="24" r="6"/><circle cx="166" cy="54" r="6"/></g>
              </svg>
              <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 text-sm sm:flex-1">
                <span className="min-w-0 break-words text-on-surface-variant dark:text-slate-400">{t.nodes}</span><strong className="whitespace-nowrap text-right tabular-nums">{fmt(report?.connectivity?.nodes, locale)}</strong>
                <span className="min-w-0 break-words text-on-surface-variant dark:text-slate-400">{t.links}</span><strong className="whitespace-nowrap text-right tabular-nums">{fmt(report?.connectivity?.edges, locale)}</strong>
                <span className="min-w-0 break-words text-on-surface-variant dark:text-slate-400">{t.avgLinks}</span><strong className="whitespace-nowrap text-right tabular-nums">{fmt(report?.connectivity?.avg_degree, locale, 2)}</strong>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-outline-variant bg-surface p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900/60">
            <h4 className="text-lg font-semibold">{t.communities}</h4>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">{t.communitiesText}</p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {[{ label: t.louvain, value: louvainCount || undefined }, { label: t.leiden, value: leidenCount || undefined }].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-primary dark:text-blue-400">{fmt(item.value, locale)}</span>
                  <span className="text-sm text-on-surface-variant dark:text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3" role="img" aria-label={`${t.agreement}: ARI ${fmt(agreement.ari, locale, 2)}%, NMI ${fmt(agreement.nmi, locale, 2)}%`}>
              {[{ key: 'ARI', value: agreement.ari }, { key: 'NMI', value: agreement.nmi }].map((item) => <div key={item.key}>
                <div className="mb-1 flex justify-between text-xs"><span>{t.agreement} · {item.key}</span><strong>{item.value == null ? '—' : `${fmt(item.value, locale, 2)}%`}</strong></div>
                <div className="h-2 rounded-full bg-surface-variant dark:bg-slate-800"><div className="h-2 rounded-full bg-cyan-500 dark:bg-cyan-400" style={{ width: `${Math.max(0, Math.min(100, item.value ?? 0))}%` }} /></div>
              </div>)}
            </div>
          </article>

          <article className="rounded-xl border border-outline-variant bg-surface p-5 sm:col-span-2 sm:p-7 dark:border-slate-800 dark:bg-slate-900/60">
            <h4 className="text-lg font-semibold">{t.resilience}</h4>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">{t.resilienceText}</p>
            <div className="mt-5 space-y-3" role="img" aria-label={t.resilienceText}>
              {resilience.map((item) => <div key={item.label} className="grid grid-cols-[125px_1fr_48px] items-center gap-3 sm:grid-cols-[190px_1fr_56px]">
                <span className="text-xs text-on-surface-variant dark:text-slate-300 sm:text-sm">{item.label}</span>
                <div className="h-3 overflow-hidden rounded-full bg-surface-variant dark:bg-slate-800"><div className="h-full" style={{ width: `${Math.max(0, Math.min(100, item.value ?? 0))}%`, backgroundColor: item.color }} /></div>
                <strong className="text-right text-sm tabular-nums">{item.value == null ? '—' : `${fmt(item.value, locale, 1)}%`}</strong>
              </div>)}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
