import React, { useEffect, useState } from 'react';
import { networkApi } from '../../api/networkApi';

type Language = 'it' | 'en';
type NetworkReport = {
  connectivity?: { nodes?: number; edges?: number };
  distances?: { avg_path_length?: number };
  stats?: { mqtt?: Array<{ label: string; count: number }> };
  generated_at?: string;
};
type RoleReport = { total_nodes?: number; mismatched_count?: number };

const copy = {
  it: {
    eyebrow: 'Executive report', title: 'La mesh italiana, oggi',
    nodes: 'Nodi osservati', links: 'Collegamenti', hops: 'Hop medi', mqtt: 'MQTT', mismatches: 'Ruoli da verificare',
    study: 'Cosa emerge dallo studio', topology: 'Una rete ampia e sparsa',
    topologyText: 'Il dataset dello studio descrive una rete poco densa, con pochi collegamenti medi per nodo.',
    communities: 'Comunità riconoscibili', communitiesText: 'Louvain e Leiden hanno individuato 19 comunità ciascuno e restituito partizioni molto simili: la rete si organizza in gruppi locali coerenti.',
    agreement: 'Somiglianza tra i risultati', resilience: 'La rete è più vulnerabile ai guasti mirati',
    resilienceText: 'Ogni barra mostra la quota di nodi rimossi prima della frammentazione; attacchi mirati ai nodi più centrali sono più efficaci di quelli casuali.',
    random: 'Guasti casuali', degree: 'Nodi più connessi', rank: 'Nodi più influenti', bridges: 'Nodi con alta betweenness',
  },
  en: {
    eyebrow: 'Executive report', title: 'The Italian mesh, today',
    nodes: 'Observed nodes', links: 'Links', hops: 'Average hops', mqtt: 'MQTT', mismatches: 'Roles to review',
    study: 'What the study found', topology: 'A large, sparse network',
    topologyText: 'The study dataset shows a sparse network, with few links per node.',
    communities: 'Distinct network communities', communitiesText: 'Louvain and Leiden each found 19 communities and produced highly similar partitions: the network forms consistent local groups.',
    agreement: 'Similarity between results', resilience: 'Targeted failures are more disruptive',
    resilienceText: 'Bars show the share of nodes removed before fragmentation; targeted attacks on highly central nodes are more disruptive than random failures.',
    random: 'Random failures', degree: 'Most connected nodes', rank: 'Most influential nodes', bridges: 'High betweenness nodes',
  },
} satisfies Record<Language, Record<string, string>>;

const fmt = (value: number | undefined, locale: string, digits = 0) =>
  value == null || !Number.isFinite(value) ? '—' : value.toLocaleString(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits });

