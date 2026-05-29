import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FALLBACK_VALUE } from '../../utils/formatters';
import { KpiBentoCard } from './KpiBentoCard';
import { CssHistogram } from './CssHistogram';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { report, fetchReport, setSelectedNodeDetails } = useAppStore();

  useEffect(() => {
    if (!report) {
      fetchReport();
    }
  }, [report, fetchReport]);

  if (!report) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { connectivity, distances, degree_distribution, centrality, stats } = report;

  // Assortativity text logic
  const assortativityVal = degree_distribution.assortativity || 0;
  const isAssortative = assortativityVal > 0;
  const assortativityText = isAssortative
    ? "Assortative Network: High degree nodes tend to connect to other high degree nodes, making the core very resilient."
    : "Disassortative Network: High degree nodes are less connected to one another and the failure of a high degree node would have more impact on the connectedness of the network.";

  // Helper for Ranking Tables
  const renderRankingTable = (
    title: string, 
    dataList: Array<{ id: string, name: string, value: number }>,
    onItemClick?: (id: string, name: string) => void
  ) => {
    if (!dataList || dataList.length === 0) return null;

    // Il primo nodo ha il punteggio massimo, lo usiamo come riferimento per il 100%
    const maxValue = dataList[0].value;

    return (
      <div className="p-4 border-b border-outline-variant last:border-b-0 flex-1">
        <h4 className="font-label-mono text-label-mono text-on-surface-variant mb-4 uppercase">{title}</h4>
        <div className="space-y-4">
          {dataList.map((item, idx) => {
            const colors = ["bg-error", "bg-surface-tint", "bg-tertiary-container", "bg-secondary", "bg-primary"];
            const dotColor = colors[idx % colors.length];
            const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

            return (
              <div
                key={item.id}
                className={`group ${onItemClick ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (onItemClick) {
                    onItemClick(item.id, item.name);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-1.5 h-1.5 ${dotColor} rounded-none shrink-0`}></div>
                    <span className={`truncate text-[13px] font-bold ${onItemClick ? 'text-primary hover:underline group-hover:text-primary transition-colors' : 'text-on-surface'}`} title={item.name}>
                      {item.name || item.id}
                    </span>
                  </div>
                  <span className="font-data-tabular text-[11px] font-bold text-on-surface-variant">
                    {/* Format logic: if the value is an integer (like count), don't show decimals */}
                    {Number.isInteger(item.value) ? item.value : item.value.toFixed(4)}
                  </span>
                </div>
                <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
                  <div
                    className={`h-full ${dotColor} transition-all duration-700 ease-out`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper for conditional coloring of hops
  const getHopsColorClass = (val: number | undefined) => {
    if (!val || val === 0) return "text-on-surface";
    if (val >= 7) return "text-error";
    if (val >= 4) return "text-warning";
    return "text-success";
  };

  return (
    <div className={`p-6 pt-16 md:pt-6 overflow-y-auto h-full w-full bg-surface print:overflow-visible print:h-auto print:block transition-all duration-300`}>
      <div className="max-w-container-max mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex justify-between items-end border-b border-outline-variant pb-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Network Analysis Summary</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Comprehensive analysis of topology, centrality, and connectivity metrics.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="print:hidden bg-primary-container text-on-primary border-none rounded px-4 py-2 flex items-center gap-2 font-label-mono text-label-mono hover:bg-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            EXPORT PDF
          </button>
        </div>

        {/* Dashboard KPIs */}
        <section aria-label="Dashboard KPIs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiBentoCard
              title="Total Nodes"
              value={(connectivity.nodes || 0).toLocaleString()}
              colorClass="bg-primary-fixed-dim/20"
            />
            <KpiBentoCard
              title="Total Edges"
              value={(connectivity.edges || 0).toLocaleString()}
              colorClass="bg-secondary-fixed-dim/20"
            />
            <KpiBentoCard
              title="Network Diameter"
              value={distances.diameter || FALLBACK_VALUE}
              subtitle="Max hops"
              colorClass="bg-tertiary-fixed-dim/20"
              valueColorClass={getHopsColorClass(distances.diameter)}
            />
            <KpiBentoCard
              title="Average Path Length"
              value={distances.avg_path_length ? distances.avg_path_length.toFixed(2) : FALLBACK_VALUE}
              subtitle="Avg hops"
              colorClass="bg-surface-tint/20"
              valueColorClass={getHopsColorClass(distances.avg_path_length)}
            />
          </div>
        </section>

        {/* Network Assortativity - Infographic Slider Version */}
        <section aria-label="Network Assortativity">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 flex flex-col gap-6">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-tertiary-container text-3xl">insights</span>
                <div>
                  <h3 className="font-label-mono text-label-mono text-on-surface-variant uppercase">Network Assortativity</h3>
                  <div className="font-headline-lg text-3xl font-black tracking-tight text-on-surface mt-1">
                    {assortativityVal.toFixed(3)}
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Slider Container */}
            <div className="space-y-4">
              <div className="relative w-full h-2 bg-surface-container-highest rounded-full overflow-visible">
                {/* Gradient Track - Using Design System Tones */}
                <div className="absolute inset-0 bg-gradient-to-r from-error/30 via-outline-variant/30 to-primary/30 rounded-full"></div>

                {/* Center Notch (0.0) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-outline-variant z-10"></div>

                {/* The Cursor */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-on-surface border-2 border-white shadow-lg rounded-full z-20 transition-all duration-700 ease-out"
                  style={{ left: `${Math.min(Math.max(((assortativityVal + 1) / 2) * 100, 0), 100)}%` }}
                >
                  {/* Pulse effect if very disassortative */}
                  {!isAssortative && assortativityVal < -0.1 && (
                    <div className="absolute inset-0 animate-ping bg-error/40 rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Scale Labels */}
              <div className="flex justify-between font-label-mono text-[9px] text-outline uppercase tracking-widest">
                <div className="flex flex-col items-start">
                  <span>-1.0</span>
                  <span className="text-error font-bold">Disassortative</span>
                </div>
                <div className="flex flex-col items-center">
                  <span>0.0</span>
                  <span>Neutral</span>
                </div>
                <div className="flex flex-col items-end">
                  <span>+1.0</span>
                  <span className="text-primary font-bold">Assortative</span>
                </div>
              </div>
            </div>

            {/* Micro-description - Restoring custom constant */}
            <p className="font-body-sm text-body-sm text-on-surface-variant border-t border-outline-variant/30 pt-4 italic">
              {assortativityText}
            </p>
          </div>
        </section>

        {/* Charts & Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (Span 2) */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64">
                <CssHistogram
                  title="In-Degree Distribution"
                  icon="call_received"
                  data={Object.values(degree_distribution.in_degree || {})}
                  badgeText={`AVG DEGREE: ${connectivity.avg_degree ? connectivity.avg_degree.toFixed(2) : FALLBACK_VALUE}`}
                  colorTheme="primary"
                />
              </div>
              <div className="h-64">
                <CssHistogram
                  title="Out-Degree Distribution"
                  icon="call_made"
                  data={Object.values(degree_distribution.out_degree || {})}
                  badgeText="OUTGOING"
                  colorTheme="secondary"
                />
              </div>
            </div>

            <div className="h-64 shrink-0">
              <CssHistogram
                title="Distance Distribution"
                icon="route"
                data={Object.values(distances.distribution || {})}
                badgeText={`AVG PATH: ${distances.avg_path_length ? distances.avg_path_length.toFixed(2) : FALLBACK_VALUE}`}
                colorTheme="tertiary-container"
              />
            </div>

          </div>

          {/* Right Column: Rankings */}
          <div className="space-y-6 flex flex-col">
            <section className="bg-surface-container-lowest border border-outline-variant h-[536px] flex flex-col">
              <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low shrink-0">
                <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-surface-tint text-sm">leaderboard</span>
                  Top Rankings
                </h3>
              </div>
              <div className="flex-1 flex flex-col overflow-y-auto">
                {renderRankingTable(
                  "Top Betweenness", 
                  centrality?.top_betweenness || [],
                  (id, name) => {
                    setSelectedNodeDetails({ id, long_name: name });
                    navigate(`/node-details/${id}`);
                  }
                )}
                {renderRankingTable(
                  "Most Popular Hardware", 
                  stats?.hardware?.slice(0, 5).map((hw: any) => ({
                    id: hw.label || 'UNKNOWN',
                    name: hw.label || 'UNKNOWN',
                    value: hw.count
                  })) || []
                )}
              </div>
            </section>
          </div>

        </div>

        {/* Bottom spacer */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};
