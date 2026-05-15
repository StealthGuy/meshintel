import React from 'react';
import { useAppStore } from '../../store/useAppStore';

export const AlgorithmSelector: React.FC = () => {
  const { activeAlgorithm, setActiveAlgorithm } = useAppStore();

  const getButtonClass = (algo: string) => {
    const baseClass = "w-full cursor-pointer text-left px-3 py-1.5 rounded font-body-sm text-body-sm transition-colors flex justify-between items-center group ";
    if (activeAlgorithm === algo) {
      return baseClass + "border border-primary-container bg-primary text-on-primary shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]";
    }
    return baseClass + "border border-outline-variant bg-surface text-on-surface hover:bg-surface-variant";
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-label-mono text-label-mono text-outline uppercase">community analysis</h3>
      <div className="flex flex-col gap-1">
        <button 
          className={getButtonClass('raw')} 
          onClick={() => setActiveAlgorithm('raw')}
        >
          Raw Network
        </button>
        <button 
          className={getButtonClass('louvain')} 
          onClick={() => setActiveAlgorithm('louvain')}
        >
          Louvain (2-core)
        </button>
        <button 
          className={getButtonClass('leiden')} 
          onClick={() => setActiveAlgorithm('leiden')}
        >
          Leiden (2-core)
        </button>
      </div>
    </div>
  );
};
