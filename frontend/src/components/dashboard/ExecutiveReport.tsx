import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { KpiBentoCard } from './KpiBentoCard';
import { CssHistogram } from './CssHistogram';

export const ExecutiveReport: React.FC = () => {
  const navigate = useNavigate();
  const { report, fetchReport, isSidebarOpen, setSelectedNodeDetails } = useAppStore();

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

  const { connectivity, distances, degree_distribution, centrality } = report;

  // Assortativity text logic
  const assortativityVal = degree_distribution.assortativity || 0;
  const isAssortative = assortativityVal > 0;
  const assortativityText = isAssortative
    ? "Network is assortative. High degree nodes tend to connect to other high degree nodes, making the core very resilient."
    : "Network is disassortative. High degree nodes are less connected to one another and the failure of a high degree node would have more impact on the connectedness of the network.";

  // Helper for Centrality Tables
  const renderCentralityTable = (title: string, dataList: Array<{id: string, name: string, value: number}>) => {
    if (!dataList || dataList.length === 0) return null;
    return (
      <div className="p-4 border-b border-outline-variant last:border-b-0 flex-1">
        <h4 className="font-label-mono text-label-mono text-on-surface-variant mb-3 uppercase">{title}</h4>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/50">
              <th className="pb-2 font-label-mono text-[10px] text-outline font-normal">ENTITY ID</th>
              <th className="pb-2 font-label-mono text-[10px] text-outline font-normal text-right">SCORE</th>
            </tr>
          </thead>
          <tbody className="font-data-tabular text-sm">
            {dataList.map((item, idx) => {
              // Assign colors arbitrarily for visual effect like mockup
              const colors = ["bg-error", "bg-surface-tint", "bg-tertiary-container", "bg-secondary", "bg-primary"];
              const dotColor = colors[idx % colors.length];
              return (
                <tr 
                  key={item.id} 
                  className="group hover:bg-surface-container-low transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedNodeDetails({ id: item.id, long_name: item.name });
                    navigate(`/node-details/${item.id}`);
                  }}
                >
                  <td className="py-2 flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 ${dotColor} rounded-none shrink-0`}></div>
                    <span className="truncate max-w-[150px] text-primary hover:underline group-hover:text-primary transition-colors" title={item.name}>
                      {item.name || item.id}
                    </span>
                  </td>
                  <td className="py-2 text-right">{item.value.toFixed(4)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`p-6 overflow-y-auto h-full w-full bg-surface print:overflow-visible print:h-auto print:block transition-all duration-300 ${!isSidebarOpen ? 'pl-[4.5rem]' : ''}`}>
      <div className="max-w-container-max mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex justify-between items-end border-b border-outline-variant pb-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Network Intelligence Summary</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Comprehensive analysis of topology, centrality, and connectivity metrics.
            </p>
          </div>
          <button 
            onClick={() => window.print()}
            className="print:hidden bg-primary-container text-on-primary border-none rounded-DEFAULT px-4 py-2 flex items-center gap-2 font-label-mono text-label-mono hover:bg-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            EXPORT PDF
          </button>
        </div>

        {/* Executive Summary KPIs */}
        <section aria-label="Executive Summary KPIs">
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
              value={distances.diameter || 'N/A'} 
              subtitle="hops"
              colorClass="bg-tertiary-fixed-dim/20"
            />
            <KpiBentoCard 
              title="Avg Degree" 
              value={connectivity.avg_degree ? connectivity.avg_degree.toFixed(2) : 'N/A'} 
              subtitle="connections/node"
              colorClass="bg-error-container/40"
            />
          </div>
        </section>

        {/* Assortativity Insight */}
        <section aria-label="Network Assortativity">
          <div className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col md:flex-row items-start md:items-center gap-4 border-l-4 border-l-tertiary-container">
            <div className="flex items-center gap-4 md:border-r border-outline-variant md:pr-6 md:min-w-fit">
              <span className="material-symbols-outlined text-tertiary-container text-3xl">insights</span>
              <div>
                <h3 className="font-label-mono text-label-mono text-on-surface-variant uppercase">Assortativity</h3>
                <div className="font-headline-lg text-2xl font-black tracking-tight text-on-surface mt-1">
                  {assortativityVal.toFixed(3)}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-body-sm text-body-sm text-on-surface">
                <span className="font-semibold text-tertiary-container">
                  {isAssortative ? 'Network is assortative. ' : 'Network is disassortative. '}
                </span>
                {assortativityText.split('. ')[1]}
              </p>
            </div>
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
                  badgeText="INCOMING"
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
                badgeText={`AVG PATH: ${distances.avg_path_length ? distances.avg_path_length.toFixed(2) : 'N/A'}`}
                colorTheme="tertiary-container"
              />
            </div>

          </div>

          {/* Right Column: Centrality Analysis */}
          <div className="space-y-6 flex flex-col">
            <section className="bg-surface-container-lowest border border-outline-variant h-[536px] flex flex-col">
              <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low shrink-0">
                <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-surface-tint text-sm">share</span>
                  Centrality Rankings
                </h3>
              </div>
              <div className="flex-1 flex flex-col overflow-y-auto">
                {renderCentralityTable("Top Betweenness", centrality.top_betweenness || [])}
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
