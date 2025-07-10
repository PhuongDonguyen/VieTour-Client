import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/tour_prices';

export const tourPriceApi = {
  getAll: async () => {
    const response = await axios.get(API_BASE_URL);
    console.log("Fetched tour prices:", response.data);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  create: async (tourPriceData: any) => {
    const response = await axios.post(API_BASE_URL, tourPriceData);
    return response.data;
  },

  update: async (id: number, tourPriceData: any) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, tourPriceData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  getAllSorted: async () => {
    const response = await axios.get(`${API_BASE_URL}/sorted`);
    return response.data;
  }
};
