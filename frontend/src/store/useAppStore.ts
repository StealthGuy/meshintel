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
  is_licensed?: number;
  has_mqtt?: number;
  last_heard?: string;
  channel?: { id: number; name: string };
  gateway_node?: GatewayNode;
  last_position?: { latitude: number | string; longitude: number | string; altitude?: number };
  last_device_metric?: DeviceMetric;
  betweenness_centrality?: number;
  suggested_role?: string;
  role_threshold?: number;
  role_reason?: string;
  role_mismatch?: boolean;
}

export interface SuggestionNode {
  id: string;
  long_name: string;
  role: string;
  betweenness_centrality: number;
  suggested_role: string;
  reason: string;
}

export interface SuggestionsReport {
  threshold: number;
  hidden_backbones: SuggestionNode[];
  under_utilized_routers: SuggestionNode[];
  total_nodes: number;
  mismatched_count: number;
  correct_count: number;
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
  useMqttReport: boolean;
  setUseMqttReport: (value: boolean) => void;

  robustness: RobustnessReport | null;
  isLoadingRobustness: boolean;
  fetchRobustness: (forceRefresh?: boolean) => Promise<void>;

  roleSuggestions: SuggestionsReport | null;
  isLoadingRoleSuggestions: boolean;
  fetchRoleSuggestions: (forceRefresh?: boolean) => Promise<void>;

  geoJsonCache: Record<string, any>;
  geoJsonData: any | null;
  isLoadingMap: boolean;
  fetchMapData: (algo: string, forceRefresh?: boolean) => Promise<void>;

  isLoadingNodeDetails: boolean; // NEW

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
  isLoadingNodeDetails: false,
  fetchNodeDetails: async (id: string) => {
    const { isLoadingNodeDetails, selectedNodeDetails } = get();
    
    // Guard: Don't fetch if already loading
    if (isLoadingNodeDetails) {
      return;
    }

    // Se abbiamo già i dettagli completi (es. c'è last_heard), non rifacciamo il fetch
    if (selectedNodeDetails && selectedNodeDetails.id === id && selectedNodeDetails.last_heard) {
      return;
    }

    set({ nodeError: null, isLoadingNodeDetails: true });
    
    // In produzione o se non siamo in dev, cerchiamo i dati nel GeoJSON già caricato
    if (!import.meta.env.DEV) {
      let { geoJsonData } = get();

      // COLD START: Se la mappa non è caricata (es. refresh sulla pagina dettagli), carichiamola
      if (!geoJsonData) {
        await get().fetchMapData(get().activeAlgorithm);
        geoJsonData = get().geoJsonData;
      }

      if (geoJsonData && geoJsonData.features) {
        const feature = geoJsonData.features.find((f: any) => f.id === id);
        if (feature) {
          set({ 
            selectedNodeDetails: feature.properties,
            nodeError: null,
            isLoadingNodeDetails: false
          });
          return;
        }
      }
      // Se non lo troviamo nel GeoJSON dopo il caricamento, diamo l'errore
      set({ 
        nodeError: 'Node data not available in current map view. Try refreshing the map.',
        isLoadingNodeDetails: false
      });
      return;
    }

    // In sviluppo, continuiamo a usare l'API live per comodità
    try {
      const data = await networkApi.getNode(id);
      if (data) {
        set({
          selectedNodeDetails: data, // FIX: Overwrite instead of merge to avoid state pollution
          nodeError: null,
          isLoadingNodeDetails: false
        });
      } else {
        set({ isLoadingNodeDetails: false });
      }
    } catch (error: any) {
      console.error('Failed to fetch node details', error);
      if (error.response?.status === 404) {
        set({ nodeError: 'Node data not found on server', isLoadingNodeDetails: false });
      } else {
        set({ nodeError: 'Failed to synchronize node telemetry data', isLoadingNodeDetails: false });
      }
    }
  },

  report: null,
  isLoadingReport: false,
  useMqttReport: false,
  setUseMqttReport: (val) => {
    set({ useMqttReport: val });
    get().fetchReport(true);
  },
  fetchReport: async (forceRefresh = false) => {
    const { report, isLoadingReport, useMqttReport } = get();
    
    // Guard: Don't fetch if already loading
    if (isLoadingReport) return;

    if (!forceRefresh && report) {
      return; // Return immediately if report is already in cache
    }

    set({ isLoadingReport: true });
    try {
      const data = await networkApi.getReport(useMqttReport);
      set({ report: data, isLoadingReport: false });
    } catch (error) {
      console.error('Failed to fetch report', error);
      set({ isLoadingReport: false });
    }
  },

  robustness: null,
  isLoadingRobustness: false,
  fetchRobustness: async (forceRefresh = false) => {
    const { robustness, isLoadingRobustness } = get();
    
    // Guard: Don't fetch if already loading
    if (isLoadingRobustness) return;

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

  roleSuggestions: null,
  isLoadingRoleSuggestions: false,
  fetchRoleSuggestions: async (forceRefresh = false) => {
    const { roleSuggestions, isLoadingRoleSuggestions } = get();
    
    if (isLoadingRoleSuggestions) return;

    if (!forceRefresh && roleSuggestions) {
      return;
    }

    set({ isLoadingRoleSuggestions: true });
    try {
      const data = await networkApi.getRoleSuggestions();
      set({ roleSuggestions: data, isLoadingRoleSuggestions: false });
    } catch (error) {
      console.error('Failed to fetch role suggestions', error);
      set({ isLoadingRoleSuggestions: false });
    }
  },

  geoJsonCache: {},
  geoJsonData: null,
  isLoadingMap: false,
  fetchMapData: async (algo: string, forceRefresh = false) => {
    const { geoJsonCache, isLoadingMap } = get();

    // Guard: Don't fetch if already loading same algo
    if (isLoadingMap) return;

    // Se stiamo forzando un refresh, svuotiamo la cache per l'algoritmo corrente
    if (forceRefresh) {
      set((state) => {
        const newCache = { ...state.geoJsonCache };
        delete newCache[algo];
        return { geoJsonCache: newCache };
      });
    }

    // Se abbiamo già i dati in cache, usiamo quelli
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
