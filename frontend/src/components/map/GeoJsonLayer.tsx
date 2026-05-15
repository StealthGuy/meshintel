import React, { useEffect, useCallback } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../../store/useAppStore';
import { FALLBACK_VALUE } from '../../utils/formatters';

export const GeoJsonLayer: React.FC = () => {
  const { geoJsonData, activeAlgorithm, mapSettings, setSelectedNodeDetails, activeTileLayer } = useAppStore();
  const map = useMap();

  useEffect(() => {
    if (geoJsonData) {
      // Opzionale: fitta la mappa ai bordi del geojson
      // const bounds = L.geoJSON(geoJsonData).getBounds();
      // if (bounds.isValid()) map.fitBounds(bounds);
    }
  }, [geoJsonData, map]);

  // ATTENZIONE: Gli hook di React (come useCallback) devono essere SEMPRE chiamati 
  // in cima al componente, PRIMA di qualsiasi "return" condizionale (if (!geoJsonData) return null).
  const style = useCallback((feature: any) => {
    if (feature.geometry.type === "LineString") {
      const currentColors = mapSettings.edgeColors[activeTileLayer] || mapSettings.edgeColors.dark;
      return {
        color: activeAlgorithm === 'raw' ? currentColors.raw : currentColors.default,
        weight: mapSettings.edgeWeight,
        opacity: mapSettings.edgeOpacity
      };
    }
    return {};
  }, [activeAlgorithm, mapSettings, activeTileLayer]);

  const pointToLayer = useCallback((feature: any, latlng: any) => {
    if (feature.properties.type === "node") {
      const commId = feature.properties.community_id;
      let bgColor = feature.properties.color || '#333333';

      if (activeAlgorithm === 'raw') {
        bgColor = mapSettings.rawNodeColor;
      }

      const displayId = (activeAlgorithm === 'raw' || commId === -1 || commId === undefined) ? '' : commId;

      // Usiamo lo stesso HTML del legacy frontend, incluse le classi definite in index.css
      const htmlContent = `<div class="node-circle" style="background-color: ${bgColor}; width: ${mapSettings.nodeSize}px; height: ${mapSettings.nodeSize}px;">${displayId}</div>`;

      const customIcon = L.divIcon({
        className: 'node-icon-container',
        html: htmlContent,
        iconSize: [mapSettings.nodeSize, mapSettings.nodeSize],
        iconAnchor: [mapSettings.nodeSize / 2, mapSettings.nodeSize / 2]
      });

      return L.marker(latlng, { icon: customIcon });
    }
    return L.circleMarker(latlng);
  }, [activeAlgorithm, mapSettings]);

  const onEachFeature = useCallback((feature: any, layer: L.Layer) => {
    if (feature.properties.type === "node") {
      layer.on({
        click: () => {
          setSelectedNodeDetails({
            ...feature.properties,
            id: feature.id || feature.properties.id || 'Unknown',
            long_name: feature.properties.long_name || FALLBACK_VALUE,
          });
        }
      });
    }
  }, [setSelectedNodeDetails]);

  // Il return condizionale deve stare DOPO la definizione di tutti gli hook!
  if (!geoJsonData) return null;

  // Usiamo una chiave per forzare il re-render di react-leaflet quando i dati cambiano
  return (
    <GeoJSON
      key={`${activeAlgorithm}-${geoJsonData.features?.length || 0}`}
      data={geoJsonData}
      style={style}
      pointToLayer={pointToLayer}
      onEachFeature={onEachFeature}
    />
  );
};
