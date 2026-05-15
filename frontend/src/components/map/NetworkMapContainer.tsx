import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { NodeInfoCard } from './NodeInfoCard';
import { GeoJsonLayer } from './GeoJsonLayer';
import { useAppStore } from '../../store/useAppStore';

export const NetworkMapContainer: React.FC = () => {
  const { activeTileLayer, setActiveTileLayer, fetchMapData, activeAlgorithm, isLoadingMap, isSidebarOpen } = useAppStore();
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    // Only fetch if we don't have data yet. 
    // The store's setActiveAlgorithm handles subsequent changes.
    if (!useAppStore.getState().geoJsonData) {
      fetchMapData(activeAlgorithm);
    }
  }, [fetchMapData, activeAlgorithm]);

  useEffect(() => {
    if (map) {
      // Wait for CSS transition to finish before invalidating size
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [map, isSidebarOpen]);

  return (
    <div className="flex-1 bg-black relative w-full h-full" id="map-container">

      <MapContainer
        center={[42.5, 12.5]}
        zoom={6}
        zoomControl={false}
        preferCanvas={true} // <--- Attiva il rendering Canvas globale
        className="absolute inset-0 w-full h-full z-0"
        ref={setMap}
      >
        {activeTileLayer === 'dark' ? (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
          />
        ) : (
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
          />
        )}

        <GeoJsonLayer />
      </MapContainer>

      {/* Floating Map Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button
          onClick={() => map?.zoomIn()}
          className="w-10 h-10 bg-surface text-on-surface rounded border border-surface-variant flex items-center justify-center shadow-sm hover:bg-surface-variant transition-colors cursor-pointer pointer-events-auto"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
        <button
          onClick={() => map?.zoomOut()}
          className="w-10 h-10 bg-surface text-on-surface rounded border border-surface-variant flex items-center justify-center shadow-sm hover:bg-surface-variant transition-colors cursor-pointer pointer-events-auto"
        >
          <span className="material-symbols-outlined">remove</span>
        </button>
      </div>

      <NodeInfoCard />

      {/* Desktop Map Tile Toggle Control */}
      <div className="hidden md:flex absolute top-6 right-6 z-20 flex-col gap-2">
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-1 shadow-xl pointer-events-auto">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTileLayer('dark')}
              className={`flex items-center gap-3 px-3 py-2 rounded text-[11px] font-mono uppercase tracking-wider cursor-pointer transition-colors ${activeTileLayer === 'dark' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-[18px]">dark_mode</span>
              Standard Dark
            </button>
            <button
              onClick={() => setActiveTileLayer('topo')}
              className={`flex items-center gap-3 px-3 py-2 rounded text-[11px] font-mono uppercase tracking-wider cursor-pointer transition-colors ${activeTileLayer === 'topo' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-[18px]">terrain</span>
              OpenTopo Map
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Map Tile Toggle Control (Floating round button) */}
      <div className="md:hidden absolute bottom-32 right-6 z-20 flex flex-col gap-2">
        <button
          onClick={() => setActiveTileLayer(activeTileLayer === 'dark' ? 'topo' : 'dark')}
          className="w-10 h-10 bg-surface text-on-surface rounded-full border border-surface-variant flex items-center justify-center shadow-lg hover:bg-surface-variant transition-colors cursor-pointer pointer-events-auto"
          title="Toggle Map Style"
        >
          <span className="material-symbols-outlined">
            {activeTileLayer === 'dark' ? 'terrain' : 'dark_mode'}
          </span>
        </button>
      </div>

      {/* Center Focus Placeholder */}
      {isLoadingMap && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 opacity-80">
            <span className="material-symbols-outlined text-blue-500 text-4xl animate-spin" style={{ fontVariationSettings: "'wght' 200" }}>sync</span>
            <div className="flex flex-col items-center">
              <span className="text-blue-400 font-mono text-[10px] uppercase tracking-[0.3em]">Loading Map</span>
              <span className="text-white font-mono text-sm uppercase tracking-widest font-bold">PLEASE WAIT</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
