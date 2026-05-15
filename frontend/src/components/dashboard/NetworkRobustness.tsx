import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const NetworkRobustness: React.FC = () => {
  const { robustness, fetchRobustness, isSidebarOpen } = useAppStore();

  useEffect(() => {
    if (!robustness) {
      fetchRobustness();
    }
  }, [robustness, fetchRobustness]);

  if (!robustness) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 overflow-y-auto h-full w-full bg-surface transition-all duration-300 ${!isSidebarOpen ? 'pl-[4.5rem]' : ''}`}>
      <div className="max-w-container-max mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex justify-between items-end border-b border-outline-variant pb-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Network Robustness: Strategy Analysis</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Evaluating network resilience through systematic node removal simulations.
            </p>
          </div>
        </div>

        {/* Best Strategy Insight */}
        <section aria-label="Best Strategy">
          <div className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col md:flex-row items-start md:items-center gap-4 border-l-4 border-l-error">
            <div className="flex items-center gap-4 md:border-r border-outline-variant md:pr-6 md:min-w-fit">
              <span className="material-symbols-outlined text-error text-3xl">destruction</span>
              <div>
                <h3 className="font-label-mono text-label-mono text-on-surface-variant uppercase">Critical Strategy</h3>
                <div className="font-headline-lg text-2xl font-black tracking-tight text-on-surface mt-1">
                  {robustness.best_strategy}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-body-sm text-body-sm text-on-surface">
                The network is most vulnerable to <span className="font-bold">{robustness.best_strategy}</span> based attacks. 
                This strategy results in the fastest disintegration of the Giant Component (GC).
              </p>
            </div>
          </div>
        </section>

        {/* Plot & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Plot Column (Span 2) */}
          <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant p-6 flex flex-col items-center justify-center min-h-[400px]">
            <h3 className="font-label-mono text-label-mono text-on-surface-variant mb-6 uppercase w-full">Attack Vulnerability Curve</h3>
            <div className="bg-white p-2 rounded shadow-sm">
              <img 
                src={`data:image/png;base64,${robustness.plot_base64}`} 
                alt="Robustness Plot" 
                className="max-w-full h-auto"
              />
            </div>
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant text-center max-w-lg">
              The chart above shows the reduction in the size of the Giant Component relative to the fraction of nodes removed. 
              A steeper curve indicates higher vulnerability to that specific attack strategy.
            </p>
          </div>

          {/* Right Column: Summary Table */}
          <div className="space-y-6">
            <section className="bg-surface-container-lowest border border-outline-variant flex flex-col h-full">
              <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low shrink-0">
                <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-surface-tint text-sm">analytics</span>
                  Strategy Metrics
                </h3>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/50">
                      <th className="pb-2 font-label-mono text-[10px] text-outline font-normal">STRATEGY</th>
                      <th className="pb-2 font-label-mono text-[10px] text-outline font-normal text-right">AUC</th>
                      <th className="pb-2 font-label-mono text-[10px] text-outline font-normal text-right">50% COLLAPSE</th>
                    </tr>
                  </thead>
                  <tbody className="font-data-tabular text-sm">
                    {robustness.summary.map((item) => (
                      <tr key={item.strategy} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 font-semibold text-primary">{item.strategy}</td>
                        <td className="py-3 text-right">{item.auc.toFixed(3)}</td>
                        <td className="py-3 text-right">{item.nodes_to_50_percent} nodes</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-surface-container-low/30 mt-auto border-t border-outline-variant">
                <h4 className="font-label-mono text-[10px] text-on-surface-variant uppercase mb-2">Metrics Definition</h4>
                <div className="space-y-2">
                  <p className="text-[11px] text-on-surface-variant italic">
                    <strong className="text-on-surface">AUC (Area Under Curve):</strong> Measures overall network robustness. Lower values mean faster network collapse.
                  </p>
                  <p className="text-[11px] text-on-surface-variant italic">
                    <strong className="text-on-surface">50% Collapse:</strong> The number of critical nodes that, if removed, reduce the network's giant component by half.
                  </p>
                </div>
              </div>
            </section>
          </div>

        </div>

        <div className="h-8"></div>
      </div>
    </div>
  );
};
