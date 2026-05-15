import { create } from 'zustand';
import { networkApi } from '../api/networkApi';

interface NodeStatItem {
  label: string;
  count: number;
}

interface NodeStatsReport {
  roles: NodeStatItem[];
  hardware: NodeStatItem[];
  mqtt: NodeStatItem[];
}

interface ReportData {
  connectivity: {
    nodes: number;
    edges: number;
    density: number;
    avg_degree: number;
    avg_clustering: number;
    diameter: number;
  };
  centrality: {
    top_betweenness: Array<{id: string, name: string, value: number}>;
  };
  distances: {
    diameter: number;
    avg_path_length: number;
    distribution: Record<string, number>;
  };
  degree_distribution: {
    in_degree: Record<string, number>;
    out_degree: Record<string, number>;
    assortativity: number;
  };
  stats: NodeStatsReport;
}

interface MapSettings {
  edgeWeight: number;
  edgeOpacity: number;
  nodeSize: number;
  rawNodeColor: string;
  edgeColors: {
    dark: { raw: string; default: string };
    topo: { raw: string; default: string };
  };
}

interface DeviceMetric {
  battery_level?: number;
  battery_voltage?: number;
  channel_utilization?: number;
  air_util_tx?: number;
  uptime_seconds?: string | number;
}

interface GatewayNode {
  id: string;
  long_name?: string;
  short_name?: string;
  hardware?: string;
  last_device_metric?: DeviceMetric;
  last_position?: { latitude: number | string; longitude: number | string };
}

interface NodeDetails {
  id: string;
  short_name?: string;
  long_name?: string;
  role?: string;
  community_id?: number;
  color?: string;
  hardware?: string;
  fw_version?: string;
  frequency?: string;
  cluster_code?: string;
  public_key?: string;
  routing_enabled?: number;
  last_heard?: string;
  channel?: { id: number; name: string };
  gateway_node?: GatewayNode;
  last_position?: { latitude: number | string; longitude: number | string };
  last_device_metric?: DeviceMetric;
}

interface RobustnessItem {
  strategy: string;
  nodes_to_50_percent: number;
  auc: number;
}

interface RobustnessReport {
  plot_base64: string;
  best_strategy: string;
  summary: RobustnessItem[];
}

interface AppState {
  activeAlgorithm: 'raw' | 'louvain' | 'leiden';
  setActiveAlgorithm: (algo: 'raw' | 'louvain' | 'leiden') => void;
  selectedNodeId: string | null;
  selectedNodeDetails: NodeDetails | null;
  setSelectedNodeDetails: (details: NodeDetails | null) => void;
  fetchNodeDetails: (id: string) => Promise<void>;
  nodeError: string | null;

  report: ReportData | null;
  isLoadingReport: boolean;
  fetchReport: (forceRefresh?: boolean) => Promise<void>;

  robustness: RobustnessReport | null;
  isLoadingRobustness: boolean;
  fetchRobustness: (forceRefresh?: boolean) => Promise<void>;

  geoJsonCache: Record<string, any>;
  geoJsonData: any | null;
  isLoadingMap: boolean;
  fetchMapData: (algo: string, forceRefresh?: boolean) => Promise<void>;

  activeTileLayer: 'dark' | 'topo';
  setActiveTileLayer: (layer: 'dark' | 'topo') => void;

  mapSettings: MapSettings;
  updateMapSettings: (settings: Partial<MapSettings>) => void;

  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeAlgorithm: 'raw',
  setActiveAlgorithm: (algo) => {
    set({ activeAlgorithm: algo });
    get().fetchMapData(algo); // Fetch when algo changes
  },

  selectedNodeId: null,
  selectedNodeDetails: null,
  setSelectedNodeDetails: (details) => set({
    selectedNodeDetails: details,
    selectedNodeId: details ? details.id : null,
    nodeError: null
  }),
  nodeError: null,
  fetchNodeDetails: async (id: string) => {
    set({ nodeError: null });
    try {
      const data = await networkApi.getNode(id);
      if (data) {
        set((state) => ({
          selectedNodeDetails: { ...state.selectedNodeDetails, ...data },
          nodeError: null
        }));
      }
    } catch (error: any) {
      console.error('Failed to fetch node details', error);
      if (error.response?.status === 404) {
        set({ nodeError: 'Node data not found on server' });
      } else {
        set({ nodeError: 'Failed to synchronize node telemetry data' });
      }
    }
  },

  report: null,
  isLoadingReport: false,
  fetchReport: async (forceRefresh = false) => {
    const { report } = get();
    if (!forceRefresh && report) {
      return; // Return immediately if report is already in cache
    }

    set({ isLoadingReport: true });
    try {
      const data = await networkApi.getReport();
      set({ report: data, isLoadingReport: false });
    } catch (error) {
      console.error('Failed to fetch report', error);
      set({ isLoadingReport: false });
    }
  },

  robustness: null,
  isLoadingRobustness: false,
  fetchRobustness: async (forceRefresh = false) => {
    const { robustness } = get();
    if (!forceRefresh && robustness) {
      return;
    }

    set({ isLoadingRobustness: true });
    try {
      const data = await networkApi.getRobustness();
      set({ robustness: data, isLoadingRobustness: false });
    } catch (error) {
      console.error('Failed to fetch robustness report', error);
      set({ isLoadingRobustness: false });
    }
  },

  geoJsonCache: {},
  geoJsonData: null,
  isLoadingMap: false,
  fetchMapData: async (algo: string, forceRefresh = false) => {
    const { geoJsonCache } = get();

    // Se abbiamo già i dati in cache e non stiamo forzando un refresh, usiamo quelli
    if (!forceRefresh && geoJsonCache[algo]) {
      set({ geoJsonData: geoJsonCache[algo] });
      return;
    }

    // IMPORTANT: Clear the old data so React-Leaflet doesn't mount the old data 
    // under the new activeAlgorithm's key while waiting for the network.
    set({ isLoadingMap: true, geoJsonData: null });
    try {
      const data = await networkApi.getGeoJson(algo);
      set((state) => ({
        geoJsonData: data,
        geoJsonCache: { ...state.geoJsonCache, [algo]: data },
        isLoadingMap: false
      }));
    } catch (error) {
      console.error('Failed to fetch geojson', error);
      set({ isLoadingMap: false });
    }
  },

  activeTileLayer: 'dark',
  setActiveTileLayer: (layer) => set({ activeTileLayer: layer }),

  mapSettings: {
    edgeWeight: 0.6,
    edgeOpacity: 0.25,
    nodeSize: 12,
    rawNodeColor: '#d5e3fc', // surface-tint (blu deciso)
    edgeColors: {
      dark: {
        raw: '#ffffff', // on-primary / surface-container-lowest
        default: '#f7f9fb' // surface / background
      },
      topo: {
        raw: '#ffffff', // on-primary / surface-container-lowest
        default: '#f7f9fb' // surface / background
      }
    }
  },
  updateMapSettings: (settings) => set((state) => ({
    mapSettings: { ...state.mapSettings, ...settings }
  })),

  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
}));
