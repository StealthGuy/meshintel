import React, { useEffect, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useAppStore } from '../../store/useAppStore';
import { FALLBACK_VALUE } from '../../utils/formatters';

export const GeoJsonLayer: React.FC = () => {
  const { geoJsonData, activeAlgorithm, mapSettings, setSelectedNodeDetails, activeTileLayer } = useAppStore();
  const map = useMap();

  const style = useCallback(() => {
    const currentColors = mapSettings.edgeColors[activeTileLayer] || mapSettings.edgeColors.dark;
    return {
      color: activeAlgorithm === 'raw' ? currentColors.raw : currentColors.default,
      weight: mapSettings.edgeWeight,
      opacity: mapSettings.edgeOpacity,
    };
  }, [activeAlgorithm, mapSettings, activeTileLayer]);

  useEffect(() => {
    if (!geoJsonData) return;

    const totalNodeCount = (geoJsonData.features || []).filter(
      (feature: any) => feature?.properties?.type === 'node',
    ).length;
    const clusterColor = (count: number) => {
      const t = Math.log1p(count) / Math.log1p(Math.max(1, totalNodeCount));
      const blue = [37, 99, 235];
      const red = [220, 38, 38];
      const rgb = blue.map((value, index) => Math.round(value + (red[index] - value) * t));
      return `rgb(${rgb.join(',')})`;
    };

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 55,
      // La modalità raw usa i cluster; Louvain/Leiden mostrano sempre ogni marker.
      disableClusteringAtZoom: activeAlgorithm === 'raw' ? 19 : 0,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      chunkedLoading: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const size = count < 100 ? 'small' : count < 1000 ? 'medium' : 'large';
        return L.divIcon({
          html: `<div class="node-cluster-count" style="background-color:${clusterColor(count)}">${count.toLocaleString()}</div>`, 
          className: `node-cluster node-cluster-${size}`,
          iconSize: L.point(42, 42),
        });
      },
    });

    const nodeFeatures = (geoJsonData.features || []).filter(
      (feature: any) => feature?.properties?.type === 'node',
    );
    const maxDegree = Math.max(1, ...nodeFeatures.map((feature: any) => {
      const properties = feature.properties || {};
      return Number(properties.in_degree || 0) + Number(properties.out_degree || 0);
    }));
    const degreeColor = (degree: number) => {
      // Scala sequenziale blu → rosso: i nodi più connessi risaltano come hub.
      const stops = [
        { at: 0, rgb: [37, 99, 235] },
        { at: 1, rgb: [220, 38, 38] },
      ];
      const t = Math.log1p(degree) / Math.log1p(maxDegree);
      const upper = stops.findIndex((stop) => stop.at >= t);
      const right = stops[Math.max(1, upper)];
      const left = stops[Math.max(0, upper - 1)];
      const ratio = Math.max(0, Math.min(1, (t - left.at) / (right.at - left.at)));
      const rgb = left.rgb.map((value, index) => Math.round(value + (right.rgb[index] - value) * ratio));
      return `rgb(${rgb.join(',')})`;
    };

    const createNodeIcon = (properties: any, zoom: number) => {
      const commId = properties.community_id;
      const degree = Number(properties.in_degree || 0) + Number(properties.out_degree || 0);
      const bgColor = activeAlgorithm === 'raw' ? degreeColor(degree) : properties.color || '#333333';
      const displayId = activeAlgorithm === 'raw' || commId === -1 || commId === undefined ? '' : commId;
      const baseSize = mapSettings.nodeSize;
      const size = activeAlgorithm === 'raw'
        ? baseSize
        : Math.round(Math.min(baseSize * 2.5, baseSize * (1 + Math.max(0, zoom - 6) * 0.13)));
      return L.divIcon({
        className: 'node-icon-container',
        html: `<div class="node-circle" style="background-color:${bgColor};width:${size}px;height:${size}px">${displayId}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    const nodes = L.geoJSON(geoJsonData, {
      filter: (feature) => feature?.properties?.type === 'node',
      pointToLayer: (feature, latlng) => {
        const properties = feature.properties || {};
        const degree = Number(properties.in_degree || 0) + Number(properties.out_degree || 0);
        return L.marker(latlng, {
          icon: createNodeIcon(properties, map.getZoom()),
          title: `Grado del nodo: ${degree}`,
        });
      },
      onEachFeature: (feature, layer) => {
        layer.on('click', () => {
          setSelectedNodeDetails({
            ...feature.properties,
            id: feature.id || feature.properties?.id || 'Unknown',
            long_name: feature.properties?.long_name || FALLBACK_VALUE,
          });
        });
      },
    });

    const edges = L.geoJSON(geoJsonData, {
      filter: (feature) => feature?.properties?.type !== 'node',
      style,
      interactive: false,
    });

    clusterGroup.addLayer(nodes);
    clusterGroup.addTo(map);
    edges.addTo(map);
    const resizeCommunityMarkers = () => {
      if (activeAlgorithm === 'raw') return;
      nodes.eachLayer((layer) => {
        const marker = layer as L.Marker & { feature?: any };
        if (marker.feature?.properties) {
          marker.setIcon(createNodeIcon(marker.feature.properties, map.getZoom()));
        }
      });
    };
    map.on('zoomend', resizeCommunityMarkers);

    // Mostra un arco solo quando entrambi i nodi estremi sono marker visibili,
    // non membri di un cluster aggregato. Così gli archi non restano sospesi.
    const nodeMarkers = new Map<string, L.Marker>();
    nodes.eachLayer((layer) => {
      const marker = layer as L.Marker & { feature?: any };
      const id = marker.feature?.id ?? marker.feature?.properties?.id;
      if (id !== undefined) nodeMarkers.set(String(id), marker);
    });

    const updateEdgesVisibility = () => {
      edges.eachLayer((layer) => {
        const line = layer as L.Path & { feature?: any };
        const properties = line.feature?.properties || {};
        const source = nodeMarkers.get(String(properties.source));
        const target = nodeMarkers.get(String(properties.target));
        const sourceVisible = source && clusterGroup.getVisibleParent(source) === source;
        const targetVisible = target && clusterGroup.getVisibleParent(target) === target;
        const visible = activeAlgorithm !== 'raw' || Boolean(sourceVisible && targetVisible);
        line.setStyle({
          opacity: visible ? mapSettings.edgeOpacity : 0,
          weight: mapSettings.edgeWeight,
        });
      });
    };

    clusterGroup.on('animationend spiderfied unspiderfied', updateEdgesVisibility);
    map.on('zoomend', updateEdgesVisibility);
    updateEdgesVisibility();

    return () => {
      clusterGroup.off('animationend spiderfied unspiderfied', updateEdgesVisibility);
      map.off('zoomend', updateEdgesVisibility);
      map.off('zoomend', resizeCommunityMarkers);
      map.removeLayer(clusterGroup);
      map.removeLayer(edges);
    };
  }, [geoJsonData, map, activeAlgorithm, mapSettings, activeTileLayer, setSelectedNodeDetails, style]);

  return null;
};
