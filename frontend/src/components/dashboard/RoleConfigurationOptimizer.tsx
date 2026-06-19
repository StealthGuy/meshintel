import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const RoleConfigurationOptimizer: React.FC = () => {
  const navigate = useNavigate();
  const { roleSuggestions, setSelectedNodeDetails } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!roleSuggestions) {
    return null;
  }

  return (
    <section aria-label="Role Configuration Optimizer">
      <div className="bg-surface-container-lowest border border-outline-variant p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Role Configuration Optimizer</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Identify nodes that should be reconfigured to optimize routing paths.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant hover:bg-surface-container-highest text-primary font-label-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 border border-outline-variant bg-surface-container-low flex flex-col justify-between rounded-sm">
            <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">Total Nodes Analyzed</span>
            <span className="font-data-tabular text-[24px] font-bold text-on-surface mt-2">{roleSuggestions.total_nodes}</span>
          </div>
          <div className="p-4 border border-outline-variant bg-surface-container-low flex flex-col justify-between rounded-sm border-l-4 border-l-[#10B981]">
            <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">Optimal Configurations</span>
            <span className="font-data-tabular text-[24px] font-bold text-[#10B981] mt-2">
              {roleSuggestions.correct_count} ({((roleSuggestions.correct_count / roleSuggestions.total_nodes) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="p-4 border border-outline-variant bg-surface-container-low flex flex-col justify-between rounded-sm border-l-4 border-l-[#F59E0B]">
            <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider">Configuration Mismatches</span>
            <span className="font-data-tabular text-[24px] font-bold text-[#F59E0B] mt-2">
              {roleSuggestions.mismatched_count} ({((roleSuggestions.mismatched_count / roleSuggestions.total_nodes) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Side-by-side Tables */}
        {isExpanded && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Hidden Backbones (CLIENT -> ROUTER) */}
            <div className="border border-outline-variant bg-surface-container-low p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#F59E0B] text-[20px]">arrow_upward</span>
                <h4 className="font-label-mono text-label-mono text-on-surface font-bold uppercase">High centrality Clients (Suggest ROUTER)</h4>
              </div>
              <p className="text-[12px] text-on-surface-variant mb-4">
                Nodes currently set as <strong>CLIENT</strong> but showing high centrality (top 10% of network). Consider setting them to <strong>ROUTER</strong>.
              </p>
              {roleSuggestions.hidden_backbones.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-6 border border-dashed border-outline-variant bg-surface-container-lowest">
                  <span className="font-label-mono text-[11px] text-outline uppercase">No hidden backbones found</span>
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {roleSuggestions.hidden_backbones.slice(0, 5).map((node) => (
                    <div
                      key={node.id}
                      className="p-2 border border-outline-variant bg-surface-container-lowest flex justify-between items-center hover:border-primary group cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedNodeDetails(node);
                        navigate(`/node-details/${node.id}`);
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-primary group-hover:underline truncate">
                            {node.long_name || node.id}
                          </span>
                          <span className="text-[10px] bg-outline-variant text-on-surface-variant px-1 rounded-sm uppercase tracking-wide border border-outline font-label-mono shrink-0">
                            {node.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-outline block mt-0.5 truncate">{node.id}</span>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <span className="font-data-tabular text-[12px] font-bold text-on-surface block">
                          {node.betweenness_centrality.toFixed(5)}
                        </span>
                        <span className="text-[9px] text-outline font-label-mono uppercase tracking-wider block">Centrality</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Under-Utilized Routers (ROUTER -> CLIENT) */}
            <div className="border border-outline-variant bg-surface-container-low p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-outline text-[20px]">arrow_downward</span>
                <h4 className="font-label-mono text-label-mono text-on-surface font-bold uppercase">Low centrality Routers (Suggest CLIENT)</h4>
              </div>
              <p className="text-[12px] text-on-surface-variant mb-4">
                Nodes currently set as <strong>ROUTER</strong> but showing low centrality (below top 10%). Consider setting them to <strong>CLIENT</strong>.
              </p>
              {roleSuggestions.under_utilized_routers.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-6 border border-dashed border-outline-variant bg-surface-container-lowest">
                  <span className="font-label-mono text-[11px] text-outline uppercase">No under-utilized routers found</span>
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {roleSuggestions.under_utilized_routers.slice(0, 5).map((node) => (
                    <div
                      key={node.id}
                      className="p-2 border border-outline-variant bg-surface-container-lowest flex justify-between items-center hover:border-primary group cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedNodeDetails(node);
                        navigate(`/node-details/${node.id}`);
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-primary group-hover:underline truncate">
                            {node.long_name || node.id}
                          </span>
                          <span className="text-[10px] bg-outline-variant text-on-surface-variant px-1 rounded-sm uppercase tracking-wide border border-outline font-label-mono shrink-0">
                            {node.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-outline block mt-0.5 truncate">{node.id}</span>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <span className="font-data-tabular text-[12px] font-bold text-on-surface block">
                          {node.betweenness_centrality.toFixed(5)}
                        </span>
                        <span className="text-[9px] text-outline font-label-mono uppercase tracking-wider block">Centrality</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </section>
  );
};
