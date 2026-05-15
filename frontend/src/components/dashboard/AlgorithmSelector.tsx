import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const AlgorithmSelector: React.FC = () => {
  const { activeAlgorithm, setActiveAlgorithm, geoJsonData } = useAppStore();

  // Calcolo del numero di community presenti nel GeoJSON attuale
  const communityCount = useMemo(() => {
    if (!geoJsonData || !geoJsonData.features) return 0;
    const communities = new Set();
    geoJsonData.features.forEach((f: any) => {
      // Contiamo solo le community dei nodi (non degli archi) e ignoriamo -1 (nessuna community)
      if (f.properties.type === 'node' && f.properties.community_id !== undefined && f.properties.community_id !== -1) {
        communities.add(f.properties.community_id);
      }
    });
    return communities.size;
  }, [geoJsonData]);

  const getButtonClass = (algo: string) => {
    const baseClass = "w-full cursor-pointer text-left px-3 py-1.5 rounded font-body-sm text-body-sm transition-all flex justify-between items-center group min-h-[32px] whitespace-nowrap ";
    if (activeAlgorithm === algo) {
      return baseClass + "border border-primary-container bg-primary text-on-primary shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]";
    }
    return baseClass + "border border-outline-variant bg-surface text-on-surface hover:bg-surface-variant";
  };

  return (
    <div className="flex flex-col gap-2 min-h-[115px]">
      <h3 className="font-label-mono text-label-mono text-outline uppercase">community analysis</h3>
      <div className="flex flex-col gap-1">
        <button 
          className={getButtonClass('raw')} 
          onClick={() => setActiveAlgorithm('raw')}
        >
          <span>Raw Network</span>
          {/* Badge invisibile per mantenere l'allineamento con gli altri tasti */}
          <span className="opacity-0 pointer-events-none text-[10px] px-1.5 py-0.5 rounded font-bold">0 CLUSTERS</span>
        </button>
        <button 
          className={getButtonClass('louvain')} 
          onClick={() => setActiveAlgorithm('louvain')}
        >
          <span>Louvain (2-core)</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition-opacity duration-200 ${activeAlgorithm === 'louvain' && communityCount > 0 ? 'bg-white/20 opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {communityCount || 0} CLUSTERS
          </span>
        </button>
        <button 
          className={getButtonClass('leiden')} 
          onClick={() => setActiveAlgorithm('leiden')}
        >
          <span>Leiden (2-core)</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition-opacity duration-200 ${activeAlgorithm === 'leiden' && communityCount > 0 ? 'bg-white/20 opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {communityCount || 0} CLUSTERS
          </span>
        </button>
      </div>
    </div>
  );
};
