import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FALLBACK_VALUE } from '../../utils/formatters';
import { HUB_NODE_IN_DEGREE_THRESHOLD } from '../../utils/constants';

export const NodeInfoCard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedNodeDetails, setSelectedNodeDetails, activeAlgorithm, mapSettings, isSidebarOpen } = useAppStore();

  if (!selectedNodeDetails) {
    return null; // Non mostra nulla se non c'è un nodo selezionato
  }

  const dotColor = activeAlgorithm === 'raw' ? mapSettings.rawNodeColor : (selectedNodeDetails.color || '#10b981');

  return (
    <div className={`absolute top-6 z-20 w-72 bg-white/95 backdrop-blur shadow-sm border border-outline-variant rounded flex flex-col hover:shadow-md transition-all duration-300 pointer-events-auto ${isSidebarOpen ? 'left-6' : 'left-16'}`}>
      {/* HEADER */}
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

      {/* CONTENT */}
      <div className="p-4 flex flex-col gap-3">
        {/* Short Name */}
        <div className="flex justify-between items-center border-b border-surface-variant pb-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Short Name</span>
          <span className="font-body-sm text-body-sm text-on-surface font-semibold">{selectedNodeDetails.short_name || FALLBACK_VALUE}</span>
        </div>

        {/* Long Name */}
        <div className="flex justify-between items-center border-b border-surface-variant pb-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Long Name</span>
          <span className="font-body-sm text-body-sm text-on-surface font-semibold text-right max-w-[150px] truncate" title={selectedNodeDetails.long_name}>
            {selectedNodeDetails.long_name || FALLBACK_VALUE}
          </span>
        </div>

        {/* Role */}
        <div className="flex justify-between items-center border-b border-surface-variant pb-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Role</span>
          <span className="font-body-sm text-body-sm text-on-surface font-medium uppercase tracking-wide">
            {selectedNodeDetails.role || FALLBACK_VALUE}
          </span>
        </div>

        {/* Connections (In/Out Degree + HUB Badge con colore originale) */}
        <div className="flex justify-between items-center border-b border-surface-variant pb-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Connections</span>
          <div className="flex items-center gap-2">
            {((selectedNodeDetails as any).in_degree || 0) > HUB_NODE_IN_DEGREE_THRESHOLD && (
              <span className="bg-error text-on-error px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-wider uppercase">
                HUB
              </span>
            )}
            <span className="font-body-sm text-body-sm text-on-surface font-semibold">
              {(selectedNodeDetails as any).in_degree ?? '-'} <span className="text-on-surface-variant text-[11px] font-normal">in</span>
              <span className="mx-1.5 text-outline">•</span>
              {(selectedNodeDetails as any).out_degree ?? '-'} <span className="text-on-surface-variant text-[11px] font-normal">out</span>
            </span>
          </div>
        </div>

        {/* VIEW DETAILS BUTTON */}
        <button
          onClick={() => navigate(`/node-details/${selectedNodeDetails.id}`)}
          className="mt-2 w-full py-1.5 text-center text-[11px] uppercase tracking-wider text-primary font-label-mono bg-surface-container-highest border border-outline-variant hover:bg-surface-variant transition-colors cursor-pointer"
        >
          View Full Node Profile
        </button>
      </div>
    </div>
  );
};
