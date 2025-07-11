import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/tours';

export const tourApi = {
  getAll: async () => {
    const response = await axios.get(API_BASE_URL);
    console.log("Fetched tours:", response.data);
    return response.data;
  },

  getTours: async (page: number, limit: number) => {
    const response = await axios.get(`${API_BASE_URL}?page=${page}&limit=${limit}`);
    return response.data;
  },

  getByIsActive: async (isActive: boolean) => {
    const response = await axios.get(`${API_BASE_URL}?is_active=${isActive}`);
    return response.data;
  },

  getByTourCategoryId: async(tourCategoryId: number) => {
    const response = await axios.get(`${API_BASE_URL}?tour_category_id=${tourCategoryId}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  create: async (tourData: any) => {
    const response = await axios.post(API_BASE_URL, tourData);
    return response.data;
  },

  update: async (id: number, tourData: any) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, tourData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  }
};
