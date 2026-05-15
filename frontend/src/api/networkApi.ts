import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:8000/api`;

export const networkApi = {
  getReport: async () => {
    const response = await axios.get(`${API_BASE_URL}/report`);
    return response.data;
  },
  getGeoJson: async (algorithm: string) => {
    const response = await axios.get(`${API_BASE_URL}/geojson/${algorithm}`);
    return response.data;
  },
  getAnomalies: async () => {
    const response = await axios.get(`${API_BASE_URL}/anomalies`);
    return response.data;
  },
  getNode: async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/nodes/${id}`);
    return response.data;
  },
  getRobustness: async () => {
    const response = await axios.get(`${API_BASE_URL}/robustness`);
    return response.data;
  }
};
