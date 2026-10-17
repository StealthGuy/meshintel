import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const RoleConfigurationOptimizer: React.FC = () => {
  const navigate = useNavigate();
  const { roleSuggestions, setSelectedNodeDetails } = useAppStore();

  if (!roleSuggestions) return null;

  const correctPct = roleSuggestions.total_nodes
    ? (roleSuggestions.correct_count / roleSuggestions.total_nodes) * 100
    : 0;
  const mismatchPct = roleSuggestions.total_nodes
    ? (roleSuggestions.mismatched_count / roleSuggestions.total_nodes) * 100
    : 0;

  const renderNodeList = (
    nodes: typeof roleSuggestions.hidden_backbones,
    emptyMessage: string,
  ) => nodes.length ? (
    <div className="space-y-2">
      {nodes.slice(0, 5).map((node) => (
        <button
          key={node.id}
          type="button"
          className="group flex w-full min-w-0 items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-3 text-left transition-colors hover:border-primary hover:bg-surface-container-low"
          onClick={() => {
            setSelectedNodeDetails(node);
            navigate(`/node-details/${encodeURIComponent(node.id)}`);
          }}
        >
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="truncate text-sm font-semibold text-primary group-hover:underline">{node.long_name || node.id}</span>
              <span className="shrink-0 rounded border border-outline-variant bg-surface-container-low px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-on-surface-variant">{node.role}</span>
            </span>
            <span className="mt-1 block truncate font-mono text-[10px] text-outline">{node.id}</span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block font-data-tabular text-sm font-semibold tabular-nums text-on-surface">{node.betweenness_centrality.toFixed(5)}</span>
            <span className="text-[10px] uppercase tracking-wide text-outline">Centrality</span>
          </span>
        </button>
      ))}
    </div>
  ) : (
    <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest px-4 text-center text-xs text-on-surface-variant">
      {emptyMessage}
    </div>
  );

  return (
    <section aria-label="Role suggestions" className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-outline-variant border-l-4 border-l-emerald-500 bg-surface-container-lowest p-5">
          <div className="text-xs font-label-mono uppercase tracking-wider text-on-surface-variant">Optimal configurations</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">{roleSuggestions.correct_count} <span className="text-base font-medium">({correctPct.toFixed(1)}%)</span></div>
        </article>
        <article className="rounded-xl border border-outline-variant border-l-4 border-l-amber-500 bg-surface-container-lowest p-5">
          <div className="text-xs font-label-mono uppercase tracking-wider text-on-surface-variant">Configuration mismatches</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-amber-600">{roleSuggestions.mismatched_count} <span className="text-base font-medium">({mismatchPct.toFixed(1)}%)</span></div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <article className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <header className="mb-4 flex items-center gap-3 border-b border-outline-variant pb-3">
            <span className="material-symbols-outlined text-amber-500">north</span>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-on-surface">High-centrality clients</h2>
              <p className="mt-1 text-xs text-on-surface-variant">Suggested role: Router · top 5% betweenness</p>
            </div>
          </header>
          {renderNodeList(roleSuggestions.hidden_backbones, 'No high-centrality clients found.')}
        </article>

        <article className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <header className="mb-4 flex items-center gap-3 border-b border-outline-variant pb-3">
            <span className="material-symbols-outlined text-blue-500">south</span>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-on-surface">Low-centrality routers</h2>
              <p className="mt-1 text-xs text-on-surface-variant">Suggested role: Client · below top 5% betweenness</p>
            </div>
          </header>
          {renderNodeList(roleSuggestions.under_utilized_routers, 'No low-centrality routers found.')}
        </article>
      </div>
    </section>
  );
};
