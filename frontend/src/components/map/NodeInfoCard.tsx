import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const NodeInfoCard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedNodeDetails, setSelectedNodeDetails, activeAlgorithm, mapSettings, isSidebarOpen } = useAppStore();

  if (!selectedNodeDetails) {
    return null; // Non mostra nulla se non c'è un nodo selezionato
  }

  const dotColor = activeAlgorithm === 'raw' ? mapSettings.rawNodeColor : (selectedNodeDetails.color || '#10b981');

  return (
    <div className={`absolute top-6 z-20 w-72 bg-white/95 backdrop-blur shadow-sm border border-outline-variant rounded flex flex-col hover:shadow-md transition-all duration-300 pointer-events-auto ${isSidebarOpen ? 'left-6' : 'left-16'}`}>
      <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }}></div>
            <span className="font-label-mono text-label-mono uppercase tracking-wider text-outline">ACTIVE NODE</span>
          </div>
          <h4 className="font-headline-md text-headline-md text-on-surface">{selectedNodeDetails.id}</h4>
        </div>
        <button className="text-outline hover:text-on-surface cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedNodeDetails(null); }}>
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between border-b border-surface-variant pb-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Short Name</span>
          <span className="font-body-sm text-body-sm text-on-surface font-semibold">{selectedNodeDetails.short_name || 'N/A'}</span>
        </div>
        <div className="flex justify-between border-b border-surface-variant pb-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Long Name</span>
          <span className="font-body-sm text-body-sm text-on-surface font-semibold text-right max-w-[150px] truncate" title={selectedNodeDetails.long_name}>{selectedNodeDetails.long_name || 'N/A'}</span>
        </div>
        <div className="flex justify-between border-b border-surface-variant pb-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Role</span>
          <span className="font-body-sm text-body-sm text-on-surface">{selectedNodeDetails.role || 'Unknown'}</span>
        </div>
        {/* <div className="flex justify-between border-b border-surface-variant pb-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Community</span>
          <span className="font-body-sm text-body-sm text-on-surface">{selectedNodeDetails.community_id !== undefined && selectedNodeDetails.community_id !== -1 ? selectedNodeDetails.community_id : 'N/A'}</span>
        </div> */}
        <button 
          onClick={() => navigate(`/node-details/${selectedNodeDetails.id}`)}
          className="mt-2 w-full py-1.5 text-center text-[11px] uppercase tracking-wider text-primary font-label-mono bg-surface-container-highest border border-outline-variant hover:bg-surface-variant transition-colors cursor-pointer"
        >
          View Full Intelligence Profile
        </button>
      </div>
    </div>
  );
};
