import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const MetricsGrid: React.FC = () => {
  const { report, isLoadingReport, fetchReport } = useAppStore();

  useEffect(() => {
    if (!report) {
      fetchReport();
    }
  }, [fetchReport, report]);

  const nodesCount = report?.connectivity?.nodes ?? '...';
  const edgesCount = report?.connectivity?.edges ?? '...';
  const assortativity = report?.degree_distribution?.assortativity !== undefined ? Number(report.degree_distribution.assortativity).toFixed(3) : '...';
  const diameter = report?.distances?.diameter ?? '...';

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-label-mono text-label-mono text-outline uppercase">KEY METRICS</h3>
      {isLoadingReport && !report ? (
        <div className="text-xs text-slate-500">Loading metrics...</div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <MetricBox icon="radio_button_checked" label="Nodes" value={nodesCount} />
          <MetricBox icon="timeline" label="Edges" value={edgesCount} />
          <MetricBox icon="bubble_chart" label="Assortat." value={assortativity} />
          <MetricBox icon="share" label="Diameter" value={diameter} />
        </div>
      )}
    </div>
  );
};

const MetricBox: React.FC<{ icon: string, label: string, value: string | number }> = ({ icon, label, value }) => (
  <div className="border border-surface-variant rounded p-2 bg-surface flex flex-col justify-between h-16">
    <div className="flex items-center gap-1 text-on-surface-variant">
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      <span className="font-label-mono text-[10px] tracking-wider uppercase">{label}</span>
    </div>
    <span className="font-data-tabular text-data-tabular font-semibold text-on-surface">{value}</span>
  </div>
);
