import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/tour-categories";

export const tourCategoryAPI = {
    getAll: async () => {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    }
};