export const ExecutiveSummary: React.FC<{ language: Language }> = ({ language }) => {
  const t = copy[language];
  const locale = language === 'it' ? 'it-IT' : 'en-GB';
  const [report, setReport] = useState<NetworkReport | null>(null);
  const [roles, setRoles] = useState<RoleReport | null>(null);
  useEffect(() => {
    let mounted = true;
    networkApi.getReport().then((data: NetworkReport) => { if (mounted) setReport(data); })
      .catch((error) => console.error('Unable to load executive report metrics', error));
    networkApi.getRoleSuggestions().then((data: RoleReport) => { if (mounted) setRoles(data); })
      .catch((error) => console.error('Unable to load role metrics', error));
    return () => { mounted = false; };
  }, []);

  const mqttCount = report?.stats?.mqtt?.find((item) => item.label === '1')?.count;
  const mismatchPct = roles?.total_nodes ? (Number(roles.mismatched_count || 0) / roles.total_nodes) * 100 : undefined;
  const kpis = [
    { label: t.nodes, value: fmt(report?.connectivity?.nodes, locale) },
    { label: t.links, value: fmt(report?.connectivity?.edges, locale) },
    { label: t.hops, value: fmt(report?.distances?.avg_path_length, locale, 1) },
    ...(mqttCount != null ? [{ label: t.mqtt, value: `${fmt(mqttCount, locale)} ${language === 'it' ? 'nodi' : 'nodes'}` }] : []),
    { label: t.mismatches, value: mismatchPct == null ? '—' : `${fmt(mismatchPct, locale, 1)}%` },
  ];
  const resilience = [
    { label: t.random, value: 27, color: '#22c55e' },
    { label: t.degree, value: 10, color: '#f59e0b' },
    { label: t.rank, value: 10, color: '#f97316' },
    { label: t.bridges, value: 6.5, color: '#ef4444' },
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
          <span className="text-xs text-on-surface-variant dark:text-slate-400">{language === 'it' ? 'Studio effettuato nel: maggio 2026' : 'Study conducted in: May 2026'}</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-outline-variant bg-surface p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900/60">
            <h4 className="text-lg font-semibold">{t.topology}</h4>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">{t.topologyText}</p>
            <div className="mt-5 flex min-w-0 flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/70 sm:flex-row sm:items-center sm:gap-5" role="img" aria-label="1,721 nodes connected by 2,593 edges">
              <svg viewBox="0 0 180 110" className="h-24 w-full max-w-44 self-center overflow-visible sm:w-36 sm:shrink-0" aria-hidden="true">
                <g fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 53 52 20 89 62 128 24 166 54M52 20 61 92 89 62 108 96 128 24M89 62 166 54" /></g>
                <g fill="#2563eb" stroke="#fff" strokeWidth="3"><circle cx="12" cy="53" r="6"/><circle cx="52" cy="20" r="6"/><circle cx="61" cy="92" r="6"/><circle cx="89" cy="62" r="6"/><circle cx="108" cy="96" r="6"/><circle cx="128" cy="24" r="6"/><circle cx="166" cy="54" r="6"/></g>
              </svg>
              <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 text-sm sm:flex-1">
                <span className="min-w-0 break-words text-on-surface-variant dark:text-slate-400">{t.nodes}</span><strong className="whitespace-nowrap text-right tabular-nums">1,721</strong>
                <span className="min-w-0 break-words text-on-surface-variant dark:text-slate-400">{t.links}</span><strong className="whitespace-nowrap text-right tabular-nums">2,593</strong>
                <span className="min-w-0 break-words text-on-surface-variant dark:text-slate-400">{language === 'it' ? 'Link medi / nodo' : 'Avg. links / node'}</span><strong className="whitespace-nowrap text-right tabular-nums">1.50</strong>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-outline-variant bg-surface p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900/60">
            <h4 className="text-lg font-semibold">{t.communities}</h4>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">{t.communitiesText}</p>
            <div className="mt-5 flex items-center gap-4">
              <span className="text-4xl font-bold text-primary dark:text-blue-400">19</span>
              <span className="text-sm text-on-surface-variant dark:text-slate-400">{language === 'it' ? 'comunità per ciascun algoritmo' : 'communities found by each algorithm'}</span>
            </div>
            <div className="mt-5 space-y-3" role="img" aria-label="ARI 86.39%, NMI 93.39%">
              {[{ key: 'ARI', value: 86.39 }, { key: 'NMI', value: 93.39 }].map((item) => <div key={item.key}>
                <div className="mb-1 flex justify-between text-xs"><span>{t.agreement} · {item.key}</span><strong>{item.value.toFixed(2)}%</strong></div>
                <div className="h-2 rounded-full bg-surface-variant dark:bg-slate-800"><div className="h-2 rounded-full bg-cyan-500 dark:bg-cyan-400" style={{ width: `${item.value}%` }} /></div>
              </div>)}
            </div>
          </article>

          <article className="rounded-xl border border-outline-variant bg-surface p-5 sm:col-span-2 sm:p-7 dark:border-slate-800 dark:bg-slate-900/60">
            <h4 className="text-lg font-semibold">{t.resilience}</h4>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">{t.resilienceText}</p>
            <div className="mt-5 space-y-3" role="img" aria-label={`${t.resilience}: ${t.resilienceText}`}>
              {resilience.map((item) => <div key={item.label} className="grid grid-cols-[125px_1fr_48px] items-center gap-3 sm:grid-cols-[190px_1fr_56px]">
                <span className="text-xs text-on-surface-variant dark:text-slate-300 sm:text-sm">{item.label}</span>
                <div className="h-3 overflow-hidden rounded-full bg-surface-variant dark:bg-slate-800"><div className="h-full rounded-full" style={{ width: `${item.value / 30 * 100}%`, backgroundColor: item.color }} /></div>
                <strong className="text-right text-sm tabular-nums">{item.value}%</strong>
              </div>)}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
