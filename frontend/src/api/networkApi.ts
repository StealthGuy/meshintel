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


  getNode: async (id: string) => {
    // Solo per sviluppo. In produzione lo store usa il lookup locale dal GeoJSON.
    if (!isDev) return null;
    const response = await axios.get(`/api/nodes/${id}`);
    return response.data;
  },

  getRobustness: async () => {
    const response = await axios.get(apiUrl('robustness'));
    return response.data;
  },
};
