import axios from 'axios';

// In sviluppo (npm run dev) → chiama FastAPI su localhost:8000 tramite proxy Vite
// In produzione (npm run build) → legge file JSON statici pre-generati dalla CI
const isDev = import.meta.env.DEV;

function apiUrl(endpoint: string): string {
  return isDev ? `/api/${endpoint}` : `/data/${endpoint}.json`;
}

export const networkApi = {
  getReport: async () => {
    const response = await axios.get(apiUrl('report'));
    return response.data;
  },

  getGeoJson: async (algorithm: string) => {
    // In dev → /api/geojson/louvain | in prod → /data/geojson_louvain.json
    const url = isDev
      ? `/api/geojson/${algorithm}`
      : `/data/geojson_${algorithm}.json`;
    const response = await axios.get(url);
    return response.data;
  },

  getAnomalies: async () => {
    // Le anomalie non hanno un file statico pre-generato (dati real-time)
    // In produzione non sono disponibili
    if (!isDev) {
      console.warn('Anomalies endpoint not available in production static mode.');
      return { status: 'unavailable', data: [] };
    }
    const response = await axios.get('/api/anomalies');
    return response.data;
  },

  getNode: async (id: string) => {
    // I dettagli dei nodi non sono pre-generati come file statici individuali
    // In produzione, i dati del nodo vengono estratti dal GeoJSON raw
    if (!isDev) {
      console.warn(`Node detail endpoint not available in static mode for node: ${id}`);
      return null;
    }
    const response = await axios.get(`/api/nodes/${id}`);
    return response.data;
  },

  getRobustness: async () => {
    const response = await axios.get(apiUrl('robustness'));
    return response.data;
  },
};
